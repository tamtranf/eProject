import { createRouter, createWebHistory } from 'vue-router';

const routes = [];
// Define here the name of each file that should be part to the router
[

  require('../views/master_user_permission-form'),
  require('../views/master_user_permission-list'),
  require('../views/master_user-form'),
  require('../views/master_user-list'),
  require('../views/master_entity-form'),
  require('../views/master_entity-list'),
  require('../views/car-form'),
  require('../views/car-list'),
  require('../views/entity'),
  require('../views/login'),
  require('../views/home'),
  require('../views/about'),
  require('../views/templates'),
  require('../views/template-form'),
  require('../views/template-list'),
  require('../views/test'),
  require('../views/dev'),
  require('../views/test_3004'),

].forEach((file) => {
  file.default.routes.forEach((r) => {
    r.component = file.default;
    routes.push(r);
  });
});

// Here it configure the routes
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Here it authenticate the cookies, adust it based on the login rules
const checkCookies = () => {
  let found = 0;
  const s = document.cookie.split(';');
  s.forEach((c) => {
    const kv = c.trim().split('=');
    if (kv[0] === 'session_key' && kv[1].length > 70) {
      found += 1;
    }
    if (kv[0] === 'session_user' && kv[1].length > 0) {
      found += 1;
    }
  });
  return found === 2;
};

const checkEntity = () => {
  let found = 0;
  const s = document.cookie.split(';');
  s.forEach((c) => {
    const kv = c.trim().split('=');
    if (kv[0] === 'session_entity' && kv[1].length > 70) {
      found += 1;
    }
  });
  return found === 1;
};
// Before it navigate to each page, it will run this.
// If the requiresAuth be set then it will check the cookies,
// if the cookies don't be valid, then it will redirect to the
// expired page.

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth === false) {
    next();
  } else if (checkCookies() === false) {
    next({
      path: '/login',
    });
    if (checkEntity === false) {
      next({ path: '/entity' });
    }
  } else {
    next();
  }
  // if (to.meta.requiresAuth === true && checkCookies() === false) {
  //   next({
  //     path: '/expired',
  //   });
  // } else {
  //   console.log('router accessing page', to.name);
  //   next();
  // }
});

export default router;
