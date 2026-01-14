module.exports = {
  content: [
    "./src/views/**/*.html",
    "./src/public/js/**/*.js",
  ],
  css: ["./src/public/css/**/*.css"],
  output: "./dist",
  minify: {
    html: true,
    css: true,
    js: true
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    }
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
