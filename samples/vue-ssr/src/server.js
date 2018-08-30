import createApp from './lib/base-app';
export default context => {
  return new Promise((resolve, reject) => {
    const { router, app } = createApp(context);
    router.push(context.url);
    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents();
      if (!matchedComponents.length) {
        return reject({ code: 404 });
      }
      resolve(app);
    }, reject);
  })
}