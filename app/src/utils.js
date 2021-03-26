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

export function getInfoFromStorage() {
	const problems = JSON.parse(localStorage.getItem('problems'));
	const issue = localStorage.getItem('issue');

	return {
		problems,
		issue,
	};
}

export function getSettingsFromStorage() {
	return JSON.parse(localStorage.getItem('settings'));
}
export function updateSettingsInStorage(newSettings) {
	localStorage.setItem('settings', JSON.stringify(newSettings));
}
