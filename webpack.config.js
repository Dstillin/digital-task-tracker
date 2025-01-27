module.exports = {
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
          exclude: /node_modules\/(?!uuid)/, // Exclude uuid from source map loader
        },
      ],
    },
    devtool: 'source-map', // Ensures source maps are generated for your code
  };
  