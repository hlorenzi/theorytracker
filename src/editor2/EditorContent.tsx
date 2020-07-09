import React from "react"
import Editor from "./editor"
import EditorState from "./editorState"
import { AppState, AppReducer, ContentManager } from "../AppState"
import { useAppManager } from "../AppContext"
import Rect from "../util/rect"


interface EditorContentProps
{
	contentId: number
	rect: Rect
}


export function EditorContent(props: EditorContentProps)
{
	const appManager = useAppManager()
	const contentCtx = appManager.makeContentManager<EditorState>(props.contentId)

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

	const resize = (contentCtx: ContentManager<EditorState>) =>
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

		Editor.resize(contentCtx, { x, y, w, h })
		Editor.tracksRefresh(contentCtx)
	}

	React.useEffect(() =>
	{
		resize(contentCtx)
		contentCtx.dispatch()
		
	}, [props.rect])

	React.useEffect(() =>
	{
		if (!refCanvas.current)
			return

		const refresh = () =>
		{
			if (!contentCtx.contentState || contentCtx.contentState.tracks.length == 0)
				resize(contentCtx)
		}
		
		const preventDefault = (ev: Event) => ev.preventDefault()

		const onMouseMove = (ev: MouseEvent) =>
		{
			refresh()
			const pos = transformMousePos(refCanvas.current!, ev)
			Editor.reduce_mouseMove(contentCtx, { pos })
			contentCtx.dispatch()
		}
		
		const onMouseDown = (ev: MouseEvent) =>
		{
			//if (window.document.activeElement)
			//	window.document.activeElement.blur()

			refresh()
			ev.preventDefault()
			const pos = transformMousePos(refCanvas.current!, ev)

			Editor.reduce_mouseMove(contentCtx, { pos })
			Editor.reduce_mouseDown(contentCtx, { rightButton: ev.button != 0, ctrlKey: ev.ctrlKey })
			contentCtx.dispatch()
		}
		
		const onMouseUp = (ev: MouseEvent) =>
		{
			refresh()
			const pos = transformMousePos(refCanvas.current!, ev)
			Editor.reduce_mouseMove(contentCtx, { pos })
			Editor.reduce_mouseUp(contentCtx, { })
			Editor.reduce_mouseMove(contentCtx, { pos })
			contentCtx.dispatch()
		}
		
		const onMouseWheel = (ev: MouseWheelEvent) =>
		{
			refresh()
			ev.preventDefault()
			Editor.reduce_mouseWheel(contentCtx, { deltaX: ev.deltaX, deltaY: ev.deltaY })
			contentCtx.dispatch()
		}
	
		const onKeyDown = (ev: KeyboardEvent) =>
		{
			refresh()
			Editor.reduce_keyDown(contentCtx, { key: ev.key.toLowerCase() })
			Editor.reduce_keyCommand(contentCtx, {
				ev,
				key: ev.key.toLowerCase(),
				ctrlKey: ev.ctrlKey,
				shiftKey: ev.shiftKey,
			})
			contentCtx.dispatch()
		}
	
		const onKeyUp = (ev: KeyboardEvent) =>
		{
			refresh()
			Editor.reduce_keyUp(contentCtx, { key: ev.key.toLowerCase() })
			contentCtx.dispatch()
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
			
			if (!refCanvas.current)
				return
		
			refCanvas.current!.removeEventListener("mousedown",   onMouseDown)
			refCanvas.current!.removeEventListener("wheel",       onMouseWheel)
			refCanvas.current!.removeEventListener("mouseup",     preventDefault)
			refCanvas.current!.removeEventListener("contextmenu", preventDefault)
		}
		
	}, [refCanvas.current, props.contentId])
	
	React.useEffect(() =>
	{
		if (!refCanvas.current)
			return

		Editor.render(contentCtx, refCanvas.current!.getContext("2d")!)
		
		const mouseAction =
			contentCtx.contentState.mouse.action || 
			(contentCtx.contentState.mouse.hover && contentCtx.contentState.mouse.hover.action)!
		
		if (contentCtx.contentState.tracks.some((tr: any) => !!tr.draw) || mouseAction & (Editor.actionDraw))
			refCanvas.current!.style.cursor = "crosshair"
		else if (mouseAction & (Editor.actionDragTime))
			refCanvas.current!.style.cursor = (contentCtx.contentState.mouse.down ? "grabbing" : "grab")
		else if (mouseAction & (Editor.actionPan))
			refCanvas.current!.style.cursor = "move"
		else if (mouseAction & (Editor.actionStretchTimeStart | Editor.actionStretchTimeEnd))
			refCanvas.current!.style.cursor = "col-resize"
		else
			refCanvas.current!.style.cursor = "text"
		
	}, [refCanvas.current, contentCtx.appState])
	
	React.useEffect(() =>
	{
		if (!contentCtx.contentState || contentCtx.contentState.tracks.length == 0)
		{
			window.requestAnimationFrame(() =>
			{
				resize(contentCtx)
				contentCtx.dispatch()
			})
			return
		}

	}, [props.contentId])


	return (
		<div ref={ refDiv } style={{
			width: "100%",
			height: "100%",
			position: "relative",
			overflow: "hidden",
		}}>
			<canvas ref={ refCanvas } style={{
				width: "100%",
				height: "100%",
			}}/>

			{ contentCtx.contentState.tracks.map((track, i) =>
				<div key={ i } style={{
					position: "absolute",
					left: 0,
					top: track.y - contentCtx.contentState.trackScroll,
					width: contentCtx.contentState.trackHeaderW,
					height: track.h,
					padding: "0.1em 0.25em",
					pointerEvents: "none",
				}}>
					Track Name
				</div>
			)}
		</div>
	)
}