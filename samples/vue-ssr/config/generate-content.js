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

  return (request, content, fs) => new Promise((resolve, reject) => {
    const indexHtml = path.join(outputPath, 'index.html');
    const serverHtmlFilename = path.join(outputPath, 'server.html');
    const serverBundleFilename = path.join(outputPath, 'vue-ssr-server-bundle.json');
    const clientManifestFilename = path.join(outputPath, 'vue-ssr-client-manifest.json');
    const parsedUrl = url.parse(request.url);
    const filename = request.notFound ? null : request.filename;
    if (filename === null) {
      // Skip files containing dots, like connect-history-api-fallback
      if (parsedUrl.pathname.lastIndexOf('.') > parsedUrl.pathname.lastIndexOf('/')) {
        return reject();
      }
    }
    else if (path.normalize(filename) != path.normalize(indexHtml)) {
      // Existing files are served by webpack-dev-middleware as is
      return resolve(content);
    }
    // From here on it's always index.html
    return Promise.all([fetchFile(fs, serverBundleFilename), fetchFile(fs, clientManifestFilename), fetchFile(fs, serverHtmlFilename)])
      .then(files => {
        const ssrContext = {}
        ssrContext.url = request.url;
        ssrContext.title = 'title';
        const serverBundle = JSON.parse(files[0].toString());
        const clientManifest = JSON.parse(files[1].toString());
        const template = files[2].toString();
        const renderer = createBundleRenderer(serverBundle, {
          template,
          clientManifest,
          runInNewContext: false
        });
        return renderer.renderToString(ssrContext);
      })
      .then(app => resolve(Buffer.from(app)) )
      .catch(reject);
  });
}