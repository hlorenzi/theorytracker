import React from "react"
import Project from "../project/project.js"


function loadFile(dispatch, elem)
{
	if (elem.files.length != 1)
		return
	
	let reader = new FileReader()
	reader.readAsArrayBuffer(elem.files[0])
	reader.onload = () => 
	{
		const bytes = new Uint8Array(reader.result)
		if (bytes[0] == "M".charCodeAt(0) &&
			bytes[1] == "T".charCodeAt(0) &&
			bytes[2] == "h".charCodeAt(0) &&
			bytes[3] == "d".charCodeAt(0))
			loadFileMidi(dispatch, elem)
		else
            loadFileJson(dispatch, elem)
	}
}


function loadFileJson(dispatch, elem)
{
	if (elem.files.length != 1)
		return
	
	let reader = new FileReader()
	reader.readAsText(elem.files[0])
	reader.onload = () => 
	{
        const json = JSON.parse(reader.result)
        dispatch({ type: "projectLoad", project: Project.fromJson(json) })
	}
}


function loadFileMidi(dispatch, elem)
{
	if (elem.files.length != 1)
		return
	
	let reader = new FileReader()
	reader.readAsArrayBuffer(elem.files[0])
	reader.onload = () => 
	{
		const bytes = new Uint8Array(reader.result)
        dispatch({ type: "projectLoad", project: Project.fromMidi(bytes) })
	}
}


function loadJson(dispatch)
{
    const json = window.prompt("Paste JSON song data:", "")
    if (json)
        dispatch({ type: "projectLoad", project: Project.fromJson(JSON.parse(json)) })
}


function saveJson(project)
{
	const json = project.toJson()
	const newWindow = window.open()
	newWindow.document.write("<code style='white-space:pre'>")
	newWindow.document.write(json)
	newWindow.document.write("</code>")
}


function saveAndSetUrl(project)
{
	const str = project.toCompressedStr()
	window.location = location.protocol + "//" + location.host + location.pathname + "?data=" + str
}


export default function ToolboxFile(props)
{
    const state = props.state

    const inputFileRef = React.useRef(null)
    const performInputFileClick = () => inputFileRef.current.click()

    const newProject = () =>
    {
        props.dispatch({ type: "projectSet", project: Project.getDefault() })
        props.dispatch({ type: "rewind" })
    }
    
	return <>
        <div style={{
            display: "grid",
            gridTemplate: "auto / auto",
            gridGap: "0.25em 0.25em",
            alignItems: "center",
            ...props.style,
        }}>
            <div style={{ justifySelf:"left" }}>
                <button
                    title="New"
                    onClick={ newProject }
                    style={{ fontSize:"18px" }}
                >
                    🗑️
                </button>

                <div style={{ display:"inline-block", width:"0.5em" }}/>
               
                <button
                    title="Load MIDI or JSON from file"
                    onClick={ performInputFileClick }
                    style={{ fontSize:"18px" }}
                >
                    📂
                </button>
                
                <button
                    title="Paste JSON string"
                    onClick={ () => loadJson(props.dispatch) }
                    style={{ fontSize:"18px" }}
                >
                    📋
                </button>
                
                <div style={{ display:"inline-block", width:"0.5em" }}/>
                
                <button
                    title="Save as JSON"
                    onClick={ () => saveJson(state.project) }
                    style={{ fontSize:"18px" }}
                >
                    💾
                </button>

                <button
                    style={{ fontSize:"18px" }}
                    title="Generate URL"
                    onClick={ () => saveAndSetUrl(state.project) }
                >
                    🔗
                </button>
                
                <input
                    ref={ inputFileRef }
                    type="file"
                    accept=".mid,.json,.txt"
                    onChange={ ev => loadFile(props.dispatch, ev.target) }
                    style={{ display:"none", width:"1em" }}
                />
            </div>
            
        </div>
    </>
}