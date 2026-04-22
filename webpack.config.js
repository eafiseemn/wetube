const path = require("node:path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { watch } = require("node:fs");

module.exports = {
	entry: "./src/client/js/main.js",
	output: {
		path: path.resolve(__dirname, "assets"),
		filename: "js/main.js",
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
