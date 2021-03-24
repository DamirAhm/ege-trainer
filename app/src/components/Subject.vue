<template>
	<div class="subject">
		<div v-if="this.subject.subsubjects.length > 1">
			<p class="subject-title nested">≡ {{ this.subject.title }}</p>

			<div class="subject-subsubjects">
				<router-link
					v-for="subsubject in subject.subsubjects"
					:to="`/topics/${subsubject.prefix}`"
					:key="subsubject.title"
				>
					{{ subsubject.title }}
				</router-link>
			</div>
		</div>
		<router-link
			v-else
			class="subject-title"
			:to="`/topics/${this.subject.subsubjects[0].prefix}`"
		>
			{{ this.subject.title }}
		</router-link>
	</div>
</template>

<script>
	export default {
		name: 'Subject',
		props: {
			subject: Object,
		},
	};
</script>

<style>
	.subject {
		position: relative;
	}
	.subject:hover {
		text-decoration: underline;
	}

	.subject-title {
		font-size: 1.3rem;
		cursor: pointer;
		padding: 5px;
	}
	.subject-title:not(.nested):hover {
		color: rgb(94, 179, 94);
	}

	.subject-subsubjects {
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
	.subject-subsubjects > * {
		padding: 20px;
		border-radius: 5px;
	}
	.subject-subsubjects > *:hover {
		background-color: rgb(134, 207, 134);
	}
	.subject:hover .subject-subsubjects {
		display: flex;
	}
</style>
