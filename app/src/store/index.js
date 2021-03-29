//@ts-check
import { createStore } from 'vuex';
import { mutations } from '../constants';
import SettingsModule from './Settings';

export default createStore({
	state: {
		used: {},
		subjects: null,
	},
	mutations: {
		[mutations.ADD_USED](state, { subjectPrefix, used }) {
			if (!state.used[subjectPrefix]) state.used[subjectPrefix] = [...used];
			else {
				const newUsed = [...new Set([...state.used[subjectPrefix], ...used])];

				state.used[subjectPrefix] = newUsed;
			}
		},
		[mutations.SET_SETTINGS](state, subjects) {
			state.subjects = subjects;
		},
	},
	modules: {
		settings: SettingsModule,
	},
});
