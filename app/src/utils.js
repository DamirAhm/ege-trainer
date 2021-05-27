const itemsToClear = ["problems", "issue"];
export function clearStorage() {
	for (const it of itemsToClear) {
		localStorage.removeItem(it);
	}
}

export function updateStorage({ problems, issues }) {
	if (problems) {
		localStorage.setItem("problems", JSON.stringify(problems));
	}
	if (issues) {
		const issueNames = Object.keys(issues);
		localStorage.setItem("issues", issueNames.join("+"));
	}
}

export function getProblemsInfoFromStorage() {
	if (localStorage.getItem("problems") && localStorage.getItem("issues")) {
		const problems = JSON.parse(localStorage.getItem("problems"));
		const issues = localStorage.getItem("issues");

		return {
			problems,
			issues
		};
	} else {
		return {};
	}
}

export function getSettingsFromStorage() {
	if (localStorage.getItem("settings")) {
		return JSON.parse(localStorage.getItem("settings"));
	} else {
		return null;
	}
}
export function updateSettingsInStorage(newSettings) {
	localStorage.setItem("settings", JSON.stringify(newSettings));
}

// {duration, state, passedTime}
export function getTimerStateFromStorage() {
	const timerState = JSON.parse(localStorage.getItem("timerState"));

	return timerState;
}
export function setTimerStateInStorage(newTimerState) {
	const oldTimerState = getTimerStateFromStorage() ?? {};

	localStorage.setItem(
		"timerState",
		JSON.stringify(Object.assign(oldTimerState, newTimerState))
	);
}

const problemIdRegExp = /problem_([0-9]+)/;
export function getProblemId(id) {
	if (problemIdRegExp.test(id)) {
		return id.match(problemIdRegExp)[1];
	} else {
		throw new Error(
			"Problem id doesn`t match format needed problem_[id], got: " + id
		);
	}
}
