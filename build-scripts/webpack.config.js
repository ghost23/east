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
	output: {
		path: path.resolve(__dirname, "../out"),
		filename: "static/js/[name].js",
		chunkFilename: "static/js/[name].chunk.js",
		sourceMapFilename: "[file].map",
		publicPath: "./"
	},

	node: {
		__dirname: false
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
				use: "ts-loader"
			},
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: [
						"typings-for-css-modules-loader?modules&namedExport&camelCase&sourceMap&importLoaders=1&localIdentName=[local]_[hash:base64:8]",
						"sass-loader?outputStyle=expanded&sourceMap=true&sourceMapContents=true"
					]
				})
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
		// This helps ensure the builds are consistent if source hasn't changed:
		new webpack.optimize.OccurrenceOrderPlugin(),
		// Note: this won't work without ExtractTextPlugin.extract(..) in `loaders`.
		new ExtractTextPlugin("static/css/[name].css"),
		// Write out stats file to build directory.
		new StatsWriterPlugin({
			transform: function(data, opts) {
				let stats = opts.compiler.getStats().toJson({ chunkModules: true });
				return JSON.stringify(stats, null, 2);
			}
		})
	]
};

const electronConfigs = [
	Object.assign(
		{
			target: 'electron-main',
			entry: { main: './src/main/main.ts' }
		},
		config),
	Object.assign(
		config,
		{
			target: 'electron-renderer',
			entry: { ['edit-pane']: './src/edit-pane/edit-pane.tsx' },
			plugins: config.plugins.concat([new HtmlWebpackPlugin({
				template: './src/edit-pane/index.html'
			})])
		})
];

module.exports = electronConfigs;
