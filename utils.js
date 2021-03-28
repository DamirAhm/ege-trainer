//@ts-check
import { IMAGE_ORIGIN, SITE_HOST } from './constants.js';

export const prefixRegExp = /(https?:\/\/)?(.*)\.sdamgia.ru/;

export function getPrefixFromUrl(url) {
	const [, , prefix] = url.match(prefixRegExp);

	return prefix;
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

const answerRegExp = /Ответ: ([0-9а-я()|]+)/;
export function isCheckableAnswer(answer) {
	if (answer.match(answerRegExp)) {
		const [_, value] = answer.match(answerRegExp);

		//! Осторожно костыли
		if (value.search(/[()|]/) === -1) {
			return true;
		}
	}

	return false;
}
export function getCheckableAnswer(answer) {
	return answer.match(answerRegExp)[1];
}

export function randomSort(array) {
	return array.sort(() => Math.random() - 0.5);
}
export function randomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}
