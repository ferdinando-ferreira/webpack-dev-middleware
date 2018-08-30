const path = require('path')
const url = require('url')
const { createBundleRenderer } = require('vue-server-renderer');
module.exports = (options) => {
  const outputPath = options.outputPath;
  const fetchFile = (fs, filename) => new Promise((resolve, reject) => {
    fs.readFile(filename, (err, content) => {
      if (err) {
        reject();
      } else {
        resolve(content);
      }
    })
  });
  return (ctx) => new Promise((resolve, reject) => {
    if (ctx.response.status != 404) {
      return resolve();
    }
    const fs = ctx.state.fs;
    const parsedUrl = url.parse(ctx.req.url);
    const parsedPath = path.parse(parsedUrl.pathname);
    const filename = parsedPath.base;
    const extension = parsedPath.ext;
    if (extension != '') {
      return resolve();
    }
    const serverHtmlFilename = path.join(outputPath, 'server.html');
    const serverBundleFilename = path.join(outputPath, 'vue-ssr-server-bundle.json');
    const clientManifestFilename = path.join(outputPath, 'vue-ssr-client-manifest.json');
    return Promise.all([fetchFile(fs, serverBundleFilename), fetchFile(fs, clientManifestFilename), fetchFile(fs, serverHtmlFilename)]).then(files => {
      const ssrContext = {}
      ssrContext.url = ctx.req.url;
      ssrContext.title = 'title';
      const serverBundle = JSON.parse(files[0].toString());
      const clientManifest = JSON.parse(files[1].toString());
      const template = files[2].toString();
      const renderer = createBundleRenderer(serverBundle, {
        template,
        clientManifest,
        runInNewContext: false
      });
      renderer.renderToString(ssrContext).then(body => {
        ctx.body = body;
        ctx.status = 200;
        resolve();
      });
    });
  });
}