import React from "react"
import Editor from "../editor/editor.js"
import Project from "../project/project.js"
import { usePlaybackController } from "./PlaybackController.js"
import ToolboxPlayback from "./ToolboxPlayback.js"
import ToolboxFile from "./ToolboxFile.js"
import ToolboxEdit from "./ToolboxEdit.js"
import ToolboxInput from "./ToolboxInput.js"
import Ribbon from "./Ribbon.js"


function EditorComponent(props)
{
	const refCanvas = React.useRef()
	const needsResetView = React.useRef(true)
	
	const transformMousePos = (canvas, ev) =>
	{
		const rect = canvas.getBoundingClientRect()
		return {
			x: (ev.clientX - rect.left),
			y: (ev.clientY - rect.top)
		}
	}

	React.useEffect(() =>
	{
		const preventDefault = (ev) => ev.preventDefault()

		const onResize = (ev) =>
		{
			const rect = refCanvas.current.getBoundingClientRect()
			refCanvas.current.width = rect.width
			refCanvas.current.height = rect.height

			props.dispatch({
				type: "resize",
				w: rect.width,
				h: rect.height,
			})

			if (needsResetView.current)
			{
				needsResetView.current = false
				props.dispatch({ type: "rewind" })
			}
		}
		
		const onMouseMove = (ev) =>
		{
			const p = transformMousePos(refCanvas.current, ev)
			props.dispatch({ type: "mouseMove", ...p })
		}
		
		const onMouseDown = (ev) =>
		{
			if (window.document.activeElement)
				window.document.activeElement.blur()

			ev.preventDefault()
			const p = transformMousePos(refCanvas.current, ev)
			props.dispatch({ type: "mouseMove", ...p })
			props.dispatch({ type: "mouseDown", rightButton: ev.button != 0, ctrlKey: ev.ctrlKey })
		}
		
		const onMouseUp = (ev) =>
		{
			const p = transformMousePos(refCanvas.current, ev)
			props.dispatch({ type: "mouseMove", ...p })
			props.dispatch({ type: "mouseUp" })
			props.dispatch({ type: "mouseMove", ...p })
		}
		
		const onMouseWheel = (ev) =>
		{
			ev.preventDefault()
			props.dispatch({ type: "mouseWheel", deltaX: ev.deltaX, deltaY: ev.deltaY })
		}
	
		const onKeyDown = (ev) =>
		{
			props.dispatch({ type: "keyDown", key: ev.key.toLowerCase() })
			props.dispatch({
				type: "keyCommand",
				ev,
				key: ev.key.toLowerCase(),
				ctrlKey: ev.ctrlKey,
				shiftKey: ev.shiftKey,
			})
		}
	
		const onKeyUp = (ev) =>
		{
			props.dispatch({ type: "keyUp", key: ev.key.toLowerCase() })
		}
		
		onResize()

		window.addEventListener("resize",    onResize)
		window.addEventListener("mousemove", onMouseMove)
		window.addEventListener("mouseup",   onMouseUp)
		window.addEventListener("keydown",   onKeyDown)
		window.addEventListener("keyup",     onKeyUp)
		
		refCanvas.current.addEventListener("mousedown",   onMouseDown)
		refCanvas.current.addEventListener("wheel",       onMouseWheel)
		refCanvas.current.addEventListener("mouseup",     preventDefault)
		refCanvas.current.addEventListener("contextmenu", preventDefault)
		
		return () =>
		{
			window.removeEventListener("resize",    onResize)
			window.removeEventListener("mousemove", onMouseMove)
			window.removeEventListener("mouseup",   onMouseUp)
			window.removeEventListener("keydown",   onKeyDown)
			window.removeEventListener("keyup",     onKeyUp)
			
			refCanvas.current.removeEventListener("mousedown",   onMouseDown)
			refCanvas.current.removeEventListener("wheel",       onMouseWheel)
			refCanvas.current.removeEventListener("mouseup",     preventDefault)
			refCanvas.current.removeEventListener("contextmenu", preventDefault)
		}
		
	}, [])
	
	React.useEffect(() =>
	{
		Editor.render(props.state, refCanvas.current.getContext("2d"))
		
		const mouseAction = props.state.mouse.action || (props.state.mouse.hover && props.state.mouse.hover.action)
		
		if (props.state.mouse.draw || mouseAction & (Editor.actionDraw))
			refCanvas.current.style.cursor = "crosshair"
		else if (mouseAction & (Editor.actionDragTime))
			refCanvas.current.style.cursor = (props.state.mouse.down ? "grabbing" : "grab")
		else if (mouseAction & (Editor.actionPan))
			refCanvas.current.style.cursor = "move"
		else if (mouseAction & (Editor.actionStretchTimeStart | Editor.actionStretchTimeEnd))
			refCanvas.current.style.cursor = "col-resize"
		else
			refCanvas.current.style.cursor = "text"
		
	}, [props.state])
	
	return (
		<div style={{ ...props.style }}>
			<canvas ref={ refCanvas } style={{ width: "100%", height: "100%" }}/>
		</div>
	)
}


