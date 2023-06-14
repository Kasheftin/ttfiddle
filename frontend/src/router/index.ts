import { createRouter, createWebHistory } from 'vue-router'
import MainView from '@/views/MainView.vue'
import IntroView from '@/views/IntroView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/new',
      name: 'new',
      component: MainView
    },
    {
      path: '/:id/:version?',
      name: 'main',
      component: MainView
    },
    {
      path: '/',
      name: 'intro',
      component: IntroView
    }
  ]
})

export default router
