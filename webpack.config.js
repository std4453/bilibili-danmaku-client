const webpack = require('webpack');
const path = require('path');

module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
				include: [path.resolve(__dirname, 'src')],
				loader: 'babel-loader',

				options: {
					presets: [
						'env',
						{
							modules: false
						}
					],

					plugins: ['syntax-dynamic-import']
				}
			}
		]
	},

	mode: 'development',

	optimization: {
		splitChunks: {
			chunks: 'async',
			minSize: 30000,
			minChunks: 1,
			name: false,

			cacheGroups: {
				vendors: {
					test: /[\\/]node_modules[\\/]/,
					priority: -10
				}
			}
		}
	}
};
