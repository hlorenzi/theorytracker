import React from "react"
import ReactDOM from "react-dom"
import { Editor } from "./editor/editor.js"
import Toolbox from "./toolbox/toolbox.js"


let gEditor = null


document.body.onload = function()
{
	gEditor = new Editor(document.getElementById("canvasMain"))
	
	gEditor.toolboxRefreshFn = () =>
	{
		ReactDOM.render(<Toolbox editor={ gEditor }/>, document.getElementById("divToolbox"))
	}
	
	gEditor.toolboxRefreshFn()
	onResize()
	
	document.body.onresize = (ev) => onResize()
}


function onResize()
{
	const rect = document.getElementById("canvasMain").getBoundingClientRect()
	gEditor.resize(rect.width, rect.height)
}