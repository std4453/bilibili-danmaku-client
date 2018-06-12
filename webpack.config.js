const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const dev = !!process.env.WEBPACK_SERVE;
module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: ['babel-loader', 'eslint-loader'],
            },
        ],
    },
    plugins: dev ? [] : [
        new CleanWebpackPlugin(['dist']),
    ],
    devtool: 'source-map',
    target: 'web',

    mode: dev ? 'development' : 'production',
};
