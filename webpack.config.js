const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

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
                use: ['babel-loader', 'eslint-loader'],
            },
            {
                test: /\.vue$/,
                use: 'vue-loader',
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    {
                        loader: 'css-loader',
                        options: { importLoaders: 1 },
                    },
                    'postcss-loader',
                ],
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: ['file-loader'],
            },
        ],
    },
    plugins: dev ? [
        new VueLoaderPlugin(),
    ] : [
        new VueLoaderPlugin(), new CleanWebpackPlugin(['dist']),
    ],
    devtool: 'source-map',
    target: 'web',

    mode: dev ? 'development' : 'production',
};
