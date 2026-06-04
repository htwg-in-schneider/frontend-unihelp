import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@auth0/auth0-vue';
import HomeView from '../views/HomeView.vue';
import OfferCatalogView from '../views/OfferCatalogView.vue';
import OfferDetailView from '../views/OfferDetailView.vue';
import CreateOfferView from '../views/CreateOfferView.vue';
import EditOfferView from '../views/EditOfferView.vue';
import ProfileView from '../views/ProfileView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Angebote' }
    },
    {
      path: '/offers',
      name: 'offers',
      component: OfferCatalogView,
      meta: { title: 'Angebote' }
    },
    {
      path: '/offer/:id',
      name: 'offer-detail',
      component: OfferDetailView,
      meta: { title: 'Angebot' }
    },
    {
      path: '/offer/new',
      name: 'offer-create',
      component: CreateOfferView,
      meta: { title: 'Neues Angebot' },
      beforeEnter: authGuard
    },
    {
      path: '/offer/edit/:id',
      name: 'offer-edit',
      component: EditOfferView,
      meta: { title: 'Angebot bearbeiten' },
      beforeEnter: authGuard
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: authGuard
    }
  ]
})

export default router;
