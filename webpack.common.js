// webpack v5
// comon configuration between development and production bundle.

const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin')

module.exports = {
  entry: {
    main: './src/js/index.js',
    page404: './src/js/404.js',
    pageLegalNotice: './src/js/legal-notice.js'
  },
  output: {
    path: path.resolve(process.cwd(), 'dist'),
    filename: '[name].[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192, // Convert images < 8kb to base64 strings
            name: '[contenthash]-[name].[ext]',
            outputPath: 'img',
            esModule: false
          }
        }]
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      },
      {
        test: /\.json$/,
        loader: 'file-loader',
        options: {
          name: 'configs/[name].[ext]'
        },
        type: 'javascript/auto',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './src/404.html',
      filename: '404.html',
      chunks: ['page404']
    }),
    new HtmlWebpackPlugin({
      template: './src/legal-notice.html',
      filename: 'legal-notice.html',
      chunks: ['pageLegalNotice']
    }),
    new HtmlWebpackInlineSVGPlugin({
      runPreEmit: true
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/browserconfig.xml', to: './' },
        { from: './src/favicon.ico', to: './' },
        { from: './src/humans.txt', to: './' },
        { from: './src/icon.png', to: './' },
        { from: './src/robots.txt', to: './' },
        { from: './src/site.webmanifest', to: './' },
        { from: './src/tile-wide.png', to: './' },
        { from: './src/tile.png', to: './' }
      ]
    })
  ]
}
