<template>
	<div class="container">
		<Settings />
		<router-view />
	</div>
</template>

<script>
	import Settings from './components/Settings';

	export default {
		name: 'App',
		components: {
			Settings,
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
</style>
