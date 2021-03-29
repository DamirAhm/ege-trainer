<template>
	<div class="timer" :style="{ top: `${isHomepage ? 20 : 60}px` }">
		<div v-if="state === timerStates.none" class="setup">
			<input type="time" v-model="duration" />
			<button class="start btn" @click="state = timerStates.started">Начать</button>
		</div>
		<div v-else-if="[timerStates.started, timerStates.stoped].includes(state)">
			<div class="passed">Прошло {{ timerString }}</div>
			<button
				class="btn"
				@click="state = timerStates.stoped"
				v-if="state === timerStates.started"
			>
				Остановить
			</button>
			<div v-else>
				<button class="btn" @click="state = timerStates.started">Продолжить</button>
				<button class="btn" @click="reset">Сбросить</button>
			</div>
		</div>
		<div v-else-if="state === timerStates.finished">
			<div>Конец</div>
			<button class="btn" @click="reset">Сбросить</button>
		</div>
		<div v-else>Че не должно быть такого</div>
	</div>
</template>

<script>
	import { timerStates } from '@/constants';
	import { getTimerStateFromStorage, setTimerStateInStorage } from '@/utils';

	export default {
		name: 'Timer',
		data() {
			return {
				duration: '00:00',

				timePassed: 0,

				state: timerStates.none,

				interval: null,

				timeUnit: 1000,

				timerStates: timerStates,
			};
		},
		created() {
			const savedTimerState = getTimerStateFromStorage();

			if (savedTimerState) {
				const { duration, timePassed, state } = savedTimerState;
				this.duration = duration ?? this.duration;
				this.state = state ?? this.state;
				this.timePassed = timePassed ?? this.timePassed;
			}
		},
		computed: {
			maxTime() {
				const [hours, minutes] = this.duration
					.match(/(\d{1,2}):(\d{2})/)
					.slice(1, 3)
					.map(Number);

				return (hours * 60 + minutes) * 60;
			},
			timerString() {
				const seconds = Math.floor((this.timePassed % (1000 * 60)) / 1000).toString();
				const minutes = Math.floor(
					((this.timePassed - seconds * 1000) % (1000 * 60 * 60)) / (1000 * 60),
				).toString();
				const hours = Math.floor(
					(this.timePassed - minutes * 60 * 1000 - seconds * 1000) / (1000 * 60 * 60),
				).toString();

				return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(
					2,
					'0',
				)}`;
			},
			isHomepage() {
				return this.$route.name === 'Subjects';
			},
		},
		methods: {
			reset() {
				this.interval = null;
				this.timePassed = 0;
				this.duration = '00:00';
				this.state = timerStates.none;
			},
			countdown() {
				this.timePassed += this.timeUnit;
			},
		},
		watch: {
			timePassed() {
				if (this.timePassed / 1000 > this.maxTime && this.state === timerStates.started) {
					this.state = timerStates.finished;
				}

				if (this.timePassed % 1000 === 0) {
					setTimerStateInStorage({ timePassed: this.timePassed });
				}
			},
			duration() {
				setTimerStateInStorage({ duration: this.duration });
			},
			state() {
				switch (this.state) {
					case timerStates.started: {
						if (this.duration !== '00:00') {
							this.interval = setInterval(this.countdown, this.timeUnit);
						}
						break;
					}
					case timerStates.stoped: {
						clearInterval(this.interval);
						break;
					}
					case timerStates.finished: {
						clearInterval(this.interval);

						alert('Время вышло');
						break;
					}
					case timerStates.none: {
						break;
					}
					default: {
						console.error('Что то не так в таймере');
					}
				}

				setTimerStateInStorage({ state: this.state });
			},
		},
	};
</script>

<style scoped>
	.timer {
		position: fixed;
		left: 20px;
		font-size: 1.1rem;
	}
	.timer input {
		outline-color: var(--green);
		border: 1px solid black;
		padding: 1.5px;
		display: block;
		font-size: 1.1rem;
	}
	.timer input:hover {
		border: 1px solid var(--green);
	}

	.timer .btn {
		margin: 5px 10px 0 0;
		font-size: 1.1rem;
	}
</style>
