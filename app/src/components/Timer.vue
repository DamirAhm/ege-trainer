<template>
	<div class="timer">
		<div v-if="state === timerStates.none" class="setup">
			<input type="time" v-model="duration" />
			<button class="start btn" @click="start">Начать</button>
		</div>
		<div v-else-if="[timerStates.started, timerStates.stoped].includes(state)">
			<div class="passed">Прошло {{ timerString }}</div>
			<button class="btn" @click="stop" v-if="state === timerStates.started">
				Остановить
			</button>
			<div v-else>
				<button class="btn" @click="start">Продолжить</button>
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
		},
		methods: {
			start() {
				if (this.duration !== '00:00') {
					this.state = timerStates.started;

					if (!this.startedAt) this.startedAt = new Date();

					this.interval = setInterval(this.countdown, this.timeUnit);
				}
			},
			stop() {
				this.state = timerStates.stoped;
				clearInterval(this.interval);
			},
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
					clearInterval(this.interval);

					alert('Время вышло');
				}
			},
		},
	};
</script>

<style scoped>
	.timer {
		position: absolute;
		top: 10px;
		left: 10px;
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
