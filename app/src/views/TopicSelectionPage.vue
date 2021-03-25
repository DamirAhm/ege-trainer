<template>
	<div v-if="loading === false && topics.length > 0">
		<ListItem
			v-for="topic in topics"
			:key="topic.title"
			:element="topic"
			v-slot:default="{ element: { issue }, title }"
		>
			<router-link
				:to="`/tasks/${$route.params.subjectPrefix}/${getFinalPath(topic)}`"
				:class="`${topic.selected ? 'selected' : ''}`"
				@drag.prevent="handleSelect(topic)"
			>
				{{ issue }}. {{ title }}
			</router-link>
		</ListItem>
	</div>
	<div v-else>loading...</div>
</template>

<script>
	import { getTopics } from '@/api';
	import ListItem from '@/components/ListItem';

	export default {
		name: 'TopicSelectionPage',
		components: {
			ListItem,
		},
		data() {
			return {
				topics: [],
				loading: false,
			};
		},
		computed: {
			isAnySelected() {
				return this.topics.some(({ selected }) => selected);
			},
		},
		created() {
			this.loading = true;
			getTopics(this.$route.params.subjectPrefix)
				.then((t) => {
					this.topics = t.map((task) => ({ ...task, selected: false }));
					this.loading = false;
				})
				.catch((e) => this.$router.push({ name: 'Page404' }));
		},
		methods: {
			handleSelect(topic) {
				topic.selected = !topic.selected;
			},
			getFinalPath({ issue }) {
				if (!this.isAnySelected) return issue;
				else
					return this.topics
						.filter(({ selected }) => selected)
						.map(({ issue }) => issue)
						.concat(issue)
						.join('+');
			},
		},
	};
</script>

<style scoped>
	.selected:not(.nested) {
		color: var(--green);
	}
	.selected.nested {
		background-color: var(--green);
	}
</style>
