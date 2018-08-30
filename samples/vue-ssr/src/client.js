import createApp from './lib/base-app';
const context = {}
const { app } = createApp(context);
app.$mount('#app');