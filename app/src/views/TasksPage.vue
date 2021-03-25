<template>
	<div v-if="!loading" class="tasks">
		<div v-for="problem in problems" :key="problem.id" class="task">
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
				@failed="appendProblemsForFail"
				@initiallyFailed="canFetchMore && loadNewProblems($event)"
			/>
		</div>
	</div>
	<div v-else>loading...</div>
</template>

<script>
	import Task from '@/components/Task';
	import { getTasks } from '../api';

	export default {
		name: 'TasksPage',
		components: {
			Task,
		},
		data() {
			return {
				problems: [],
				loading: false,

				problemsPromises: [],
				canFetchMore: true,

				//TODO в vuex
				amountOfNewProblemsForFail: 2,
			};
		},
		computed: {
			used() {
				return this.problems.map(({ id }) => id);
			},
			sortedTasks() {
				return this.tasks.sort(
					({ issueA }, { issueB }) => parseInt(issueA) - parseInt(issueB),
				);
			},
		},
		created() {
			const { subjectPrefix, issue } = this.$route.params;

			if (localStorage.getItem('problems')) {
				this.problems = JSON.parse(localStorage.getItem('problems'));
			} else {
				this.loading = true;
				getTasks(subjectPrefix, issue, { amount: 1 })
					.then((t) => {
						this.problems = t.map((task) => ({ ...task, visible: true }));
						localStorage.setItem('problems', JSON.stringify(this.problems));
						this.loading = false;
					})
					.catch((e) => this.$router.push({ name: 'Page404' }));
			}
		},
		beforeRouteLeave() {
			localStorage.removeItem('problems');
		},
		methods: {
			removeProblem(problem) {
				problem.visible = false;

				if (this.problems.every(({ visible }) => !visible)) {
					this.$router.push({
						name: 'Topic',
						params: { subjectPrefix: this.$route.params.subjectPrefix },
					});
				}
			},
			async appendProblemsForFail() {
				if (this.problemsPromises.length > 0) {
					const newProblems = await this.problemsPromises.shift();

					this.problems = [
						...this.problems,
						...newProblems.map((prob) => ({ ...prob, visible: true })),
					];
				}
			},
			async loadNewProblems(issue) {
				if (this.canFetchMore) {
					const promise = this.getMoreProblems(this.amountOfNewProblemsForFail, issue);

					promise.then((res) => {
						if (res.length < this.amountOfNewProblemsForFail) {
							this.canFetchMore = false;
						}
					});

					this.problemsPromises = [...this.problemsPromises, promise];
				}
			},
			async getMoreProblems(amount, issue) {
				const { subjectPrefix } = this.$route.params;

				return await getTasks(subjectPrefix, issue, { amount, used: this.used });
			},
		},
		watch: {
			canFetchMore() {
				if (!this.canFetchMore) alert('Невозможно получить больше задач');
			},
			problems() {
				localStorage.setItem('problems', JSON.stringify(this.problems));
			},
		},
	};
</script>

<style></style>
