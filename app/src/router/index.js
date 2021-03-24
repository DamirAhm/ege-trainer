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
	},
	{
		path: '/topics/:subjectPrefix',
		name: 'Topic',
		component: TopicSelectionPage,
	},
	{
		path: '/tasks/:subjectPrefix/:issue',
		name: 'Tasks',
		component: TasksPage,
	},
	{
		path: '/:catchAll(.*)',
		name: '404',
		component: Page404,
	},
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

export default router;
