var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var webpack = require('webpack');
var ignore = new webpack.IgnorePlugin(/^(graphinius)$/)

module.exports = {
  entry: './index.js',
  output: {
    path: __dirname,
    filename: 'graphinius.vis.js'
  },
  target: "web",
  module: {
    loaders: [
      // { test: /\.css$/, loader: 'style!css!' },
      {
        test: /\.json$/,
        loader: 'json!'
      }
    ]
  },
  node: {
    fs: "empty",
    http: "empty",
    request: "empty",
    net: "empty",
    tls: "empty"
  },
  plugins: [
    new BrowserSyncPlugin({
      // browse to http://localhost:3000/ during development,
      // ./public directory is being served
      host: 'localhost',
      port: 3000,
      server: { baseDir: ['./'] }
    }),
    ignore
  ]
};
