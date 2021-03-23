//@ts-check
const pup = require('puppeteer');
const cheerio = require('cheerio');
const { URL } = require('url');
const { answerTypes } = require('./constants');
const path = require('path');
const fetch = require('node-fetch');

// const SITE_ORIGIN = 'https://math-ege.sdamgia.ru/';

const MATH_THEME_6_URL = 'https://math-ege.sdamgia.ru/test?theme=6';
const MATH_THEME_7_URL = 'https://math-ege.sdamgia.ru/test?theme=7';
const MATH_THEME_8_URL = 'https://math-ege.sdamgia.ru/test?theme=8';

const PROBLEM_SELECTOR = '.problem_container';

async function loadTasksFromPage({ urlSet, amount = 5, offset = 0 }, browser) {
	try {
		let timesLoaded = 0;

		const initialPageUrl = urlSet[Math.floor(Math.random() * urlSet.length)];

		const page = await browser.newPage();
		await page.goto(initialPageUrl, { waitUntil: 'domcontentloaded' });

		let $ = cheerio.load(await page.content());
		let lastLoadedElem = getLastProblemId($);

		while ((timesLoaded + 1) * 5 < amount + offset) {
			await page.evaluate(() => {
				const lastProblem = document.querySelector('.problem_container:last-child');
				if (lastProblem) {
					lastProblem.scrollIntoView();
				}
			});

			//Wait for selector for 1s or get undefined;
			const resultOfWaiting = await Promise.race([
				page.waitForSelector(
					`${PROBLEM_SELECTOR}:nth-of-type(${(timesLoaded + 1) * 5 + 3})`,
				),
				new Promise((resolve) => {
					setTimeout(() => {
						resolve(undefined);
					}, 1000);
				}),
			]);
			if (resultOfWaiting === undefined) break;

			const pageHtml = await page.content();
			$ = cheerio.load(pageHtml);
			const actualLastLoadedElem = getLastProblemId($);

			if (actualLastLoadedElem === lastLoadedElem || actualLastLoadedElem === undefined)
				break;

			lastLoadedElem = actualLastLoadedElem;
			timesLoaded++;
		}

		const tasks = getTasksOnPage($, initialPageUrl);

		if (tasks.length < amount + offset && urlSet.length > 1) {
			const nextUrlTasks = await loadTasksFromPage(
				{
					pageUrlsPool: urlSet.filter((url) => url !== initialPageUrl),
					amount: amount - (tasks.length - offset),
				},
				browser,
			);

			tasks.push(...nextUrlTasks);
		}

		return tasks.slice(offset, offset + amount).sort(() => Math.random() - 0.5);
	} catch (e) {
		console.error(e);
		return [];
	}
}
function getLastProblemId($) {
	return $(`${PROBLEM_SELECTOR}:last-child`).attr('id');
}
function getTasksOnPage($, pageUrl) {
	const taskElements = $('.problem_container');
	const parsedTaskElements = [
		...taskElements.map((_, taskElement) => getTaskInfoFromElement($(taskElement), pageUrl)),
	];

	return parsedTaskElements;
}
function getTaskInfoFromElement(taskElement, pageUrl) {
	const SITE_ORIGIN = new URL(pageUrl).origin;

	const task = taskElement.find('.pbody').text();
	const images = [
		...taskElement.find('.pbody img').map((_, el) => new URL(el.attribs.src, SITE_ORIGIN).href),
	];
	const text = taskElement.find('.probtext').text();
	const solutionText = taskElement.find('.solution').text();

	let answer = taskElement.find('.answer').text();
	let answerType = answerTypes.text;
	if (!answer || answer == '') {
		answer = taskElement
			.find('#problem_560187 .solution p:last-of-type:not(.left_margin)')
			.content();
		answerType = answerTypes.html;
	}
	if (answer.startsWith('Ответ:')) answer.replace(/Ответ:\s?/, '');
	if (answer.endsWith('.')) answer = answer.slice(0, -1);

	const solutionImages = [
		...taskElement
			.find('.solution img')
			.map((_, el) => new URL(el.attribs.src, SITE_ORIGIN).href),
	];
	const id = taskElement.attr('id');

	return {
		task,
		images,
		text,
		solution: {
			text: solutionText,
			images: solutionImages,
		},
		answer,
		answerType,
		id,
	};
}

async function getTopics(origin) {
	const res = await fetch(new URL('/newapi/general', origin).href);
	const json = await res.json();
	const topics = json.constructor;

	return parseTopics(topics, origin);
}
function parseTopics(topics, origin) {
	return topics
		.filter(({ issue }) => !isNaN(issue))
		.map(({ issue, title, subtopics }) => ({
			issue,
			title,
			subtopics: parseSubtopics(subtopics, origin),
		}));
}
function parseSubtopics(subtopics, origin) {
	return subtopics.map(({ id, title, amount }) => ({
		id,
		title,
		amount,
		url: new URL(`/test?theme=${id}`, origin).href,
	}));
}

function getUrlSetFromTopic(topic) {
	return topic.subtopics.map(({ url }) => url);
}

(async () => {
	const browser = await pup.launch({
		// args: ['--no-sandbox', '--disable-setuid-sandbox'],
		executablePath: path.resolve(
			__dirname,
			'./node_modules/puppeteer/.local-chromium/chrome-win/chrome.exe',
		),
	});

	browser.close();
})();

module.exports = {
	loadTasksFromPage,
	getTopics,
};
