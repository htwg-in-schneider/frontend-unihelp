import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { createAuth0 } from '@auth0/auth0-vue'

const auth0 = createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        redirect_uri: window.location.origin + window.location.pathname
    },
    cacheLocation: 'localstorage'
})

const originalFetch = window.fetch;
window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 403) {
        try {
            const clone = response.clone();
            const data = await clone.json();

            let query = `?type=${data.type || 'UNKNOWN'}`;
            if (data.untilDate) query += `&until=${data.untilDate}`;
            if (data.reason) query += `&reason=${encodeURIComponent(data.reason)}`;

            router.push('/banned' + query);
        } catch (e) {
            router.push('/banned');
        }
    }
    return response;
};

const app = createApp(App)
const pinia = createPinia()

app.config.globalProperties.$formatPrice = (price) => {
    if (price === null || price === undefined) return '';
    return Number(price).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

app.use(router)
app.use(pinia)
app.use(auth0)
app.mount('#app')
