import React from "react"
// @ts-ignore
import Editor from "./editor.js"
// @ts-ignore
import Project from "../project/project.js"
import { AppState, AppDispatch } from "../App"
import { Rect } from "../dockable/dockableData"


interface EditorContentProps
{
	appState: AppState
	appDispatch: AppDispatch
	contentId: number
	contentState: any
	contentStateSet: (newState: any) => void
	contentDispatch: (action: any) => void
	rect: Rect
}


export function EditorContent(props: EditorContentProps)
{
	let contentState = props.contentState
	if (!contentState)
	{
		contentState = Editor.reduce(contentState, { type: "init", project: Project.getDefault() })
		contentState = Editor.reduce(contentState, { type: "trackAdd", kind: "markers" })
		contentState = Editor.reduce(contentState, { type: "trackAdd", kind: "chords" })
		contentState = Editor.reduce(contentState, { type: "trackAdd", kind: "notes" })
		contentState = Editor.reduce(contentState, { type: "clearUndoStack" })
		props.contentStateSet(contentState)
		return null
	}

	const refCanvas = React.useRef<HTMLCanvasElement>(null)
	const needsResetView = React.useRef(true)
	
	const transformMousePos = (canvas: HTMLCanvasElement, ev: MouseEvent) =>
	{
		const rect = canvas.getBoundingClientRect()
		return {
			x: (ev.clientX - rect.left),
			y: (ev.clientY - rect.top)
		}
	}

	React.useEffect(() =>
	{
		const rect = refCanvas.current!.getBoundingClientRect()
		refCanvas.current!.width = rect.width
		refCanvas.current!.height = rect.height

		contentState = Editor.reduce(contentState, {
			type: "resize",
			w: rect.width,
			h: rect.height,
		})

		if (needsResetView.current)
		{
			needsResetView.current = false
			contentState = Editor.reduce(contentState, { type: "rewind" })
		}

		props.contentStateSet(contentState)

	}, [props.rect])

	React.useEffect(() =>
	{
		const preventDefault = (ev: Event) => ev.preventDefault()

		
		const onMouseMove = (ev: MouseEvent) =>
		{
			const p = transformMousePos(refCanvas.current!, ev)
			props.contentDispatch({ type: "mouseMove", ...p })
		}
		
		const onMouseDown = (ev: MouseEvent) =>
		{
			//if (window.document.activeElement)
			//	window.document.activeElement.blur()

			ev.preventDefault()
			const p = transformMousePos(refCanvas.current!, ev)

			props.contentDispatch({ type: "mouseMove", ...p })
			props.contentDispatch({ type: "mouseDown", rightButton: ev.button != 0, ctrlKey: ev.ctrlKey })
		}
		
		const onMouseUp = (ev: MouseEvent) =>
		{
			const p = transformMousePos(refCanvas.current!, ev)
			props.contentDispatch({ type: "mouseMove", ...p })
			props.contentDispatch({ type: "mouseUp" })
			props.contentDispatch({ type: "mouseMove", ...p })
		}
		
		const onMouseWheel = (ev: MouseWheelEvent) =>
		{
			ev.preventDefault()
			props.contentDispatch({ type: "mouseWheel", deltaX: ev.deltaX, deltaY: ev.deltaY })
		}
	
		const onKeyDown = (ev: KeyboardEvent) =>
		{
			props.contentDispatch({ type: "keyDown", key: ev.key.toLowerCase() })
			props.contentDispatch({
				type: "keyCommand",
				ev,
				key: ev.key.toLowerCase(),
				ctrlKey: ev.ctrlKey,
				shiftKey: ev.shiftKey,
			})
		}
	
		const onKeyUp = (ev: KeyboardEvent) =>
		{
			props.contentDispatch({ type: "keyUp", key: ev.key.toLowerCase() })
		}
		
		window.addEventListener("mousemove", onMouseMove)
		window.addEventListener("mouseup",   onMouseUp)
		window.addEventListener("keydown",   onKeyDown)
		window.addEventListener("keyup",     onKeyUp)
		
		refCanvas.current!.addEventListener("mousedown",   onMouseDown)
		refCanvas.current!.addEventListener("wheel",       onMouseWheel)
		refCanvas.current!.addEventListener("mouseup",     preventDefault)
		refCanvas.current!.addEventListener("contextmenu", preventDefault)
		
		return () =>
		{
			window.removeEventListener("mousemove", onMouseMove)
			window.removeEventListener("mouseup",   onMouseUp)
			window.removeEventListener("keydown",   onKeyDown)
			window.removeEventListener("keyup",     onKeyUp)
			
			refCanvas.current!.removeEventListener("mousedown",   onMouseDown)
			refCanvas.current!.removeEventListener("wheel",       onMouseWheel)
			refCanvas.current!.removeEventListener("mouseup",     preventDefault)
			refCanvas.current!.removeEventListener("contextmenu", preventDefault)
		}
		
	}, [props.contentId])
	
	React.useEffect(() =>
	{
		Editor.render(contentState, refCanvas.current!.getContext("2d"))
		
		const mouseAction = contentState.mouse.action || (contentState.mouse.hover && contentState.mouse.hover.action)
		
		if (contentState.mouse.draw || mouseAction & (Editor.actionDraw))
			refCanvas.current!.style.cursor = "crosshair"
		else if (mouseAction & (Editor.actionDragTime))
			refCanvas.current!.style.cursor = (contentState.mouse.down ? "grabbing" : "grab")
		else if (mouseAction & (Editor.actionPan))
			refCanvas.current!.style.cursor = "move"
		else if (mouseAction & (Editor.actionStretchTimeStart | Editor.actionStretchTimeEnd))
			refCanvas.current!.style.cursor = "col-resize"
		else
			refCanvas.current!.style.cursor = "text"
		
	}, [props.appState])
	
	return (
		<div style={{
			width: "100%",
			height: "100%",
		}}>
			<canvas ref={ refCanvas } style={{
				width: "100%",
				height: "100%",
			}}/>
		</div>
	)
}