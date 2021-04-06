import fs from 'fs';
import path from 'path';

const __dirname = process.cwd();

let fileCache = null;

export function getSavedContent() {
	if (fileCache) return fileCache;

	const str = fs.readFileSync(path.join(__dirname, './savedContent.json')).toString();

	const json = JSON.parse(str);

	fileCache = json;

	return json;

	// if (fileCache) return fileCache;

	// let file = fs.readFileSync(path.join(__dirname, './savedContent.json')).toString();

	// const json = JSON.parse(file);

	// fileCache = json;

	// return JSON.parse(json);
}

console.log(getSavedContent());
