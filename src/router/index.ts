import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import NewsItem from '@/views/NewsItem.vue'
import FavouriteView from '@/views/FavouriteView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/news/:id',
      name: 'news-item',
      component: NewsItem,
    },
    {
      path: '/favourite',
      name: 'favourite-view',
      component: FavouriteView,
    },
  ],
})

export default router
