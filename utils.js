//@ts-check
import { SITE_HOST } from './constants.js';

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
