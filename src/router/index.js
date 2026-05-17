import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import OfferCatalogView from '../views/OfferCatalogView.vue'
import OfferDetailView from '../views/OfferDetailView.vue'

const routes = [
  {
    path: '/',
    redirect: '/angebote' 
  },
  {
    path: '/start', 
    name: 'home',
    component: HomeView
  },
  {
    path: '/angebote',
    name: 'angebote',
    component: OfferCatalogView
  },
  {
    path: '/angebot/:id',
    name: 'angebot-detail',
    component: OfferDetailView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
