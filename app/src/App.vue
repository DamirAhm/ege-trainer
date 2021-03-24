<template>
	<div class="container">
		<router-view />
	</div>
</template>

<style>
	:root {
		font-family: Roboto, sans-serif;
		font-size: 1rem;
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
