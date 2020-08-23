const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
	mode: 'development',
  watchOptions: {
    ignored: /node_modules/
  },
  watchOptions: {
    ignored: /node_modules/
  },
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './dist',
		hot: true
	}
})
