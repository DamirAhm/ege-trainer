//@ts-check
import cheerio from 'cheerio';
import { URL } from 'url';
import fetch from 'node-fetch';

import {
	getCheckableAnswer,
	getPrefixFromUrl,
	getTopicUrl,
	isCheckableAnswer,
	fixHTML,
	randomSort,
	randomElement,
	getSavedContent,
	setSavedContent,
	getThemeFromUrl,
} from './utils.js';
import { SITE_ORIGIN, ANSWER_TYPES } from './constants.js';

//≡

const PROBLEM_SELECTOR = '.problem_container';

const SAVED_CONTENT = getSavedContent();

const GET_ALL = Infinity;

const { tasks: tasksPageCache } = SAVED_CONTENT;

export async function getTasksFromPage(
	{ urlSet, amount = 5, used = [], useCache = true, issue },
	browser,
) {
	try {
		if (urlSet.length > 0) {
			let timesLoaded = 0;

			const initialPageUrl = randomElement(urlSet);
			const page = await browser.newPage();

			let tasks;

			const subjectPrefix = getPrefixFromUrl(urlSet[0]);
			let savedThemes = tasksPageCache[subjectPrefix]?.[issue];
			const theme = getThemeFromUrl(initialPageUrl);

			if (savedThemes && Object.keys(savedThemes)?.length === urlSet.length && useCache) {
				const savedProblems = Object.values(tasksPageCache[subjectPrefix][issue]);
				//@ts-ignore
				const problems = randomSort(savedProblems.flat());

				tasks = problems.filter((task) => !used.includes(task.id)).slice(0, amount);
			} else {
				if (savedThemes?.[theme]) {
					tasks = savedThemes[theme];
				} else {
					await page.goto(initialPageUrl, { waitUntil: 'domcontentloaded', timeout: 0 });

					let $ = cheerio.load(await page.content());
					let lastLoadedElem = getLastProblemId($);

					let foundUsedProblems = 0;

					while ((timesLoaded + 1) * 5 - foundUsedProblems < amount) {
						await page.evaluate(() => {
							const lastProblem = document.querySelector(
								'.problem_container:last-child',
							);
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

						if (
							actualLastLoadedElem === lastLoadedElem ||
							actualLastLoadedElem === undefined
						)
							break;

						$(PROBLEM_SELECTOR).each((_, el) => {
							if (used.includes(el.attribs.id)) foundUsedProblems++;
						});

						lastLoadedElem = actualLastLoadedElem;
						timesLoaded++;
					}

					tasks = getTasksOnPage($);
				}
			}

			if (tasks.length < amount) {
				if (savedThemes) {
					savedThemes[theme] = tasks;
				} else {
					savedThemes = { [theme]: tasks };
				}

				if (urlSet.length > 1) {
					const nextUrlTasks = await getTasksFromPage(
						{
							urlSet: urlSet.filter((url) => url !== initialPageUrl),
							amount: amount - tasks.length,
							useCache: false,
							issue,
						},
						browser,
					);

					tasks.push(...nextUrlTasks);
				}
			} else {
				if (!savedThemes?.[theme]) {
					setTimeout(async () => {
						await saveAllTasksOfThemeToCache(initialPageUrl, issue, browser);
					});
				}
			}

			await page.close();
			return randomSort(tasks)
				.filter((task) => !used.includes(task.id))
				.slice(0, amount);
		}
		throw new Error('Url set mustn`t be empty');
	} catch (e) {
		console.error(e);
		return [];
	}
}
export async function saveAllTasksOfThemeToCache(initialPageUrl, issue, browser) {
	const subjectPrefix = getPrefixFromUrl(initialPageUrl);
	const theme = getThemeFromUrl(initialPageUrl);

	const fullTasks = await getTasksFromPage(
		{
			urlSet: [initialPageUrl],
			amount: GET_ALL,
			issue,
		},
		browser
	);

	const savedContent = getSavedContent();
	setSavedContent({
		...savedContent,
		tasks: {
			...savedContent.tasks,
			[subjectPrefix]: {
				...savedContent.tasks[subjectPrefix],
				[issue]: {
					...savedContent.tasks[subjectPrefix]?.[issue],
					[theme]: fullTasks
				},
			},
		},
	});
}

export function getLastProblemId($) {
	return $(`${PROBLEM_SELECTOR}:last-child`).attr('id');
}
export function getTasksOnPage($) {
	const taskElements = $('.problem_container');
	const parsedTaskElements = [
		...taskElements.map((_, taskElement) => getTaskInfoFromElement($(taskElement))),
	];

	return parsedTaskElements;
}

const problemCache = new Map();
export function getTaskInfoFromElement(taskElement) {
	const id = taskElement.attr('id');
	if (problemCache.has(id)) return problemCache.get(id);

	let task = taskElement.find('.pbody').html();
	task = fixHTML(task);

	const text = taskElement.find('.probtext').text();

	const haveExpand = taskElement.find('.expand .answer').length > 0;

	let solution = [
		...taskElement
			.find(
				(haveExpand ? '.expand ~ ' : '') +
					'.solution p:not(:last-of-type), .solution center > p',
			)
			.map((_, el) => taskElement.find(el).html()),
	].join(' ');
	solution = fixHTML(solution);

	let answer = taskElement.find((haveExpand ? '.expand ~ ' : '') + '.answer').text();
	let answerType = ANSWER_TYPES.text;

	if (!answer || answer == '') {
		const ps = taskElement.find(
			(haveExpand ? '.expand ~ ' : '') + '.solution > p:not(.left_margin)',
		);

		for (const p of ps) {
			if (isCheckableAnswer(taskElement.find(p).text())) {
				answer = taskElement.find(p).text();
				break;
			} else if (taskElement.find(p).text().startsWith('Ответ')) {
				answer = taskElement.find(p).html();
				answerType = ANSWER_TYPES.html;
				break;
			}
		}
	}

	if (answerType == ANSWER_TYPES.text && isCheckableAnswer(answer))
		answer = getCheckableAnswer(answer);
	else if (answerType == ANSWER_TYPES.html) answer = fixHTML(answer);

	const problem = {
		task,
		text,
		solution,
		answer: answer,
		answerType,
		id,
	};

	problemCache.set(id, problem);
	return problem;
}

let { topics: topicsCache } = SAVED_CONTENT;
export async function getTopics(origin) {
	if (topicsCache?.[origin] != null) return topicsCache?.[origin];

	const res = await fetch(new URL('/newapi/general', origin).href);
	const json = await res.json();
	const topics = json.constructor;

	const parsedTopics = parseTopics(topics, origin);

	if (topicsCache) {
		topicsCache[origin] = parsedTopics;
	} else {
		topicsCache = { [origin]: parsedTopics };
	}
	setSavedContent({ ...getSavedContent(), topics: topicsCache });

	return parsedTopics;
}
export function parseTopics(topics, origin) {
	return topics
		.filter(({ issue }) => !isNaN(issue))
		.map(({ issue, title, subtopics, id }) => ({
			issue,
			title,
			url: id && getTopicUrl(id, origin),
			subtopics: subtopics && parseSubtopics(subtopics, origin),
		}));
}
export function parseSubtopics(subtopics, origin) {
	return subtopics.map(({ id, title, amount }) => ({
		id,
		title,
		amount,
		url: getTopicUrl(id, origin),
	}));
}

let { subjects: subjectsCache } = SAVED_CONTENT;
export async function getSubjects(browser) {
	try {
		if (subjectsCache != null) return subjectsCache;
		const page = await browser.newPage();

		await page.goto(SITE_ORIGIN, { waitUntil: 'domcontentloaded', timeout: 0 });

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

		await page.close();

		subjectsCache = subjects;
		setSavedContent({ ...getSavedContent(), subjects });

		return subjects;
	} catch (e) {
		console.log(e);
		return [];
	}
}
