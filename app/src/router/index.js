import { createRouter, createWebHistory } from 'vue-router';
import SubjectSelectionPage from '../views/SubjectSelectionPage.vue';
import TopicSelectionPage from '../views/TopicSelectionPage.vue';
import TasksPage from '../views/TasksPage.vue';
import Page404 from '../views/Page404.vue';

const routes = [
	{
		path: '/',
		name: 'Subject',
		component: SubjectSelectionPage,
		meta: {
			title: 'Предметы',
		},
	},
	{
		path: '/topics/:subjectPrefix',
		name: 'Topic',
		component: TopicSelectionPage,
		meta: {
			title: 'Темы',
		},
	},
	{
		path: '/tasks/:subjectPrefix/:issue',
		name: 'Tasks',
		component: TasksPage,
		meta: {
			title: 'Задания',
		},
	},
	{
		path: '/404',
		name: 'Page404',
		component: Page404,
		meta: {
			title: '404',
		},
	},
	{
		path: '/:catchAll(.*)',
		name: '404',
		component: Page404,
		meta: {
			title: '404',
		},
	},
];

const router = createRouter({
	beforeEach(toRoute, _, next) {
		window.document.title = toRoute.meta && toRoute.meta.title ? toRoute.meta.title : 'Home';

		next();
	},
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
