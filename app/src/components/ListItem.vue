<template>
	<div class="item">
		<div v-if="this.nested && this.nested.length > 1">
			<p class="item-title nested">≡ {{ this.element.title }}</p>

			<div class="item-nested">
				<slot v-for="i in this.nested" :key="i.title" :element="i" :title="i.title"></slot>
			</div>
		</div>
		<div class="item-title" v-else-if="this.nested !== undefined">
			<slot :title="this.element.title" :element="this.nested[0]"></slot>
		</div>
		<div class="item-title" v-else>
			<slot :title="this.element.title" :element="this.element"></slot>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'ListItem',
		props: {
			element: Object,
			nested: Array,
		},
	};
</script>

<style>
	.item {
		position: relative;
	}
	.item:hover {
		text-decoration: underline;
	}

	.item-title {
		font-size: 1.3rem;
		cursor: pointer;
		padding: 5px;
	}
	.item-title:not(.nested):hover a {
		color: rgb(94, 179, 94);
	}

	.item-nested {
		font-size: 1.2rem;

		cursor: pointer;

		position: absolute;
		right: calc(100%);
		top: 0;
		display: none;

		flex-direction: column;

		border: 1px solid black;
		border-radius: 5px;
	}
	.item-nested > * {
		padding: 20px;
		border-radius: 5px;
	}
	.item-nested > *:hover {
		background-color: rgb(134, 207, 134);
	}
	.item:hover .item-nested {
		display: flex;
	}
</style>
