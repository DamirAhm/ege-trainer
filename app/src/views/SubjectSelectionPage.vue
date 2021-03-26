<template>
	<div v-if="loading === false && subjects.length > 0">
		<ListItem
			v-for="subject in subjects"
			:key="subject.title"
			:element="subject"
			:nested="subject.subsubjects"
			v-slot:default="{ element, title }"
		>
			<router-link :to="`/topics/${element.prefix}`">
				{{ title }}
			</router-link>
		</ListItem>
	</div>
	<div v-else>loading...</div>
</template>

<script>
	import { getSubjects } from '@/api';
	import ListItem from '@/components/ListItem.vue';

	export default {
		name: 'SubjectSelectionPage',
		components: {
			ListItem,
		},
		data() {
			return {
				subjects: [],
				loading: false,
			};
		},
		created() {
			this.loading = true;
			getSubjects().then((s) => {
				this.subjects = s;

				this.loading = false;
			});
		},
	};
</script>

<style></style>
