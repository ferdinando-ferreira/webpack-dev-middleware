import Vue from 'vue'
import VueRouter from 'vue-router';
import App, { routes } from '../components/App.vue';
Vue.use(VueRouter);
export default context => { 
  const router = new VueRouter({
    mode: 'history',
    routes
  });
  const appOptions = {
    router,
    render: h => h(App)
  };
  const app = new Vue(appOptions)
  router.beforeEach((to, from, next) => {
    if (!(to.matched.length > 0)) {
      return next({ code: 404 });
    }
    else {
      context.title = to.meta.title;
      switch (process.env.VUE_ENV) {
        case 'server': {
          break;
        }
        default: {
          document.title = context.title;
          break;
        }
      }
      next();
    }
  });
  return { app, router }
}