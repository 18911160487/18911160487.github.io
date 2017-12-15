const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const GenerateAssetPlugin = require('generate-asset-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackDevServer = require('webpack-dev-server');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
let Mpc = function() {
	let obj = {},
		static_json_obj = {},
		mpcJs = {},
		mpcHtml = [],
		mpcJson = [];
	let arr = glob.sync('./src/html/*.html');
	let static_json_arr = glob.sync('./src/static/*.json');
	for(let i = 0; i < arr.length; i++) {
		obj[arr[i].substring(arr[i].lastIndexOf('\/') + 1, arr[i].lastIndexOf('.'))] = arr[i];
	}
	for(let i = 0; i < static_json_arr.length; i++) {
		static_json_obj[static_json_arr[i].substring(static_json_arr[i].lastIndexOf('\/') + 1, static_json_arr[i].lastIndexOf('.'))] = static_json_arr[i];
	}
	for(o in obj) {
		mpcJs[o] = './src/script/' + o + '/' + o + '.js';
		mpcHtml.push(new HtmlWebpackPlugin({
			filename: o + '.html',
			template: './src/html/' + o + '.html',
			inject: 'body',
			chunks: ['build', o],
			minify: {
				removeComments: true, //删除html里的注释
				collapseWhitespace: true //删除html里的空格obj
			}
		}))
	}
	for(o in static_json_obj) {
		mpcJson.push({
			from: './src/static/' + o + '.json',
			to: './static/' + o + '.json'
		});
	}
	return {
		'mpcJs': mpcJs,
		'mpcHtml': mpcHtml,
		'mpcJson': mpcJson
	}
}
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
			{
				test: /\.css$/,
				include: path.resolve(__dirname, 'src'),
				use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{
							loader: 'css-loader?importLoaders=1',
							options: {
								minimize: true //css压缩
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								plugins: function() {
									return [
										require('postcss-import'),
										autoprefixer({
											browsers: ['last 10 versions']
										})
									];
								}
							}
						}
					],
					allChunks: true,
					publicPath: '../'
				}))
			},
			{
				test: /\.less$/,
				include: path.resolve(__dirname, 'src'),
				use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{
							loader: 'css-loader?importLoaders=1',
							options: {
								minimize: true //css压缩
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								plugins: function() {
									return [
										autoprefixer({
											browsers: ['last 10 versions']
										})
									];
								}
							}
						},
						{
							loader: 'less-loader'
						}
					],
					allChunks: true,
					publicPath: '../'
				}))
			},
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
//		new WebpackDevServer({
//			devServer: {
//				contentBase: path.join(__dirname, "dist"),
//				compress: true,
//				port: 9000
//			}
//		})
		//		new CleanWebpackPlugin(['dist'])
		//		new webpack.optimize.UglifyJsPlugin(),
		//		new UglifyJSPlugin(),
	].concat(new Mpc().mpcHtml),
}