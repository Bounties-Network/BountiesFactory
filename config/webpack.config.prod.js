var path = require('path');
var precss            = require('precss')
var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var S3Plugin = require('webpack-s3-plugin');
var argv = require('yargs').argv;
require('babel-loader');
var babelEnvDeps = require('webpack-babel-env-deps')


var deployment = argv.deploy;
// TODO: hide this behind a flag and eliminate dead code on eject.
// This shouldn't be exposed to the user.
var isInNodeModules = 'node_modules' ===
  path.basename(path.resolve(path.join(__dirname, '..', '..')));
var relativePath = isInNodeModules ? '../../..' : '..';
if (process.argv[2] === '--debug-template') {
  relativePath = '../template';
}
var srcPath = path.resolve(__dirname, relativePath, 'src');
var nodeModulesPath = path.join(__dirname, '..', 'node_modules');
var indexHtmlPath = path.resolve(__dirname, relativePath, 'index.html');
var faviconPath = path.resolve(__dirname, relativePath, 'favicon.ico');
var buildPath = path.join(__dirname, isInNodeModules ? '../../..' : '..', 'build');

var exclusionPattern = babelEnvDeps.exclude(); // returns /node_modules(?!(/|\\)(detect-indent|request|...)(/|\\))/ ]
var inclusionPattern = [
  srcPath,
  path.join(nodeModulesPath, 'query-string'),
  path.join(nodeModulesPath, 'acorn'),
  path.join(nodeModulesPath, 'cids'),
  path.join(nodeModulesPath, 'copy-webpack-plugin'),
  path.join(nodeModulesPath, 'css-color-keywords'),
  path.join(nodeModulesPath, 'dir-glob'),
  path.join(nodeModulesPath, 'eslint'),
  path.join(nodeModulesPath, 'esrecurse'),
  path.join(nodeModulesPath, 'ethjs-format'),
  path.join(nodeModulesPath, 'ethjs-provider-http'),
  path.join(nodeModulesPath, 'ethjs-query'),
  path.join(nodeModulesPath, 'ethjs-rpc'),
  path.join(nodeModulesPath, 'ethjs-signer'),
  path.join(nodeModulesPath, 'ethjs-util'),
  path.join(nodeModulesPath, 'globby'),
  path.join(nodeModulesPath, 'har-schema'),
  path.join(nodeModulesPath, 'har-validator'),
  path.join(nodeModulesPath, 'hosted-git-info'),
  path.join(nodeModulesPath, 'ipfs-api'),
  path.join(nodeModulesPath, 'ipfs-block'),
  // path.join(nodeModulesPath, 'ipfs-mini'),
  path.join(nodeModulesPath, 'ipfs-unixfs'),
  path.join(nodeModulesPath, 'ipld-dag-pb'),
  path.join(nodeModulesPath, 'is-hex-prefixed'),
  path.join(nodeModulesPath, 'jsx-ast-utils'),
  path.join(nodeModulesPath, 'libp2p-crypto'),
  path.join(nodeModulesPath, 'libp2p-crypto-secp256k1'),
  path.join(nodeModulesPath, 'lolex'),
  path.join(nodeModulesPath, 'material-ui'),
  path.join(nodeModulesPath, 'mississippi'),
  path.join(nodeModulesPath, 'moment'),
  path.join(nodeModulesPath, 'multihashing-async'),
  path.join(nodeModulesPath, 'nise'),
  path.join(nodeModulesPath, 'normalize-url'),
  path.join(nodeModulesPath, 'number-to-bn'),
  path.join(nodeModulesPath, 'p-limit'),
  path.join(nodeModulesPath, 'p-try'),
  path.join(nodeModulesPath, 'path-type'),
  path.join(nodeModulesPath, 'peer-id'),
  path.join(nodeModulesPath, 'peer-info'),
  path.join(nodeModulesPath, 'pem'),
  path.join(nodeModulesPath, 'pify'),
  path.join(nodeModulesPath, 'query-string'),
  path.join(nodeModulesPath, 'react-onclickoutside'),
  path.join(nodeModulesPath, 'react-responsive-navbar'),
  path.join(nodeModulesPath, 'react-router'),
  path.join(nodeModulesPath, 'react-select'),
  path.join(nodeModulesPath, 'react-sidecar'),
  path.join(nodeModulesPath, 'request'),
  path.join(nodeModulesPath, 'resolve-pkg'),
  path.join(nodeModulesPath, 'secp256k1'),
  path.join(nodeModulesPath, 'strict-uri-encode'),
  path.join(nodeModulesPath, 'strip-hex-prefix'),
  path.join(nodeModulesPath, 'styled-components'),
  path.join(nodeModulesPath, 'symbol-observable'),
  path.join(nodeModulesPath, 'type-d'),
];

console.log('----- about to exclude the following pattern: -----');
console.log();
console.log(exclusionPattern);
console.log();
console.log();
console.log('----- about to include the following pattern: -----');
console.log();
console.log(inclusionPattern);
console.log();


module.exports = {
  bail: true,
  devtool: 'source-map',
  entry: path.join(srcPath, 'index'),
  output: {
    path: buildPath,
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].chunk.js',
    // TODO: this wouldn't work for e.g. GH Pages.
    // Good news: we can infer it from package.json :-)
    publicPath: '/'
  },
  resolve: {
    root: srcPath,
    extensions: ['', '.js'],
    alias: {
      contracts: path.resolve('contracts')
    }
  },
  resolveLoader: {
    root: [ nodeModulesPath, path.resolve('lib/webpack-loaders') ],
    moduleTemplates: ['*-loader'],
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        include: srcPath
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        // include: srcPath,
        include: inclusionPattern,
        exclude: exclusionPattern,
        loader: 'babel',
        query: require('./babel.prod')
      },
      {
        test: /\.css$/,
        include: srcPath,
        // Disable autoprefixer in css-loader itself:
        // https://github.com/webpack/css-loader/issues/281
        // We already have it thanks to postcss.
        loader: ExtractTextPlugin.extract('style', 'css?-autoprefixer!postcss')
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(jpg|png|gif|eot|svg|ttf|woff|woff2)$/,
        loader: 'file',
      },
      {
        test: /\.(mp4|webm)$/,
        loader: 'url?limit=10000'
      },
      {
        test: /\.sol/,
        loader: 'truffle-solidity'
      }
    ]
  },
  eslint: {
    // TODO: consider separate config for production,
    // e.g. to enable no-console and no-debugger only in prod.
    configFile: path.join(__dirname, 'eslint.js'),
    useEslintrc: false
  },
  postcss: function() {
    return [precss, autoprefixer];
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: indexHtmlPath,
      favicon: faviconPath,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      WEB3_RPC_LOCATION: '"' + process.env.WEB3_RPC_LOCATION + '"'
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      },
      mangle: {
        screw_ie8: true
      },
      output: {
        comments: false,
        screw_ie8: true
      }
    }),
    new ExtractTextPlugin('[name].[contenthash].css'),
    new S3Plugin({
      s3Options: {
        region: 'us-east-1',
      },
      s3UploadOptions: {
        Bucket: deployment,
      },
    }),
  ]
};
