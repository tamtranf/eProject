import { createApp } from 'vue';
// import Vue from 'vue'
import App from './App';
import router from './router';
import store from './store';
import ajax from './libs/ajax';

// Vue.prototype.$ajax = ajax;

import '../node_modules/bootstrap/dist/css/bootstrap.css';

const app = createApp(App);
app.config.globalProperties.$ajax = ajax;
app.use(store).use(router).mount('#app');
