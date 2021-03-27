import { createStore } from 'vuex';
import SettingsModule from './Settings';

export default createStore({
	state: {
		used: {},
	},
	mutations: {
		addUsed(state, { subjectPrefix, used }) {
			if (!state.used[subjectPrefix]) state.used[subjectPrefix] = [...used];
			else {
				const newUsed = [...new Set([...state.used[subjectPrefix], ...used])];

				state.used[subjectPrefix] = newUsed;
			}
		},
	},
	modules: {
		settings: SettingsModule,
	},
});
