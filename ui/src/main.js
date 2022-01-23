import { createApp } from 'vue';
// import Vue from 'vue'
import Notifications from '@kyvg/vue3-notification';
import App from './App';
import router from './router';
import store from './store';
import ajax from './libs/ajax';

// Vue.prototype.$ajax = ajax;

const app = createApp(App);
app.config.globalProperties.$ajax = ajax;

app.use(store).use(router).use(Notifications).mount('#app');
