/* eslint import/no-extraneous-dependencies: 0 */
const Dotenv = require('dotenv-webpack');
const path = require('path');
const merge = require('webpack-merge');
const ManifestRevisionPlugin = require('manifest-revision-webpack-plugin');
// const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const baseConfig = require('./webpack.base.config');

// many of the webpack directives need an absolute path
const basedir = path.resolve(__dirname, '../');

// where we build all the dev JS files to
const buildDir = path.resolve(basedir, 'build', 'public');
const devServerPort = 2992;

const devConfig = {
  // tells Webpack to do some stuff, including setting NODE_ENV
  mode: 'development',
  // generate source maps to help debug in browser
  // devtool: 'source-map',
  // where to build dev files to for webpack-serve to work
  output: {
    path: buildDir,
    pathinfo: true,
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash].js',
    publicPath: 'http://localhost:'+devServerPort+'/', // needed to get correct path in dev manifest file
  },
  plugins: [
    // this writes JS files for our Flask server to read
    new ManifestRevisionPlugin(
      path.resolve(basedir, 'build', 'manifest.json'), // keep this path in sync with FlaskWebpack config
      { rootAssetPath: './src', // important that this be relative, not absolute
        ignorePaths: [/.*\.DS_Store/], // need to manually ignore the .DS_Store files generated on OSX
      },
    ),

    new Dotenv({
      path: path.resolve(__dirname, '../.env'), // Path to .env file (this is the default)
      safe: true, // load .env.example (defaults to "false" which does not use dotenv-safe)
    }),
    // add an intermediate caching step to speed up builds (except the first one)
    // new HardSourceWebpackPlugin(),
  ],
  devServer: {
    port: devServerPort,   // the server manifest config relies on this port
    contentBase: buildDir,  // we build the JS to static files, so server them up as Flask expects them
  },
  watch: true,  // ← important: webpack and the server will continue to run in watch mode
};

module.exports = merge.smart(baseConfig, devConfig);
