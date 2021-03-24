<template>
	<div v-if="loading === false && topics.length > 0">
		<ListItem
			v-for="topic in topics"
			:key="topic.title"
			:element="topic"
			v-slot:default="{ element: { issue }, title }"
		>
			<router-link :to="`/tasks/${this.$route.params.subjectPrefix}/${issue}`">
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
		created() {
			this.loading = true;
			getTopics(this.$route.params.subjectPrefix).then((t) => {
				this.topics = t;
				this.loading = false;
			});
		},
	};
</script>

<style></style>
