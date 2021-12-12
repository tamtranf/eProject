module.exports = {
  devServer: {
    port: 4000,
    open: true,
    compress: true,
    proxy: {
      '^/api': {
        target: 'http://localhost:4001',
        ws: true,
        changeOrigin: true
      }
    }
  },
  parallel:8
}