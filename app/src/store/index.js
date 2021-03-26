import { createStore } from 'vuex';
import SettingsModule from './Settings';

export default createStore({
	modules: {
		settings: SettingsModule,
	},
});
