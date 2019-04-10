import { Editor } from "./editor/editor.js"


let gEditor = null


document.body.onload = function()
{
	gEditor = new Editor(document.getElementById("canvasMain"))
	gEditor.draw()
}