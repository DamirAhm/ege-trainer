import { createRouter, createWebHistory } from 'vue-router';
import SubjectSelectionPage from '@/views/SubjectSelectionPage.vue';
import TopicSelectionPage from '@/views/TopicSelectionPage.vue';
import TasksPage from '@/views/TasksPage.vue';
import Page404 from '@/views/Page404.vue';
import { subjectNamesByPrefix } from '@/constants';

const routes = [
	{
		path: '/',
		name: 'Subjects',
		component: SubjectSelectionPage,
		meta: {
			title: 'Предметы',
		},
	},
	{
		path: '/topics/:subjectPrefix',
		name: 'Topics',
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
	history: createWebHistory(process.env.BASE_URL),
	routes,
});

router.beforeEach((toRoute, _, next) => {
	const { subjectPrefix } = toRoute.params;

	document.title = `${toRoute.meta.title} ${
		subjectPrefix && subjectNamesByPrefix[subjectPrefix]
			? 'по ' + subjectNamesByPrefix[subjectPrefix]
			: ''
	}`;

	next();
});

export const getBackRoute = (curRoute) => {
	if (['404', 'Page404', 'Topics'].includes(curRoute.name)) return { name: 'Subjects' };
	else if (['Tasks'].includes(curRoute.name)) {
		const { subjectPrefix } = curRoute.params;

		if (subjectPrefix) {
			return { name: 'Topics', params: { subjectPrefix } };
		}
	}

	return 'Page404';
};

export default router;
