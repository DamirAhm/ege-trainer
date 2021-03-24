<template>
	<div class="tasks">
		<Task
			v-for="problem in problems"
			:key="problem.id"
			:task="problem.task"
			:images="problem.images"
			:text="problem.text"
			:solution="problem.solution"
			:answer="problem.answer"
			:answerType="problem.answerType"
			:id="problem.id"
		/>
	</div>
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
			};
		},
		created() {
			const { subjectPrefix, issue } = this.$route.params;

			this.loading = true;
			getTasks(subjectPrefix, issue, { amount: 5 }).then((t) => {
				this.problems = t;
				this.loading = false;
			});
		},
	};
</script>

<style></style>
