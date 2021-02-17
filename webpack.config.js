const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/main.ts',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, 'src')],
        exclude: [path.resolve(__dirname, 'src/api_keys.js')],

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
};
