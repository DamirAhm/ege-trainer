<template>
	<div class="settings">
		<GearIcon size="30" @click.stop="visible = !visible" />
		<div v-if="visible" class="settings-form" @click.stop>
			<label>
				Удалять автоматически:
				<input v-model="autoRemove" type="checkbox" class="settings-form_input" />
			</label>
			<label>
				Задержка перед удалением:
				<input
					v-model="removeDelay"
					:disabled="!autoRemove"
					max="99"
					min="0"
					type="number"
					class="settings-form_input"
				/>
			</label>
			<label>
				Изначально задач каждого типа:
				<input
					v-model="initialAmountOfProblems"
					type="number"
					class="settings-form_input"
				/>
			</label>
			<label>
				Новых задач за ошибку:
				<input v-model="newProblemsForFail" type="number" class="settings-form_input" />
			</label>
		</div>
	</div>
</template>

<script>
	import GearIcon from '@/components/GearIcon';
	import { mutations } from '../constants';
	import { updateSettingsInStorage, getSettingsFromStorage } from '../utils';

	export default {
		name: 'Settings',
		components: {
			GearIcon,
		},
		data() {
			return {
				visible: false,
			};
		},
		created() {
			const savedSettings = getSettingsFromStorage();

			if (savedSettings) {
				this.commitUpdates(savedSettings);
			}

			document.addEventListener('click', this.handleClose);
		},
		beforeUnmount() {
			document.removeEventListener('click', this.handleClose);
		},
		computed: {
			mutationName() {
				return `settings/${mutations.SET_SETTINGS}`;
			},
			autoRemove: {
				get() {
					return this.$store.state.settings.autoRemove;
				},
				set(value) {
					this.commitUpdates({ autoRemove: value });
				},
			},
			removeDelay: {
				get() {
					return this.$store.state.settings.removeDelay;
				},
				set(value) {
					this.commitUpdates({
						removeDelay: +value,
					});
				},
			},
			initialAmountOfProblems: {
				get() {
					return this.$store.state.settings.initialAmountOfProblems;
				},
				set(value) {
					this.commitUpdates({ initialAmountOfProblems: +value });
				},
			},
			newProblemsForFail: {
				get() {
					return this.$store.state.settings.newProblemsForFail;
				},
				set(value) {
					this.commitUpdates({ newProblemsForFail: +value });
				},
			},
		},
		methods: {
			handleClose() {
				this.visible = false;
			},
			commitUpdates(newSettings) {
				this.$store.commit(this.mutationName, newSettings);
			},
		},
		watch: {
			autoRemove() {
				updateSettingsInStorage(this.$store.state.settings);
			},
			removeDelay() {
				updateSettingsInStorage(this.$store.state.settings);
			},
			initialAmountOfProblems() {
				updateSettingsInStorage(this.$store.state.settings);
			},
			newProblemsForFail() {
				updateSettingsInStorage(this.$store.state.settings);
			},
		},
	};
</script>

<style scoped>
	.settings {
		position: absolute;
		top: 20px;
		right: 20px;
	}

	.settings-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20px 0;
		background-color: #fff;
		position: absolute;
		right: 0;
		top: calc(100% + 10px);
		width: 20rem;
		border: 1px solid black;
		border-radius: 7px;
	}

	.settings-form label {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		width: fit-content;
	}
	.settings-form label:not(:last-child) {
		margin-bottom: 15px;
	}
	.settings-form_input {
		padding: 2px;
		margin-left: 4px;
	}
	.settings-form_input[type='number'] {
		width: 2rem;
	}
</style>
