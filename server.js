//@ts-check
import path from 'path';
import fastify from 'fastify';
import pup from 'puppeteer';
import cors from 'cors';
import fastifyExpress from 'fastify-express';
import { URLSearchParams } from 'url';

import { getSubjects, getTopics, loadTasksFromPage } from './parse.js';
import { getUrlSetFromTopic, getUrlFromPrefix } from './utils.js';
import { responseTypes } from './constants.js';

const __dirname = process.cwd();

const topicsCache = new Map();

const multiIssueRegExp = /([а-яa-z0-9]+)(\+[а-яa-z0-9])*/i;

(async () => {
	const app = fastify();
	await app.register(fastifyExpress);
	app.use(cors());

	const browser = await pup.launch({
		executablePath: path.resolve(
			__dirname,
			'./node_modules/puppeteer/.local-chromium/chrome-win/chrome.exe',
		),
	});

	app.get('/api/subjects', async (req, res) => {
		res.type(responseTypes.json);
		return await getSubjects(browser);
	});
	app.get('/api/topics/:subjectPrefix', async (req, res) => {
		try {
			const { subjectPrefix } = req.params;

			res.type(responseTypes.json);

			let topics;
			if (topicsCache.has(subjectPrefix)) topics = topicsCache.get(subjectPrefix);
			else {
				topics = await getTopics(getUrlFromPrefix(subjectPrefix));

				if (topics) {
					topicsCache.set(subjectPrefix, topics);
				}
			}

			if (!topics) {
				res.code(404);
				throw new Error();
			}

			return topics.map(({ subtopics, ...rest }) => rest);
		} catch (e) {
			console.error(e);
			res.code(404);
			throw new Error();
		}
	});
	app.get('/api/tasks/:subjectPrefix/:issue', async (req, res) => {
		try {
			//@ts-ignore
			const { subjectPrefix, issue } = req.params;
			//@ts-ignore
			const { amount = 5, usedProblemsString = '[]' } = req.query;
			const used = usedProblemsString.split(',');

			let topics;
			if (topicsCache.has(subjectPrefix)) topics = topicsCache.get(subjectPrefix);
			else {
				topics = await getTopics(getUrlFromPrefix(subjectPrefix));
				topicsCache.set(subjectPrefix, topics);
			}

			if (topics) {
				const issues = issue.split('+');

				const result = new Map();

				for (const issue of issues) {
					const topic = topics?.find((topic) => topic.issue === issue);

					if (!topic) {
						continue;
					}

					const urlSet =
						topic.subtopics != null ? getUrlSetFromTopic(topic) : [topic.url];

					const tasks = await loadTasksFromPage({ urlSet, amount, used }, browser);

					if (tasks && tasks.length > 0) {
						result.set(issue, tasks);
					}
				}

				if (result.size === 0) {
					res.code(404);
					throw new Error();
				}

				res.type(responseTypes.json);

				const resultTasks = [];

				for (const [issue, tasks] of result) {
					const tasksWithIssue = tasks.map((task) => ({ ...task, issue }));
					resultTasks.push(...tasksWithIssue);
				}

				return resultTasks;
			} else {
				res.code(404);
				throw new Error();
			}
		} catch (e) {
			console.error(e);

			res.code(404);
			throw new Error();
		}
	});

	app.listen(3000).then(() => console.log('Server listening'));
})();
