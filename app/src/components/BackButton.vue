<template>
	<button class="backButton btn" @click="getBack">
		<LeftArrow :size="20" />
		<span class="text"> Назад </span>
	</button>
</template>

<script>
	import LeftArrow from './icons/LeftArrow';
	import { getBackRoute } from '@/router';

	export default {
		name: 'BackButton',
		components: {
			LeftArrow,
		},
		methods: {
			getBack() {
				const backRoute = getBackRoute(this.$route);
				this.$router.push(backRoute);
			},
		},
	};
</script>

<style scoped>
	.backButton {
		position: fixed;
		top: 20px;
		left: 20px;
		display: flex;
		justify-content: center;
		font-size: 1.2rem;
	}
	.backButton:hover *,
	.backButton:focus * {
		fill: var(--green);
	}

	.text {
		margin-left: 5px;
	}
</style>
