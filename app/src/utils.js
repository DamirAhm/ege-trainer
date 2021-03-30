const itemsToClear = ['problems', 'issue'];
export function clearStorage() {
	for (const it of itemsToClear) {
		localStorage.removeItem(it);
	}
}

export function updateStorage({ problems, issue }) {
	if (problems) {
		localStorage.setItem('problems', JSON.stringify(problems));
	}
	if (issue) {
		localStorage.setItem('issue', issue);
	}
}

export function getProblemsInfoFromStorage() {
	if (localStorage.getItem('problems') && localStorage.getItem('issue')) {
		const problems = JSON.parse(localStorage.getItem('problems'));
		const issue = localStorage.getItem('issue');

		return {
			problems,
			issue,
		};
	} else {
		return {};
	}
}

export function getSettingsFromStorage() {
	if (localStorage.getItem('settings')) {
		return JSON.parse(localStorage.getItem('settings'));
	} else {
		return null;
	}
}
export function updateSettingsInStorage(newSettings) {
	localStorage.setItem('settings', JSON.stringify(newSettings));
}

// {duration, state, passedTime}
export function getTimerStateFromStorage() {
	const timerState = JSON.parse(localStorage.getItem('timerState'));

	return timerState;
}
export function setTimerStateInStorage(newTimerState) {
	const oldTimerState = getTimerStateFromStorage() ?? {};

	localStorage.setItem('timerState', JSON.stringify(Object.assign(oldTimerState, newTimerState)));
}

export function getProblemId(id) {
	return id.match(/problem_(.+)/)[1];
}
