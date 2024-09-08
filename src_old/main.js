import React from "react"
import ReactDOM from "react-dom"
import ReactDOMClient from "react-dom/client"
import App from "./App.tsx"


document.body.onload = function()
{
	const container = document.getElementById("divApp")
	const root = ReactDOMClient.createRoot(container)
	root.render(<App/>)
}