import React from "react"
import Ribbon from "./Ribbon.js"
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
    
	const examples =
	[
		"mozartk453",
		"letitgo",
		"rollercoaster",
		"adventure",
		"isaac",
		"dontstarve",
		"chronotrigger",
		"jimmyneutron",
		"whensomebodylovedme",
	]
	
    const loadExample = (filename) =>
    {
        if (filename == "")
            return
        
        fetch("examples/" + filename + ".json")
            .then(res => res.json())
            .then(json =>
            {
                props.dispatch({ type: "projectLoad", project: Project.fromJson(json) })
            })
    }

    return <Ribbon.Tab label="File">
        <Ribbon.Group label="File">
            <Ribbon.SlotButton tall
                icon="📄"
                label="New"
                onClick={ newProject }
            />
            <Ribbon.SlotButton tall
                icon="📂"
                label="Open..."
                onClick={ performInputFileClick }
            />
        </Ribbon.Group>
            
        <Ribbon.Group label="Link">
            <Ribbon.SlotButton tall
                icon="🔗"
                label="Generate"
                onClick={ () => saveAndSetUrl(state.project) }
            />
        </Ribbon.Group>

        <Ribbon.Group label="JSON">
            <Ribbon.SlotButton
                icon="💾"
                label="Save"
                onClick={ () => saveJson(state.project) }
            />
            <Ribbon.SlotButton
                icon="📋"
                label="Load..."
                onClick={ () => loadJson(props.dispatch) }
            />

            <input
                ref={ inputFileRef }
                type="file"
                accept=".mid,.json,.txt"
                onChange={ ev => loadFile(props.dispatch, ev.target) }
                style={{ display:"none", width:"1em" }}
            />

        </Ribbon.Group>

        <Ribbon.Group label="Example">
            <Ribbon.Slot>
                <Ribbon.SlotLayout
                    icon="💡"
                    label= {
                        <Ribbon.Select value={0} onChange={ ev => loadExample(ev.target.value) }>
                            <option value={""}>Load an example...</option>
                            { examples.map(ex => <option key={ ex } value={ ex }>{ ex }</option>) }
                        </Ribbon.Select>
                    }
                />
            </Ribbon.Slot>
        </Ribbon.Group>

    </Ribbon.Tab>
}