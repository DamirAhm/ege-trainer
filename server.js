import path from 'path';
import { URL } from 'url';
import fastify from 'fastify';
import pup from 'puppeteer';

import { getSubjects, getTopics, loadTasksFromPage } from './parse.js';
import { getUrlSetFromTopic, getUrlFromPrefix } from './utils.js';
import { responseTypes } from './constants.js';
import { SITE_HOST } from './constants.js';

const app = fastify();

const __dirname = process.cwd();

const topicsCache = new Map();

(async () => {
	const browser = await pup.launch({
		executablePath: path.resolve(
			__dirname,
			'./node_modules/puppeteer/.local-chromium/chrome-win/chrome.exe',
		),
	});

	app.get('/subjects', async (req, res) => {
		res.type(responseTypes.json);
		return await getSubjects(browser);
	});
	app.get('/topics/:subjectPrefix', async (req, res) => {
		try {
			const { subjectPrefix } = req.params;

			res.type(responseTypes.json);

			let topics;
			if (topicsCache.has(subjectPrefix)) topics = topicsCache.get(subjectPrefix);
			else {
				topics = await getTopics(getUrlFromPrefix(subjectPrefix));
				topicsCache.set(subjectPrefix, topics);
			}

			return topics.map(({ subtopics, ...rest }) => rest);
		} catch (e) {
			console.error(e);
			res.code(404);
			throw new Error();
		}
	});
	app.get('/tasks/:subjectPrefix/:issue', async (req, res) => {
		try {
			const { subjectPrefix, issue } = req.params;
			const { amount = 5, usedProblemsString = '[]' } = req.query;
			const used = JSON.parse(usedProblemsString);

			let topics;
			if (topicsCache.has(subjectPrefix)) topics = topicsCache.get(subjectPrefix);
			else {
				topics = await getTopics(getUrlFromPrefix(subjectPrefix));
				topicsCache.set(subjectPrefix, topics);
			}

			const topic = topics.find((topic) => topic.issue === issue);
			const urlSet = getUrlSetFromTopic(topic);

			return await loadTasksFromPage({ urlSet, amount, used }, browser);
		} catch (e) {
			console.error(e);

			res.code(404);
			throw new Error();
		}
	});

	app.listen(3000).then(() => console.log('Server listening'));
})();
