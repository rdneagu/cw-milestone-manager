import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: { name: 'coursework' },
  },
  {
    path: '/courseworks',
    name: 'coursework',
    component: () => import('../views/coursework/Coursework.vue'),
  },
  {
    path: '/courseworks/:coursework?',
    name: 'courseworkView',
    component: () => import('../views/coursework/CourseworkView.vue'),
    children: [
      {
        path: 'edit',
        name: 'courseworkEdit',
        component: () => import('../views/coursework/CourseworkEdit.vue'),
      },
      {
        path: 'milestones',
        redirect: (to) => ({ name: 'courseworkView', params: to.params, query: { tab: 'milestones', ...to.query } }),
      },
      {
        path: 'milestones/create',
        name: 'milestoneCreate',
        component: () => import('../views/coursework/milestone/MilestoneCreate.vue'),
      },
      {
        path: 'milestones/:milestoneId?/edit',
        name: 'milestoneEdit',
        component: () => import('../views/coursework/milestone/MilestoneEdit.vue'),
      },
    ],
  },
  {
    path: '*',
    name: 'error',
    component: () => import('../views/404.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
