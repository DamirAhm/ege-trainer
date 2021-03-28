<template>
	<div>
		<div class="buttons" v-if='!loading'>
			<button class="selectAll btn" @click="selectAll">Выбрать все</button>
			<button class="unselectAll btn" @click="unselectAll">Сбросить выделение</button>
		</div>
		<div v-if="loading === false && topics.length > 0">
			<ListItem
				v-for="topic in topics"
				:key="topic.title"
				:element="topic"
				v-slot:default="{ element: { issue }, title }"
			>
				<router-link
					:to="`/tasks/${$route.params.subjectPrefix}/${getFinalPath(topic)}`"
					:class="`${topic.selected ? 'selected link' : 'link'}`"
					@mousedown="handleSelect(topic)"
				>
					{{ issue }}. {{ title }}
				</router-link>
			</ListItem>
		</div>
		<div v-else>loading...</div>
	</div>
</template>

<script>
	import { getTopics } from '@/api';
	import { clearStorage } from '../utils';
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
		beforeRouteLeave() {
			clearStorage();
		},
		methods: {
			handleSelect(topic) {
				topic.selected = !topic.selected;
			},
			getFinalPath({ issue }) {
				if (!this.isAnySelected) return issue;
				else {
					const issues = this.topics
						.filter(({ selected }) => selected)
						.map(({ issue }) => issue);

					return [...new Set([...issues, issue])].sort((a, b) => a - b).join('+');
				}
			},
			selectAll() {
				this.topics.forEach((p) => (p.selected = true));
			},
			unselectAll() {
				this.topics.forEach((p) => (p.selected = false));
			},
		},
	};
</script>

<style scoped>
	.link {
		user-select: none;
	}
	.selected:not(.nested) {
		color: var(--green);
	}
	.selected.nested {
		background-color: var(--green);
	}

	.buttons {
		width: 100%;
		display: flex;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	.selectAll,
	.unselectAll {
		font-size: 1.2rem;
	}
</style>
