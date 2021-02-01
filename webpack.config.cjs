const path = require("path")


module.exports =
{
	mode: "production",
	entry:
	{
		main: path.resolve(__dirname, "src/main.js"),
	},
	
	output:
	{
		filename: "[name].js",
		path: path.resolve(__dirname, "build")
	},
	
    resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"],
		fallback: {
			"assert": false,
			/*"zlib": require.resolve("browserify-zlib"),
			"util": require.resolve("util/"),
			"buffer": require.resolve("buffer/"),
			"stream": require.resolve("stream-browserify"),*/
		},
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