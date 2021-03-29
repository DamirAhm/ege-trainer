<template>
	<div v-if="!loading" class="tasks">
		<div
			v-for="problem in problems"
			:key="problem.id"
			class="task"
			:ref="setTaskRef"
			:data-id="problem.id"
		>
			<Task
				v-if="problem.visible"
				:task="problem.task"
				:images="problem.images"
				:text="problem.text"
				:solution="problem.solution"
				:answer="problem.answer"
				:answerType="problem.answerType"
				:id="problem.id"
				:issue="problem.issue"
				@remove="removeProblem(problem)"
				@failed="appendProblemsForFail(problem.id)"
				@solved="removePromise(problem.id)"
				@initiallyFailed="canFetchMore && loadNewProblems(problem)"
			/>
		</div>
	</div>
	<div v-else>loading...</div>
</template>

<script>
	import Task from '@/components/Task';
	import { getTasks } from '../api';
	import { clearStorage, getProblemsInfoFromStorage, updateStorage } from '../utils';
	import { mapState } from 'vuex';
	import { mutations } from '../constants';

	const IS_PROGRESSIVE = true;

	export default {
		name: 'TasksPage',
		components: {
			Task,
		},
		data() {
			return {
				problems: [],
				loading: false,

				problemsPromises: {},
				canFetchMore: true,

				tasksRefs: [],

				//TODO в vuex
			};
		},
		computed: {
			used() {
				const { subjectPrefix } = this.$route.params;
				const usedInSubject = this.$store.state.used[subjectPrefix] ?? [];

				return this.problems.map(({ id }) => id).concat(usedInSubject);
			},
			isAnyProblemVisible() {
				return this.problems.some(({ visible }) => visible);
			},
			...mapState({
				newProblemsForFail: (state) => state.settings.newProblemsForFail,
				initialAmountOfProblems: (state) => state.settings.initialAmountOfProblems,
			}),
		},
		created() {
			const { subjectPrefix, issue } = this.$route.params;
			const { problems: savedProblems, issue: savedIssue } = getProblemsInfoFromStorage();

			if (savedProblems && savedIssue === issue) {
				this.problems = savedProblems;

				if (!this.isAnyProblemVisible) {
					this.$router.push({
						name: 'Topic',
						params: { subjectPrefix: this.$route.params.subjectPrefix },
					});
				}
			} else {
				clearStorage();

				this.loading = true;

				if (IS_PROGRESSIVE) {
					const issues = issue.split('+');

					for (const is of issues) {
						getTasks(subjectPrefix, is, { amount: this.initialAmountOfProblems })
							.then((t) => {
								this.problems = this.problems
									.concat(t.map((task) => ({ ...task, visible: true })))
									.sort(
										({ issue: issueA }, { issue: issueB }) => +issueA - +issueB,
									);
								this.loading = false;

								updateStorage({ problems: this.problems, issue });
							})
							.catch((e) => this.$router.push({ name: 'Page404' }));
					}
				} else {
					getTasks(subjectPrefix, isue, { amount: this.initialAmountOfProblems })
						.then((t) => {
							this.problems = t.map((task) => ({ ...task, visible: true }));
							this.loading = false;

							updateStorage({ problems: this.problems, issue });
						})
						.catch((e) => this.$router.push({ name: 'Page404' }));
				}
			}
		},
		beforeRouteLeave() {
			clearStorage();
			this.saveUsedToStore();
		},
		methods: {
			setTaskRef(el) {
				if (el) {
					this.tasksRefs.push(el);
				}
			},
			removeProblem(problem) {
				problem.visible = false;

				updateStorage({ problems: this.problems });

				if (!this.isAnyProblemVisible && this.problemsPromises[problem.id] === undefined) {
					this.$router.push({
						name: 'Topic',
						params: { subjectPrefix: this.$route.params.subjectPrefix },
					});
				} else if (this.isAnyProblemVisible) {
					this.scrollToFirstVisibleElement();
				}
			},
			scrollToFirstVisibleElement() {
				const firstVisible = this.problems.find(({ visible }) => visible);

				const element = this.tasksRefs.find((el) => el.dataset.id === firstVisible.id);

				if (element) {
					element.querySelector('input')?.focus?.();
					element.scrollIntoView();
				}
			},
			removePromise(id) {
				this.problemsPromises[id] = undefined;
			},
			async appendProblemsForFail(id) {
				if (this.problemsPromises[id]) {
					const newProblems = await this.problemsPromises[id];

					this.problems = [
						...this.problems,
						...newProblems.map((prob) => ({ ...prob, visible: true })),
					];
				}
			},
			async loadNewProblems({ issue, id }) {
				if (this.canFetchMore) {
					const promise = this.getMoreProblems(this.newProblemsForFail, issue);

					promise.then((res) => {
						if (res.length < this.newProblemsForFail) {
							this.canFetchMore = false;
						}
					});

					this.problemsPromises[id] = promise;
				}
			},
			async getMoreProblems(amount, issue) {
				try {
					const { subjectPrefix } = this.$route.params;

					return await getTasks(subjectPrefix, issue, { amount, used: this.used });
				} catch (err) {
					console.error(e);
					return [];
				}
			},
			saveUsedToStore() {
				const { subjectPrefix } = this.$route.params;
				this.$store.commit(mutations.ADD_USED, {
					subjectPrefix,
					used: this.used.filter(
						(id) =>
							this.problems.find(({ id: probId }) => probId === id)?.visible ===
							false,
					),
				});
			},
		},
		watch: {
			canFetchMore() {
				if (!this.canFetchMore) alert('Невозможно получить больше задач');
			},
			problems() {
				updateStorage({ problems: this.problems });
			},
		},
	};
</script>

<style></style>
