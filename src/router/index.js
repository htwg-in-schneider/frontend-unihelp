import { createRouter, createWebHistory } from 'vue-router';
import OfferCatalogView from '../views/OfferCatalogView.vue';
import OfferDetailView from '../views/OfferDetailView.vue';
import CreateOfferView from '../views/CreateOfferView.vue';
import EditOfferView from '../views/EditOfferView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: OfferCatalogView,
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
      meta: { title: 'Neues Angebot' } 
    },
    {
      path: '/offer/edit/:id',
      name: 'offer-edit',
      component: EditOfferView,
      meta: { title: 'Angebot bearbeiten' } 
    }
  ]
})

export default router;
