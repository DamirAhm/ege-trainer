import axios from 'axios';

const isDev = process.env.NODE_ENV === 'development';

export async function getSubjects() {
	const apiUrl = (isDev ? 'http://localhost:3000' : '') + '/api/subjects';

	return axios.get(apiUrl).then((res) => res.data);
}

export async function getTopics(subjectPrefix) {
	const apiUrl = (isDev ? 'http://localhost:3000' : '') + `/api/topics/${subjectPrefix}`;

	return axios.get(apiUrl).then((res) => res.data);
}

export async function getTasks(subjectPrefix, issue, { used = [], amount = 5 } = {}) {
	const queryParams = new URLSearchParams({
		used: used.join(','),
		amount: String(amount),
	}).toString();
	const apiUrl =
		(isDev ? 'http://localhost:3000' : '') +
		`/api/tasks/${subjectPrefix}/${issue}?${queryParams}`;

	return axios.get(apiUrl).then((res) => res.data);
}
