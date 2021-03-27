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

				<div class="btns">
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
						@click="this.state = 'solved'"
						v-if="this.state != 'solved'"
					>
						Ответ верный
					</button>
				</div>
			</div>
		</template>
		<div v-else class="problem-check btn" @click="handleCheck">Проверить</div>
		<div
			class="problem-removeProgressBar"
			:style="{
				width: `${removeProgress}%`,
				backgroundColor: borderColor,
				transition: `${this.removeDelay / 100}s`,
			}"
		></div>

		<div class="problem-close" @click="$emit('remove'), $emit(state)">x</div>
	</div>
</template>

<script>
	import { mapState } from 'vuex';
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

				if (this.userInput === this.answer) {
					this.state = taskStates.solved;
				} else {
					this.state = taskStates.failed;
					this.$emit('initiallyFailed', this.issue);
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

	.problem-removeProgressBar {
		margin-top: 10px;
		height: 3px;
		margin-bottom: 0;
	}
</style>
