const path = require('path')
const webpack = require('webpack')
const { DefinePlugin } = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
const isProduction = process.env.NODE_ENV === 'production'
const { VueLoaderPlugin } = require('vue-loader')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const outputPath = path.join(__dirname, '..', 'dist');
const generateContent = require('./generate-content');
const builds = [
  {
    type: 'server',
    target: 'node',
    extractCss: isProduction,
    entry: path.join(__dirname, '..', 'src', 'server.js'),
    plugins: [
      new VueSSRServerPlugin()
    ],
    library: 'ssrSample',
    libraryTarget: 'commonjs2',
    devtool: '#source-map',
    hot: false,
    serverSideRender: true
  },
  {
    type: 'client',
    target: 'web',
    extractCss: isProduction,
    entry: path.join(__dirname, '..', 'src', 'client.js'),
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'server.html',
        template: path.join(__dirname, '..', 'src', 'templates', 'server.html'),
        inject: false
      }),
      new VueSSRClientPlugin()
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'manifest',
            chunks: 'all'
          }
        }
      }
    },
    devtool: (isProduction ? '#source-map' : '#eval-source-map'),
    hot: true,
    serverSideRender: true
  }
];
module.exports = builds.map(build => {
  const css_loaders = build.extractCss ? [{loader: "vue-style-loader"}, MiniCssExtractPlugin.loader, {loader: "css-loader"}] : [{loader: "vue-style-loader"}, {loader: "css-loader"}];
  return {
    entry: build.entry,
    mode: isProduction ? 'production' : 'development',
    output: {
      path: outputPath,
      publicPath: '/',
      filename: '[name].js',
      library: build.library,
      libraryTarget: build.libraryTarget
    },
    target: build.target,
    plugins: [
      new DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
      }),
      new VueLoaderPlugin()
    ].concat(build.plugins || []).concat(build.extractCss ? new MiniCssExtractPlugin({filename: '[name].css'}) : []),
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.js$/,
          exclude: /(node_modules|)/,
          use: [{loader: "babel-loader", options: {"presets": [["env", { "modules": false }], "stage-3"]}}]
        },
        {
          test: /\.css$/,
          use: css_loaders
        },
        {
          test: /\.scss$/,
          use: css_loaders.concat([{loader: "sass-loader"}])
        },
        {
          test: /\.sass$/,
          use: css_loaders.concat([{loader: "sass-loader?indentedSyntax"}])
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'file-loader',
          query: {
            name: 'images/[name].[ext]?[hash]',
            emitFile: true,
            publicPath: '/'
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
        }
      ]
    },
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.runtime.esm.js'
      },
      extensions: ['*', '.js', '.vue', '.json']
    },
    serve: {
      hotClient: false,
      devMiddleware: {
        publicPath: '/',
        serverSideRender: true,
        index: false
      },
      add: (app, middleware, options) => {
        middleware.webpack();
        middleware.content();
        const processRequest = generateContent({outputPath});
        app.use(async (ctx, next) => {
          try {
            await next();
            await processRequest(ctx);
          } catch (err) {
            ctx.body = { message: err.message }
            ctx.status = err.status || 500
          }
        })
      }
    },
    performance: {
      hints: false
    },
    optimization: (build.optimization || {}),
    devtool: (build.devtool || false)
  };
});