import "core-js"
import "regenerator-runtime/runtime"


import React from "react"
import ReactDOM from "react-dom"
import { Synth } from "./synth/synth.js"
import App from "./toolbox/App.js"
import AppTest from "./dockable/AppTest.tsx"


let gSynth = null


document.body.onload = function()
{
	gSynth = new Synth()
	
	ReactDOM.render(<AppTest/>, document.getElementById("divApp"))
	//ReactDOM.render(<App synth={ gSynth }/>, document.getElementById("divApp"))
	
	//window.onbeforeunload = () => "Discard unsaved changes?"
}