import React from "react"
import ReactDOM from "react-dom"
import App from "./App.tsx"


document.body.onload = function()
{
	ReactDOM.render(<App/>, document.getElementById("divApp"))
}