export default function App(props)
{
	const initEditor = (state) =>
	{
		state = Editor.reduce(state, { type: "init", project: Project.getDefault() })
		state = Editor.reduce(state, { type: "trackAdd", kind: "markers" })
		state = Editor.reduce(state, { type: "trackAdd", kind: "chords" })
		state = Editor.reduce(state, { type: "trackAdd", kind: "notes" })
		state = Editor.reduce(state, { type: "clearUndoStack" })

		const urlData =
			getQueryParam(window.location.search, "data") ||
			getQueryParam(window.location.search, "song")

		if (urlData)
		{
			try
			{
				state = Editor.reduce(state, { type: "projectLoad", project: Project.fromCompressedStr(urlData) })
			}
			catch (e)
			{
				window.alert("An error occurred loading the project from the URL.\n\n" + e.toString())
				console.error(e)
			}
		}

		return state
	}
	
	const [state, dispatch] = React.useReducer(Editor.reduce, {}, initEditor)

	const playbackController = usePlaybackController(state, dispatch, props.synth)
	
	return (
		<div style={{
			width: "100vw",
			height: "100vh",
			boxSizing: "border-box",
			display: "grid",
			gridTemplate: "150px 1fr / 1fr",
		}}>
			<div style={{
				gridRow: 1,
				gridColumn: 1,
				boxSizing: "border-box",
				display: "grid",
				gridTemplate: "1fr / auto 1fr",
				borderBottom: "1px solid #454545",
				alignItems: "start",
			}}>
				<Ribbon.Toolbar style={{ gridRow: 1, gridColumn: 1 }}>
					{ ToolboxPlayback({ state, dispatch, playbackController }) }
				</Ribbon.Toolbar>
				
				<Ribbon.Toolbar style={{ gridRow: 1, gridColumn: 2 }}>
					{ ToolboxFile({ state, dispatch }) }
					{ ToolboxEdit({ state, dispatch }) }
					{ ToolboxInput({ state, dispatch }) }
				</Ribbon.Toolbar>

				{/*<ToolboxFile
					state={ state }
					dispatch={ dispatch }
					style={{ gridRow: 1, gridColumn: 1 }}
				/>
				<ToolboxPlayback
					state={ state }
					dispatch={ dispatch }
					playbackController={ playbackController }
					style={{ gridRow: 2, gridColumn: 1 }}
				/>
				<ToolboxInput
					state={ state }
					dispatch={ dispatch }
					style={{ gridRow: "1 / 3", gridColumn: 2 }}
				/>*/}
			</div>
			
			<EditorComponent
				state={ state }
				dispatch={ dispatch }
				style={{ gridRow: 2, gridColumn: 1 }}
			/>
		</div>
	)
}


function getQueryParam(url, name)
{
	name = name.replace(/[\[\]]/g, "\\$&")
	
	const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
	const results = regex.exec(url)
	
	if (!results)
		return null
	
	if (!results[2])
		return ""
	
	return decodeURIComponent(results[2].replace(/\+/g, " "))
}