<template>
	<div class="container">
		<BackButton v-if="!isHomepage" />
		<Timer />
		<Settings />
		<router-view />
	</div>
</template>

<script>
	import Settings from './components/Settings';
	import Timer from './components/Timer';
	import BackButton from './components/BackButton';

	export default {
		name: 'App',
		components: {
			Settings,
			Timer,
			BackButton,
		},
		computed: {
			isHomepage() {
				return this.$route.name === 'Subjects';
			},
		},
	};
</script>

<style>
	:root {
		font-family: Roboto, sans-serif;
		font-size: 1rem;
		--green: rgb(94, 179, 94);
		--red: rgb(219, 87, 87);
	}
	* {
		margin: 0;
		padding: 0;
	}
	a {
		color: black;
		text-decoration: none;
	}

	.container {
		min-width: 100vw;
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.btn {
		background-color: transparent;
		border: 1px solid black;
		padding: 4px;
		outline: none;
		cursor: pointer;
		border-radius: 3px;
		width: fit-content;
	}
	.btn:hover,
	.btn:focus {
		border-color: var(--green);
		color: var(--green);
		box-shadow: black 0px 0px 2px;
	}
</style>
