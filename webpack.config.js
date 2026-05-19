const path = require("node:path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { watch } = require("node:fs");

const BASE_ENTRY = "./src/client/js/";

module.exports = {
	entry: {
		main: BASE_ENTRY + "main.js",
		videoPlayer: BASE_ENTRY + "videoPlayer.js",
		recorder: BASE_ENTRY + "recorder.js",
		comments: BASE_ENTRY + "comments.js",
		util: BASE_ENTRY + "util.js",
	},
	output: {
		path: path.resolve(__dirname, "assets"),
		filename: "js/[name].js",
		clean: true,
	},
	plugins: [new MiniCssExtractPlugin({ filename: "css/styles.css" })],
	module: {
		rules: [
			{
				test: /\.(?:js|mjs|cjs)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						targets: "defaults",
						presets: [["@babel/preset-env"]],
					},
				},
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					// Translates CSS into CommonJS
					"css-loader",
					// Compiles Sass to CSS
					"sass-loader",
				],
			},
		],
	},
	mode: "development",
	watch: true,
};
