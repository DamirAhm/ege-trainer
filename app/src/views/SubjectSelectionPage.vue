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
	<div v-else-if="error != null" class="error">
		{{ error }}
	</div>
	<div v-else>loading...</div>
</template>

<script>
	import { getSubjects } from '@/api';
	import ListItem from '@/components/ListItem.vue';
	import { mutations } from '../constants';

	export default {
		name: 'SubjectSelectionPage',
		components: {
			ListItem,
		},
		data() {
			return {
				subjects: [],
				loading: false,
				error: null,
			};
		},
		created() {
			if (this.$store.state.subjects !== null) {
				this.subjects = this.$store.state.subjects;
			} else {
				this.loading = true;
				getSubjects()
					.then((s) => {
						this.subjects = s;

						this.loading = false;

						this.$store.commit(mutations.SET_SUBJECTS, this.subjects);
					})
					.catch((e) => (this.error = 'Чот ошибка какая то ¯\\_(ツ)_/¯'));
			}
		},
	};
</script>

<style>
	.error {
		color: var(--red);
		font-size: 1.4rem;
	}
</style>
