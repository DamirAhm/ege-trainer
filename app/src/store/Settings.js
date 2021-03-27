//@ts-check
import { mutations } from '../constants';

export default {
	state: {
		autoRemove: true,
		removeDelay: 10,

		initialAmountOfProblems: 2,
		newProblemsForFail: 2,
	},
	mutations: {
		[mutations.SET_SETTINGS](state, newSettings) {
			Object.assign(state, newSettings);
		},
	},
	namespaced: true,
};
