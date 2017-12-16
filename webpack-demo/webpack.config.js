const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const GenerateAssetPlugin = require('generate-asset-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const path = require('path');

let Mpc = require('./build/config/mpcFile.js');
let mpcCss = require('./build/config/mpcCss.js');
let mpcLess = require('./build/config/mpcLess.js');

let createServerConfig = function(compilation) {
	//	let cfgJson = {
	//		ApiUrl: 'localhost'
	//	};
	//	return JSON.stringify(cfgJson);
	return JSON.stringify({
		hash: compilation.hash
	});
}

module.exports = {
	entry: Object.assign({
		build: ['./src/common/common.js']
	}, new Mpc().mpcJs),
	output: {
		path: __dirname + '/dist',
		filename: 'js/[name]-[hash:5].js',
		//		publicPath: '/',
	},
	module: {
		rules: [{
				test: /\.js$/,
				loader: 'babel-loader',
				include: path.resolve(__dirname, 'src'),
				exclude: __dirname + '/node_modules/',
				query: {
					presets: ['es2015']
				}
			},
			{
				test: /\.html$/,
				loader: 'html-loader',
				include: path.resolve(__dirname, 'src'),
			},
			mpcCss,
			mpcLess,
			{
				test: /\.(png|jpg|gif|svg)$/i,
				loader: [{
					loader: 'url-loader',
					query: {
						limit: 8192,
						name: 'img/[name].[ext]'
					}
				}],
				include: path.resolve(__dirname, 'src')
			},
			{
				test: /\.json$/,
				loader: [{
					loader: 'json-loader',
					query: {
						name: 'static/[name].json'
					}
				}],
				include: path.resolve(__dirname, 'src')
			},
			{
				test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'fonts/[name]-[hash:7].[ext]'
				},
				include: path.resolve(__dirname, 'src')
			}
		]
	},
	plugins: [
		new GenerateAssetPlugin({
			filename: 'static/test.json', //输出到根目录下的test.json文件
			template: './src/static/ajax.json',
			fn: (compilation, cb) => {
				cb('', createServerConfig(compilation));
			},
			extraFiles: []
		}),
		new ExtractTextPlugin({
			filename: './css/[name]-[hash:5].css',
			allChunks: true,
			ignoreOrder: true
		}),
		new CopyWebpackPlugin(new Mpc().mpcJson),
		new CleanWebpackPlugin(['dist']),
//		new webpack.optimize.UglifyJsPlugin(),
//		new UglifyJSPlugin(),
	].concat(new Mpc().mpcHtml)
}