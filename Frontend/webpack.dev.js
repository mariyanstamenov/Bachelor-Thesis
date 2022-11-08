const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development',

  // entry: ['@babel/polyfill', './src/main.js'],
  entry: {
    index: './src/main.js'
    // app: ['@babel/polyfill', './src/main.js']
  },

  devServer: {
    port: 3000,
    static: [
      {
        directory: path.join(__dirname, 'src/public'),
      },
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: true,
      chunks: ['index'],
      filename: 'index.html'
    })
  ],

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          // The `injectType`  option can be avoided because it is default behaviour
          { loader: "style-loader", options: { injectType: "styleTag" } },
          "css-loader",
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      },
    ]
  }
};