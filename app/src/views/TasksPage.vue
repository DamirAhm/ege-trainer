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
import Task from "@/components/Task";
import { getTasks } from "../api";
import {
	clearStorage,
	getProblemsInfoFromStorage,
	updateStorage,
} from "../utils";
import { mapState } from "vuex";
import { mutations } from "../constants";
import { getProblemId } from "../utils";

const IS_PROGRESSIVE = true;

export default {
	name: "TasksPage",
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

			return this.problems
				.map(({ id }) => id)
				.map((id) => getProblemId(id))
				.concat(usedInSubject);
		},
		isAnyProblemVisible() {
			return this.problems.some(({ visible }) => visible);
		},
		...mapState({
			newProblemsForFail: (state) => state.settings.newProblemsForFail,
			initialAmountOfProblems: (state) =>
				state.settings.initialAmountOfProblems,
			isAutoscrollOn: (state) => state.settings.isAutoscrollOn,
		}),
	},
	created() {
		const { subjectPrefix, issues } = this.$route.params;
		const {
			problems: savedProblems,
			issues: savedIssues,
		} = getProblemsInfoFromStorage();

		console.log({ savedProblems, savedIssues, issues });

		if (savedProblems && savedIssues === issues) {
			this.problems = savedProblems;

			if (!this.isAnyProblemVisible) {
				this.$router.push({
					name: "Topic",
					params: { subjectPrefix: this.$route.params.subjectPrefix },
				});
			}
		} else {
			clearStorage();

			this.loading = true;

			if (IS_PROGRESSIVE) {
				getTasks(subjectPrefix, issues, {
					amount: this.initialAmountOfProblems,
				})
					.then((issues) => {
						for (const issue in issues) {
							this.problems = this.problems.concat(
								issues[issue].map((task) => ({ ...task, visible: true, issue }))
							);
						}
						this.problems = this.problems.sort(
							({ issue: issueA }, { issue: issueB }) => +issueA - +issueB
						);

						this.loading = false;

						updateStorage({ problems: this.problems, issues });
					})
					.catch((e) => this.$router.push({ name: "Page404" }));
			} else {
				getTasks(subjectPrefix, isue, { amount: this.initialAmountOfProblems })
					.then((t) => {
						this.problems = t.map((task) => ({ ...task, visible: true }));
						this.loading = false;

						updateStorage({ problems: this.problems, issues });
					})
					.catch((e) => this.$router.push({ name: "Page404" }));
			}
		}
	},
	beforeRouteLeave() {
		clearStorage();
		this.saveUsedToStore(this.used);
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

			if (
				!this.isAnyProblemVisible &&
				this.problemsPromises[problem.id] === undefined
			) {
				this.$router.push({
					name: "Topics",
					params: { subjectPrefix: this.$route.params.subjectPrefix },
				});
			} else if (this.isAnyProblemVisible) {
				this.scrollToFirstVisibleElement();
			}
		},
		scrollToFirstVisibleElement() {
			const firstVisible = this.problems.find(({ visible }) => visible);

			const element = this.tasksRefs.find(
				(el) => el.dataset.id === firstVisible.id
			);

			if (element && this.isAutoscrollOn) {
				element.querySelector("input")?.focus?.();
				element.scrollIntoView();
			}
		},
		removePromise(id) {
			this.problemsPromises[id] = undefined;
		},
		async appendProblemsForFail(id) {
			if (this.problemsPromises[id]) {
				const newProblems = await this.problemsPromises[id];
				const newProblemsWithVisibleProp = Object.entries(newProblems).reduce(
					(acc, [issue, problems]) => [
						...acc,
						...problems.map((p) => ({ ...p, visible: true, issue })),
					],
					[]
				);

				this.problems = [...this.problems, ...newProblemsWithVisibleProp];
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
		async getMoreProblems(amount, issues) {
			try {
				const { subjectPrefix } = this.$route.params;

				return await getTasks(subjectPrefix, issues, {
					amount,
					used: this.used,
				});
			} catch (err) {
				console.error(e);
				return [];
			}
		},
		saveUsedToStore(used) {
			const { subjectPrefix } = this.$route.params;
			this.$store.commit(mutations.ADD_USED, {
				subjectPrefix,
				used,
			});
		},
	},
	watch: {
		canFetchMore() {
			if (!this.canFetchMore) alert("Невозможно получить больше задач");
		},
		problems() {
			updateStorage({ problems: this.problems });
		},
	},
};
</script>

<style></style>
