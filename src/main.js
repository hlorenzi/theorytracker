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
	gEditor.draw()
}