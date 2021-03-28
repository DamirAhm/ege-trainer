<template>
	<div class="problem" :style="{ borderColor }">
		<div class="problem-issue">{{ issue }}</div>
		<div class="problem-task" v-html="this.task"></div>

		<div class="problem-text" v-if="text !== undefined && text.length > 0">
			<button class="btn" v-if="textVisible" @click="textVisible = false">
				Скрыть текст
			</button>
			<button class="btn" v-else @click="textVisible = true">Открыть текст</button>
			<div class="problem-text_value" v-if="textVisible">{{ text }}</div>
		</div>

		<input
			type="text"
			v-model="userInput"
			placeholder="Ответ"
			class="problem-userInput"
			:disabled="state != ''"
			@keydown.enter="handleCheck"
		/>

		<template v-if="solutionVisible">
			<div class="problem-solution" v-if="solution.length < 1000" v-html="solution"></div>

			<div class="problem-footer">
				<div class="problem-answer">
					<div v-if="answerType === 'text'">Ответ: {{ this.answer.join(' | ') }}</div>
					<div v-else v-html="answer"></div>
				</div>

				<div class="problem-buttons">
					<button
						v-if="progressStoped"
						class="btn problem-continueRemoving"
						@click="continueRemoving"
					>
						Продолжить удаление
					</button>
					<button v-else class="btn problem-stopRemoving" @click="stopRemoving">
						Остановить удаление
					</button>
					<button
						class="btn problem-correctAnswer"
						@click="state = 'solved'"
						v-if="state != 'solved'"
					>
						Ответ верный
					</button>
				</div>
			</div>
		</template>
		<button v-else class="problem-check btn" @click="handleCheck">Проверить</button>
		<div
			class="problem-removeProgressBar"
			:style="{
				width: `${removeProgress}%`,
				backgroundColor: borderColor,
				transition: `${removeDelay / 100}s`,
			}"
		></div>

		<button class="problem-close" @click="$emit(state), $emit('remove')">
			x
		</button>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
	import { taskStates } from '../constants';

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
				textVisible: false,

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
			...mapState({
				removeDelay: (state) => state.settings.removeDelay,
				autoRemove: (state) => state.settings.autoRemove,
			}),
		},
		beforeUnmount() {
			if (this.progressInterval) clearInterval(this.progressInterval);
		},
		emits: ['remove', 'solved', 'failed', 'initiallyFailed'],
		methods: {
			handleCheck() {
				this.solutionVisible = true;

				if (this.answer.includes(this.userInput)) {
					this.state = taskStates.solved;
				} else {
					this.state = taskStates.failed;
					this.$emit('initiallyFailed');
				}

				if (this.autoRemove) {
					this.removeProgress = 100;
					this.progressInterval = setInterval(
						this.reduceProgress,
						(this.removeDelay * 1000) / 100,
					);
				}
			},

			stopRemoving() {
				clearInterval(this.progressInterval);
				this.progressStoped = true;
			},
			continueRemoving() {
				this.progressInterval = setInterval(
					this.reduceProgress,
					(this.removeDelay * 1000) / 100,
				);
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
					this.$emit(this.state);
					this.$emit('remove');
				}
			},
		},
	};
</script>

<style>
	.problem {
		max-width: max(43vw, 300px);
		width: 100vw;
		border: 2px solid black;
		border-radius: 7px;
		padding: 8px;
		font-size: 1.1rem;
		margin: 20px 0;
		position: relative;
	}
	.problem-close {
		color: var(--red);
		position: absolute;
		top: 10px;
		right: 10px;
		cursor: pointer;
		border: none;
		background: none;
		font-size: 1.2rem;
		outline: none;
	}
	.problem-close:hover,
	.problem-close:focus {
		transform: scale(1.25);
	}

	.problem-userInput {
		padding: 5px;
		border-radius: 5px;
		border: 1px solid black;
		outline-color: var(--green);
	}

	.problem-text_value {
		margin-top: 10px;
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

	.problem-check {
		display: block;
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

	.problem-buttons button:nth-child(2) {
		margin-left: 10px;
	}

	.problem-removeProgressBar {
		margin-top: 10px;
		height: 3px;
		margin-bottom: 0;
	}
</style>
