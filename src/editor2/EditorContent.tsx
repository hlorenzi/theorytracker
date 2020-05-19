import React from "react"
import Editor from "./editor"
import EditorState from "./editorState"
import { AppState, AppDispatch, ContentStateManager } from "../App"
import Rect from "../util/rect"


interface EditorContentProps
{
	state: ContentStateManager<EditorState>
	contentId: number
	appDispatch: AppDispatch
	contentDispatch: (action: any) => void
	rect: Rect
}


export function EditorContent(props: EditorContentProps)
{
	let state = props.state
	if (!state.contentState)
	{
		window.setTimeout(() =>
		{
			props.contentDispatch({ type: "init" })
			props.contentDispatch({ type: "tracksRefresh" })

		}, 0)
		return null
	}

	const refDiv = React.useRef<HTMLDivElement>(null)
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

	const resize = () =>
	{
		if (!refDiv.current)
			return
		
		const rect = refDiv.current!.getBoundingClientRect()
		const x = Math.floor(rect.x)
		const y = Math.floor(rect.y)
		const w = Math.floor(rect.width)
		const h = Math.floor(rect.height)
		
		refCanvas.current!.style.width = w + "px"
		refCanvas.current!.style.height = h + "px"
		refCanvas.current!.width = w
		refCanvas.current!.height = h

		props.contentDispatch({
			type: "resize",
			x,
			y,
			w,
			h,
		})
	}

	React.useEffect(() =>
	{
		resize()

	}, [props.rect])

	if (state.contentState.w == 0 && state.contentState.h == 0)
		window.requestAnimationFrame(resize)

	React.useEffect(() =>
	{
		const preventDefault = (ev: Event) => ev.preventDefault()

		
		const onMouseMove = (ev: MouseEvent) =>
		{
			const pos = transformMousePos(refCanvas.current!, ev)
			props.contentDispatch({ type: "mouseMove", pos })
		}
		
		const onMouseDown = (ev: MouseEvent) =>
		{
			//if (window.document.activeElement)
			//	window.document.activeElement.blur()

			ev.preventDefault()
			const pos = transformMousePos(refCanvas.current!, ev)

			props.contentDispatch({ type: "mouseMove", pos })
			props.contentDispatch({ type: "mouseDown", rightButton: ev.button != 0, ctrlKey: ev.ctrlKey })
		}
		
		const onMouseUp = (ev: MouseEvent) =>
		{
			const pos = transformMousePos(refCanvas.current!, ev)
			props.contentDispatch({ type: "mouseMove", pos })
			props.contentDispatch({ type: "mouseUp" })
			props.contentDispatch({ type: "mouseMove", pos })
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
		Editor.render(state, refCanvas.current!.getContext("2d")!)
		
		const mouseAction =
			state.contentState.mouse.action || 
			(state.contentState.mouse.hover && state.contentState.mouse.hover.action)!
		
		if (state.contentState.tracks.some((tr: any) => !!tr.draw) || mouseAction & (Editor.actionDraw))
			refCanvas.current!.style.cursor = "crosshair"
		else if (mouseAction & (Editor.actionDragTime))
			refCanvas.current!.style.cursor = (state.contentState.mouse.down ? "grabbing" : "grab")
		else if (mouseAction & (Editor.actionPan))
			refCanvas.current!.style.cursor = "move"
		else if (mouseAction & (Editor.actionStretchTimeStart | Editor.actionStretchTimeEnd))
			refCanvas.current!.style.cursor = "col-resize"
		else
			refCanvas.current!.style.cursor = "text"
		
	}, [props.state.appState])
	
	return (
		<div ref={ refDiv } style={{
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