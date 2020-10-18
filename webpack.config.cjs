const path = require("path")


module.exports =
{
	mode: "production",
	entry:
	{
		main: path.resolve(__dirname, "src/main.js"),
		//test: path.resolve(__dirname, "src/test.ts"),
		//sflibWorklet: path.resolve(__dirname, "src/playback/sflibWorklet.ts"),
	},
	
	output:
	{
		filename: "[name].js",
		path: path.resolve(__dirname, "build")
	},
	
    resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"],
		fallback: { "assert": false },
	},
	
	module:
	{
		rules:
		[
			{
				test: /\.tsx?$/,
				exclude: /src_old/,
				loader: "ts-loader",
			},
			{ test: /\.js$/, loader: "source-map-loader" },
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use:
				{
					loader: "babel-loader",
					options: {
						plugins: ["@babel/plugin-proposal-class-properties"],
						presets: ["@babel/preset-env", "@babel/preset-react"]
					}
				}
			}
		]
	}
}