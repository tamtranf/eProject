import { createRouter, createWebHistory } from 'vue-router'

const routes = [];
//Define here the name of each file that should be part to the router
[
  require('../views/Home.vue'),
  require('../views/About.vue'),
  require('../views/Template.vue'),
  require('../views/Test.vue'),
  require('../views/Dev.vue'),
].forEach(file =>{
  file.default.routes.forEach((r)=>{
    r.component = file.default
    routes.push(r)
  })
})

// Here it configure the routes
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Here it authenticate the cookies, adust it based on the login rules
var checkCookies = () => {
  var found = 0;
  var s = document.cookie.split(";")
  s.forEach((c) => {
    var kv = c.trim().split("=")
    if (kv[0] == "session_key" && kv[1].length > 70) {
      found++;
    }
    if (kv[0] == "session_user" && kv[1].length > 0) {
      found++;

    }
  })
  return found == 2
}

// Before it navigate to each page, it will run this.
// If the requiresAuth be set then it will check the cookies, 
// if the cookies don't be valid, then it will redirect to the 
// expired page.

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth == true && checkCookies() == false) {
    next({
      path: '/expired',
    })
  } else {
    console.log("router accessing page",to.name)
    next()
  }

})

export default router
