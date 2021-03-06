//@ts-check
import { IMAGE_ORIGIN, SITE_HOST } from './constants.js';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const __dirname = process.cwd();

export const prefixRegExp = /(https?:\/\/)?(.*)\.sdamgia\.ru.*/;

export function getPrefixFromUrl(url) {
	const [, , prefix] = url.match(prefixRegExp);

	return prefix;
}
export const themeRegExp = /theme=(.*)/;
export function getThemeFromUrl(url) {
	const [, theme] = url.match(themeRegExp);

	return theme;
}

export function getUrlSetFromTopic(topic) {
	return topic.subtopics.map(({ url }) => url);
}

export function getUrlFromPrefix(prefix) {
	return `https://${prefix}.${SITE_HOST}`;
}

export function getTopicUrl(id, origin) {
	return new URL(`/test?theme=${id}`, origin).href;
}

export function getImageUrl(imageSrc, SITE_ORIGIN) {
	return new URL(imageSrc, SITE_ORIGIN).href;
}

const srcRegExp = /src=["'`]([a-z0-9_\-?=/\\]+)["'`]/gi;
const styleRegExp = /style=["'`]([a-z0-9_\-?=/\\:;%\s]+)["'`]/gi;
export function fixHTML(html) {
	return html
		.replace(srcRegExp, (withSrc, url) => {
			if (url.startsWith('/')) {
				return `src="${new URL(url, IMAGE_ORIGIN).href}"`;
			}

			return withSrc;
		})
		.replace(styleRegExp, '');
}

const answerRegExp = /Ответ: ([0-9а-яa-z()|]+)/i;
export function isCheckableAnswer(answer) {
	if (answer.match(answerRegExp)) {
		const [_, value] = answer.match(answerRegExp);

		//! Осторожно костыли
		if (value.search(/[()]/) === -1) {
			return true;
		}
	}

	return false;
}
export function getCheckableAnswer(answer) {
	return answer
		.match(answerRegExp)[1]
		.split('|')
		.map((e) => e.trim())
		.filter(Boolean);
}

export function randomSort(array) {
	return array.sort(() => Math.random() - 0.5);
}
export function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

let fileCache = null;

/**
 * @returns {import("./types").savedContent}
 */
export function getSavedContent() {
	if (fileCache) return fileCache;

	let file = fs.readFileSync(path.join(__dirname, './savedContent.json')).toString();

	const json = JSON.parse(file);

	fileCache = json;

	return json;
}
export function setSavedContent(newContent) {
	const json = JSON.stringify(newContent, null, 2);
	fileCache = null;
	fs.writeFileSync(path.join(__dirname, './savedContent.json'), json);
}
