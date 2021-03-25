<template>
	<div class="problem" :id="id" :style="{ borderColor }">
		<div class="problem-issue">{{ issue }}</div>
		<div class="problem-task" v-html="this.task"></div>
		<div class="problem-text">{{ text }}</div>

		<input
			type="text"
			v-model="userInput"
			:disabled="this.state != ''"
			@keydown.enter="handleCheck"
		/>

		<template v-if="solutionVisible">
			<div class="problem-solution" v-html="this.solution"></div>

			<div class="problem-footer">
				<div class="problem-answer">
					<div v-if="this.answerType === 'text'">Ответ: {{ this.answer }}</div>
					<div v-else v-html="this.answer"></div>
				</div>

				<div class="problem-buttons">
					<button
						v-if="progressStoped"
						class="problem-button problem-continueRemoving"
						@click="continueRemoving"
					>
						Продолжить удаление
					</button>
					<button
						v-else
						class="problem-button problem-stopRemoving"
						@click="stopRemoving"
					>
						Остановить удаление
					</button>
					<button
						class="problem-button problem-correctAnswer"
						@click="this.state = 'solved'"
					>
						Ответ верный
					</button>
				</div>
			</div>
		</template>
		<div v-else class="problem-check problem-button" @click="handleCheck">Проверить</div>
		<div
			class="problem-removeProgressBar"
			:style="{
				width: `${removeProgress}%`,
			}"
		></div>
	</div>
</template>

<script>
	import { taskStates } from '../constants';
	//TODO сохранять попользованые задания в локал
	export default {
		name: 'Task',
		props: {
			task: String,
			text: String,
			solution: String,
			answer: String,
			answerType: String,
			issue: String,
			id: String,
		},
		data() {
			return {
				solutionVisible: false,

				userInput: '',
				state: '',

				removeProgress: 0,

				progressInterval: undefined,
				progressStoped: false,
			};
		},
		computed: {
			borderColor() {
				if (this.state === '') return 'black';
				else if (this.state === taskStates.solved) return 'var(--green)';
				else return 'var(--red)';
			},
		},
		beforeUnmount() {
			if (this.progressInterval) clearInterval(this.progressInterval);
		},
		//Добавить эмит на решение задания
		emits: ['remove', 'solved', 'failed', 'initiallyFailed'],
		methods: {
			handleCheck() {
				this.solutionVisible = true;

				if (this.userInput === this.answer) {
					this.state = taskStates.solved;
				} else {
					this.state = taskStates.failed;
					this.$emit('initiallyFailed', this.issue);
				}

				//TODO сделать настраиваемую задержку перед удалением (или убрать удаление)
				this.removeProgress = 100;
				this.progressInterval = setInterval(this.reduceProgress, 100);
			},

			stopRemoving() {
				clearInterval(this.progressInterval);
				this.progressStoped = true;
			},
			continueRemoving() {
				this.progressInterval = setInterval(this.reduceProgress, 100);
				this.progressStoped = false;
			},
			reduceProgress() {
				this.removeProgress--;
			},
		},
		watch: {
			removeProgress() {
				if (this.removeProgress === 0) {
					clearInterval(this.progressInterval);
					this.$emit('remove');
					this.$emit(this.state);
				}
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

	.problem-task,
	.problem-solution_text,
	.problem-answer_text {
		word-break: break-word;
	}

	.problem > *,
	.problem-solution_text {
		margin-bottom: 10px;
	}

	.problem-footer {
		justify-self: center;
		width: calc(100% - 5px);
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.problem-answer,
	.problem-answer_images {
		display: flex;
		align-items: center;
	}

	.problem-buttons button:nth-child(1) {
		margin-right: 10px;
	}
	.problem-button {
		background-color: transparent;
		border: 1px solid black;
		padding: 4px;
		outline: none;
		cursor: pointer;
		border-radius: 3px;
		width: fit-content;
	}
	.problem-button:hover {
		box-shadow: black 0px 0px 2px;
	}

	.problem-removeProgressBar {
		margin-top: 10px;
		height: 3px;
		background-color: var(--red);
		transition: 0.1s;
		margin-bottom: 0;
	}
</style>
