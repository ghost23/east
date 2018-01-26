const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const StatsWriterPlugin = require("webpack-stats-plugin").StatsWriterPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
	// Don't attempt to continue if there are any errors.
	bail: true,
	// We generate sourcemaps in production. This is slow but gives good results.
	// You can exclude the *.map files from the build during deployment.
	devtool: "source-map",

  target: 'electron-renderer',
  entry: { ['editor-view']: ['react-hot-loader/patch', './src/editor-view/index.tsx'] },

	output: {
		path: path.resolve(__dirname, "../out"),
		filename: "static/js/[name].js",
		chunkFilename: "static/js/[name].chunk.js",
		sourceMapFilename: "[file].map",
		publicPath: "./"
	},

	node: {
		__dirname: true
	},

  devServer: {
    contentBase: path.resolve(__dirname, "../out"),
    publicPath: "/",
    historyApiFallback: true,
    hotOnly: true,
  },

	module: {
		rules: [
			{
				exclude: [/\.html$/, /\.(js|jsx)$/, /\.(ts|tsx)$/, /\.css$/, /\.scss$/, /\.json$/, /\.svg$/],
				loader: "url-loader",
				query: {
					limit: 10000,
					name: "static/media/[name].[ext]"
				}
			},
			{
				test: /\.tsx?$/,
				loaders: ['react-hot-loader/webpack', 'ts-loader']
			},
			{
				test: /\.scss$/,
				loader: "style-loader!typings-for-css-modules-loader?modules&namedExport&camelCase&sourceMap&importLoaders=1&localIdentName=[local]_[hash:base64:8]!sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true"
			},
			{
				test: /\.svg$/,
				loader: "file-loader",
				query: {
					name: "static/media/[name].[ext]"
				}
			}
		]
	},

	resolve: {
		extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
	},

	plugins: [
		// Write out stats file to build directory.
    new HtmlWebpackPlugin({
      inject: true,
      template: './src/editor-view/index.html'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
	]
};

module.exports = config;
