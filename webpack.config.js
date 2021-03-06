const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
      index: './src/index',
      lang: './src/lang'
  }, 
  // uncomment devtool for debugging
  // devtool: 'inline-source-map',
  // change to development when debugging
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/, 
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader', 
          options: {
            interpolate: true, 
            minimize: true
          }
        }
      }, 
    ]
  },
  resolve: {
    extensions: [
      '.ts', '.js'
    ], 
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: './dist/'
  }, 
  externals: {
    jquery: 'jQuery', 
    // '@material/chips': 'mdc.chips',
    '@material/dialog': 'mdc.dialog',
    '@material/icon-button': 'mdc.iconButton',
    '@material/linear-progress': 'mdc.linearProgress',
    '@material/list': 'mdc.list',
    '@material/menu': 'mdc.menu',
    '@material/menu-surface': 'mdc.menuSurface',
    '@material/ripple': 'mdc.ripple',
    '@material/select': 'mdc.select',
    '@material/slider': 'mdc.slider',
    '@material/snackbar': 'mdc.snackbar', 
    '@material/switch': 'mdc.switchControl',
    '@material/tab-bar': 'mdc.tabBar',
    '@material/textfield': 'mdc.textField',
  }, 
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: '../index.html'
    })
  ]
};