<template>
	<div class="problem" :style="{ borderColor }">
		<div class="problem-task">
			{{ this.task }}
		</div>
		<div class="problem-images">
			<img v-for="image in images" :key="image" class="image" src="image" />
		</div>
		<div class="problem-text">{{ this.text }}</div>

		<input
			type="text"
			v-model="userInput"
			:disabled="this.state != ''"
			@keydown.enter="checkAnswer"
		/>

		<template v-if="solutionVisible">
			<div class="problem-solution">
				<div class="problem-solution_text">{{ this.solution.text }}</div>
				<div class="problem-solution_images">
					<img
						v-for="solutionImage in solution.images"
						:key="solutionImage"
						class="problem-solution_image"
						:src="solutionImage"
					/>
				</div>
			</div>

			<div class="problem-footer">
				<div class="problem-answer">Ответ: {{ this.answer }}</div>
				<button class="problem-correctAnswer" @click="this.state = 'solved'">
					Ответ верный
				</button>
			</div>
		</template>
		<div v-else class="problem-check" @click="checkAnswer">Проверить</div>
	</div>
</template>

<script>
	import { taskStates } from '../constants';
	//TODO сохранять попользованые задания в локал
	export default {
		name: 'Task',
		props: {
			task: String,
			images: Array,
			text: String,
			solution: Object,
			answer: String,
			answerType: String,
			id: String,
		},
		data() {
			return {
				solutionVisible: false,

				userInput: '',
				state: '',
			};
		},
		computed: {
			borderColor() {
				if (this.state === '') return 'black';
				else if (this.state === taskStates.solved) return 'rgb(134, 207, 134)';
				else return 'rgb(219, 87, 87)';
			},
		},
		//Добавить эмит на решение задания
		methods: {
			checkAnswer() {
				this.solutionVisible = true;

				this.state =
					this.answer === this.userInput ? taskStates.solved : taskStates.notSolved;
			},
		},
	};
</script>

<style>
	.problem {
		max-width: max(60vw, 300px);
		border: 2px solid black;
		border-radius: 5px;
		padding: 8px;
		font-size: 1.1rem;
		margin: 20px 0;
	}

	.problem > *,
	.problem-solution_text {
		margin-bottom: 10px;
	}

	.problem-check {
		cursor: pointer;
	}

	.problem-footer {
		justify-self: center;
		width: calc(100% - 5px);
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
	}
	.problem-correctAnswer {
		background-color: transparent;
		border: 1px solid black;
		padding: 4px;
		outline: none;
		cursor: pointer;
		border-radius: 3px;
	}
</style>
