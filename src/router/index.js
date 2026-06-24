import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@auth0/auth0-vue';
import HomeView from '../views/HomeView.vue';
import OfferCatalogView from '../views/OfferCatalogView.vue';
import OfferDetailView from '../views/OfferDetailView.vue';
import CreateOfferView from '../views/CreateOfferView.vue';
import EditOfferView from '../views/EditOfferView.vue';
import ProfileView from '../views/ProfileView.vue';
import ImprintView from '../views/ImprintView.vue';
import PrivacyView from '../views/PrivacyView.vue';
import DashboardView from '../views/DashboardView.vue';
import BookingsView from '../views/BookingsView.vue';
import PaymentView from '../views/PaymentView.vue';
import RatingView from '../views/RatingView.vue';
import ModerationView from '../views/ModerationView.vue';
import BannedView from '../views/BannedView.vue';
import MessagesView from '../views/MessagesView.vue';
import ChatDetailView from '../views/ChatDetailView.vue';
import PublicProfileView from '../views/PublicProfileView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'UniHelp - Startseite' }
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
      meta: { title: 'Angebot' },
      beforeEnter: authGuard
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
      meta: { title: 'Profil' },
      beforeEnter: authGuard
    },
    {
      path: '/imprint',
      name: 'imprint',
      component: ImprintView,
      meta: { title: 'Impressum' }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyView,
      meta: { title: 'Datenschutzerklärung' }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { title: 'Dashboard' },
      beforeEnter: authGuard
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: BookingsView,
      meta: { title: 'Buchungen' },
      beforeEnter: authGuard
    },
    {
      path: '/payment/:id',
      name: 'payment',
      component: PaymentView,
      meta: { title: 'Bezahlen' },
      beforeEnter: authGuard
    },
    {
      path: '/rate/:id',
      name: 'rate',
      component: RatingView,
      meta: { title: 'Bewerten' },
      beforeEnter: authGuard
    },
    {
      path: '/moderation',
      name: 'moderation',
      component: ModerationView,
      meta: { title: 'Moderation' },
      beforeEnter: authGuard
    },
    {
      path: '/banned',
      name: 'banned',
      component: BannedView,
      meta: { title: 'Gesperrt' }
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessagesView,
      meta: { title: 'Nachrichten' },
      beforeEnter: authGuard
    },
    {
      path: '/chat/:id',
      name: 'chat-detail',
      component: ChatDetailView,
      meta: { title: 'Chat' },
      beforeEnter: authGuard
    },
    {
      path: '/user/:id',
      name: 'public-profile',
      component: PublicProfileView,
      meta: { title: 'Fremdes Profil' },
      beforeEnter: authGuard
    },
  ]
})

export default router;
