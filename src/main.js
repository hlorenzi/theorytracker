import "core-js"
import "regenerator-runtime/runtime"


import React from "react"
import ReactDOM from "react-dom"
import { Synth } from "./synth/synth.js"
import App from "./toolbox/App.js"
import { Toolbox, askBeforeUnload } from "./toolbox/toolbox.js"


let gSynth = null
let gPlaybackInterval = null
let gPrevPlaySampleTimestamp = -1


document.body.onload = function()
{
	gSynth = new Synth()
	
	ReactDOM.render(<App synth={ gSynth }/>, document.getElementById("divApp"))
	
	//window.onbeforeunload = () => (askBeforeUnload ? "Discard unsaved changes?" : null)
}