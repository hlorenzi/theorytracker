import "core-js"
import "regenerator-runtime/runtime"


import React from "react"
import ReactDOM from "react-dom"
import { Synth } from "./synth/synth.js"
import App from "./App.tsx"


let gSynth = null


document.body.onload = function()
{
	//gSynth = new Synth()
	
	ReactDOM.render(<App/>, document.getElementById("divApp"))
	//ReactDOM.render(<App synth={ gSynth }/>, document.getElementById("divApp"))
	
	//window.onbeforeunload = () => "Discard unsaved changes?"
}