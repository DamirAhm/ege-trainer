//@ts-check
import cheerio from 'cheerio';
import { URL } from 'url';
import fetch from 'node-fetch';

import { getPrefixFromUrl } from './utils.js';
import { SITE_ORIGIN, ANSWER_TYPES } from './constants.js';

//≡

const PROBLEM_SELECTOR = '.problem_container';

const problemCache = new Map();

export async function loadTasksFromPage({ urlSet, amount = 5, used = [] }, browser) {
	try {
		let timesLoaded = 0;

		const initialPageUrl = urlSet[Math.floor(Math.random() * urlSet.length)];

		const page = await browser.newPage();
		await page.goto(initialPageUrl, { waitUntil: 'domcontentloaded' });

		let $ = cheerio.load(await page.content());
		let lastLoadedElem = getLastProblemId($);

		let foundUsedProblems = 0;

		while ((timesLoaded + 1) * 5 - foundUsedProblems < amount) {
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

			$(PROBLEM_SELECTOR).each((_, el) => {
				if (used.includes(el.attribs.id)) foundUsedProblems++;
			});

			lastLoadedElem = actualLastLoadedElem;
			timesLoaded++;
		}

		const tasks = getTasksOnPage($, initialPageUrl);

		if (tasks.length < amount && urlSet.length > 1) {
			const nextUrlTasks = await loadTasksFromPage(
				{
					urlSet: urlSet.filter((url) => url !== initialPageUrl),
					amount: amount - tasks.length,
				},
				browser,
			);

			tasks.push(...nextUrlTasks);
		}

		return tasks.slice(0, amount).sort(() => Math.random() - 0.5);
	} catch (e) {
		console.error(e);
		return [];
	}
}
export function getLastProblemId($) {
	return $(`${PROBLEM_SELECTOR}:last-child`).attr('id');
}
export function getTasksOnPage($, pageUrl) {
	const taskElements = $('.problem_container');
	const parsedTaskElements = [
		...taskElements.map((_, taskElement) => getTaskInfoFromElement($(taskElement), pageUrl)),
	];

	return parsedTaskElements;
}
export function getTaskInfoFromElement(taskElement, pageUrl) {
	const id = taskElement.attr('id');
	if (problemCache.has(id)) return problemCache.get(id);

	const SITE_ORIGIN = new URL(pageUrl).origin;

	const task = taskElement.find('.pbody').text();
	const images = [
		...taskElement.find('.pbody img').map((_, el) => new URL(el.attribs.src, SITE_ORIGIN).href),
	];
	const text = taskElement.find('.probtext').text();
	const solutionText = taskElement.find('.solution').text();

	let answer = taskElement.find('.answer').text();
	let answerType = ANSWER_TYPES.text;
	if (!answer || answer == '') {
		answer = taskElement
			.find('#problem_560187 .solution p:last-of-type:not(.left_margin)')
			.content();
		answerType = ANSWER_TYPES.html;
	}

	if (answer.startsWith('Ответ:')) answer = answer.replace(/Ответ:\s?/i, '');
	if (answer.endsWith('.')) answer = answer.slice(0, -1);

	const solutionImages = [
		...taskElement
			.find('.solution img')
			.map((_, el) => new URL(el.attribs.src, SITE_ORIGIN).href),
	];

	const problem = {
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

	problemCache.set(id, problem);
	return problem;
}

export async function getTopics(origin) {
	const res = await fetch(new URL('/newapi/general', origin).href);
	const json = await res.json();
	const topics = json.constructor;

	return parseTopics(topics, origin);
}
export function parseTopics(topics, origin) {
	return topics
		.filter(({ issue }) => !isNaN(issue))
		.map(({ issue, title, subtopics, id }) => ({
			issue,
			title,
			id,
			subtopics: subtopics && parseSubtopics(subtopics, origin),
		}));
}
export function parseSubtopics(subtopics, origin) {
	return subtopics.map(({ id, title, amount }) => ({
		id,
		title,
		amount,
		url: new URL(`/test?theme=${id}`, origin).href,
	}));
}

export async function getSubjects(browser) {
	try {
		const page = await browser.newPage();

		await page.goto(SITE_ORIGIN, { waitUntil: 'domcontentloaded' });

		const $ = cheerio.load(await page.content());

		const subjectsElements = $('.sdamgia_menu > ul > li');

		const subjects = [];
		subjectsElements.each((_, el) => {
			const childAnchor = $(el).children('a');
			const title = childAnchor.text().replace('≡', '').trim();

			if (childAnchor.attr('href') === undefined) {
				const subsubjectsElements = $(el).find('ul > li > a');
				const subsubjects = [];
				subsubjectsElements.each((_, el) => {
					if ($(el).attr('href').search('ege') !== -1) {
						subsubjects.push({
							title: $(el).text(),
							prefix: getPrefixFromUrl($(el).attr('href')),
						});
					}
				});

				if (subsubjects.length > 0) {
					subjects.push({
						title,
						subsubjects,
					});
				}
			} else if (childAnchor.attr('href').search('ege') !== -1) {
				subjects.push({
					title,
					prefix: getPrefixFromUrl(childAnchor.attr('href')),
				});
			}
		});

		return subjects;
	} catch (e) {
		console.log(e);
		return [];
	}
}
