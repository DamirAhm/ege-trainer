//@ts-check
import path from "path";
import fastify from "fastify";
import cors from "cors";
import fastifyExpress from "fastify-express";
import sirv from "sirv";
import compression from "compression";
import fs from "fs";

import { getUrlFromPrefix, getSavedContent } from "./utils.js";
import { responseTypes } from "./constants.js";

const __dirname = process.cwd();

(async () => {
	try {
		const app = fastify();
		await app.register(fastifyExpress);

		app.use(cors());
		app.use(
			sirv(path.join(__dirname, "dist"), {
				maxAge: 31536000,
				immutable: true,
				gzip: true,
			})
		);
		app.use(compression());

		const savedContent = getSavedContent();
		app.get("/api/subjects", async (req, res) => {
			res.type(responseTypes.json);
			return savedContent.subjects;
		});
		app.get("/api/topics/:subjectPrefix", async (req, res) => {
			try {
				//@ts-ignore
				const { subjectPrefix } = req.params;

				res.type(responseTypes.json);

				let topics = savedContent.topics[getUrlFromPrefix(subjectPrefix)];

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
		app.get("/api/tasks/:subjectPrefix/:issue", async (req, res) => {
			try {
				//@ts-ignore
				const { subjectPrefix, issue } = req.params;
				//@ts-ignore
				const { amount = 5, usedProblemsString = "" } = req.query;
				const used = usedProblemsString.split(",");

				let topics = savedContent.topics[getUrlFromPrefix(subjectPrefix)];

				if (topics) {
					const issues = issue.split("+").filter((is) => !isNaN(is));
					if (issues.length === 0) return [];

					const result = new Map();

					for (const issue of issues) {
						const topic = topics?.find((topic) => topic.issue === issue);

						if (!topic) {
							continue;
						}

						const allTasks = Object.values(
							savedContent.tasks[subjectPrefix][issue]
						).reduce((acc, c) => [...acc, ...c], []);

						const randomSortedTasks = allTasks
							.sort(() => Math.random() - 0.5)
							.sort(() => 0.5 - Math.random());
						const tasks = [];
						let index = 0;
						while (tasks.length < amount && index < randomSortedTasks.length) {
							if (!used.includes(randomSortedTasks[index].id))
								tasks.push(randomSortedTasks[index]);
							index++;
						}

						if (tasks && tasks.length > 0) {
							result.set(issue, tasks);
						}
					}

					if (result.size === 0) {
						console.log("can't find any tasks");
						res.code(404);
						return "Can't find any tasks";
					}

					res.type(responseTypes.json);

					//@ts-ignore
					return JSON.stringify(Object.fromEntries(result));
				} else {
					res.code(404);
					console.log("Can't find topics");
					return "Can't find topics";
				}
			} catch (e) {
				console.error(e);

				res.code(404);
				throw e;
			}
		});

		app.get("/*", (_, res) => {
			const stream = fs.createReadStream(
				path.join(__dirname, "./dist/index.html")
			);
			res.type("text/html").send(stream);
		});

		app
			.listen(process.env.PORT ?? 3000)
			.then(() => console.log("Server listening"));
	} catch (e) {
		console.error(e);
	}
})();
