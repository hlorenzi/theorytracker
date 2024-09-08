const path = require("path")


module.exports = {
    mode: "production",
	devtool: "source-map",
    
	entry: {
		main: path.resolve(__dirname, "src/main.tsx"),
	},
	
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, ".build"),
		publicPath: "/.build/",
	},

	resolve: {
        extensions: [".ts", ".tsx"],
		fallback: {
			"assert": false,
		},
    },

	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				exclude: /node_modules/,
				use:
				{
					loader: "babel-loader",
					options: {
						presets: [
							"@babel/preset-typescript",
                            "babel-preset-solid",
                        ]
					}
				}
			}
		]
	},
}