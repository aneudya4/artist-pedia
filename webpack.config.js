const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/main.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, 'src')],
        use: 'ts-loader',
      },
      {
        // Exposes jQuery for use outside Webpack build
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: {
              exposes: ['jQuery', '$'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};
