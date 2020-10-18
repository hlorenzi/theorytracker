import React from "react"
import * as Editor from "./index"
import * as Project from "../project"
import * as Prefs from "../prefs"
import { useRefState } from "../util/refState"
import Rect from "../util/rect"
import { EditorUpdateData } from "./state"


declare class ResizeObserver
{
    constructor(callback: (entries: any) => void)
    observe(elem: HTMLElement): void
    unobserve(elem: HTMLElement): void
}


export function EditorElement()
{
    const refDiv = React.useRef<HTMLDivElement | null>(null)
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)

    const editorState = useRefState(() => Editor.init())
    const project = Project.useProject()
    const prefs = Prefs.usePrefs()

    const makeUpdateData: () => EditorUpdateData = () =>
    {
        return {
            state: editorState.ref.current,
            project: project.ref.current,
            prefs: prefs.ref.current,
            ctx: null!,
        }
    }

    const render = () =>
    {
        if (!refCanvas.current)
            return

        console.log("render")

        const updateData = makeUpdateData()
        updateData.ctx = refCanvas.current.getContext("2d")!
        Editor.render(updateData)
    }

    const onResize = () =>
    {
        if (!refDiv.current || !refCanvas.current)
            return
        
        const rect = refDiv.current.getBoundingClientRect()
        const x = Math.floor(rect.x)
        const y = Math.floor(rect.y)
        const w = Math.floor(rect.width)
        const h = Math.floor(rect.height)
        
        refCanvas.current.style.width = w + "px"
        refCanvas.current.style.height = h + "px"
        refCanvas.current.width = w
        refCanvas.current.height = h

        const renderRect = new Rect(x, y, w, h)
        console.log(renderRect)

        const updateData = makeUpdateData()
        Editor.resize(updateData, renderRect)

        render()
    }

    React.useLayoutEffect(() =>
    {
		if (!refDiv.current)
            return

        const observer = new ResizeObserver(entries =>
        {
            onResize()
        })

        const elem = refDiv.current
        observer.observe(elem)

        onResize()
        return () => observer.unobserve(elem)

    }, [refDiv.current])

    React.useEffect(() =>
    {
        if (!refCanvas.current)
            return

        const transformMousePos = (canvas: HTMLCanvasElement, ev: MouseEvent) =>
        {
            const rect = canvas.getBoundingClientRect()
            return {
                x: (ev.clientX - rect.left),
                y: (ev.clientY - rect.top)
            }
        }

		const preventDefault = (ev: Event) => ev.preventDefault()

        const setCursor = (state: Editor.EditorState) =>
        {
            let cursor = "text"
            const mouseAction =
                state.mouse.down ? state.mouse.action :
                state.hover ? state.hover.action :
                Editor.EditorAction.None
            
            /*if (contentCtx.contentState.tracks.some((tr: any) => !!tr.draw) || mouseAction & (Editor.actionDraw))
                refCanvas.current!.style.cursor = "crosshair"
            else*/ if (mouseAction & (Editor.EditorAction.DragTime))
                cursor = (state.mouse.down ? "grabbing" : "grab")
            else if (mouseAction & (Editor.EditorAction.Pan))
                cursor = "move"
            else if (mouseAction & (Editor.EditorAction.StretchTimeStart | Editor.EditorAction.StretchTimeEnd))
                cursor = "col-resize"

            refCanvas.current!.style.cursor = cursor
        }

		const onMouseMove = (ev: MouseEvent) =>
		{
            ev.preventDefault()
            const updateData = makeUpdateData()
            const pos = transformMousePos(refCanvas.current!, ev)
            const needsRender1 = Editor.mouseMove(updateData, pos)
            const needsRender2 = Editor.mouseDrag(updateData, pos)

            if (updateData.project !== project.ref.current)
            {
                project.ref.current = updateData.project
                project.commit()
            }

            if (needsRender1 || needsRender2)
                render()

            setCursor(updateData.state)
        }
        
		const onMouseDown = (ev: MouseEvent) =>
		{
            ev.preventDefault()
            const updateData = makeUpdateData()
            const pos = transformMousePos(refCanvas.current!, ev)
            Editor.mouseMove(updateData, pos)
            Editor.mouseDown(updateData, ev.button != 0)
            render()
            setCursor(updateData.state)
        }
        
		const onMouseUp = (ev: MouseEvent) =>
		{
            ev.preventDefault()
            const updateData = makeUpdateData()
            const pos = transformMousePos(refCanvas.current!, ev)
            Editor.mouseMove(updateData, pos)
            Editor.mouseUp(updateData)
            render()
            setCursor(updateData.state)
        }
        
        refCanvas.current!.addEventListener("mousemove", onMouseMove)
        refCanvas.current!.addEventListener("mousedown", onMouseDown)
        refCanvas.current!.addEventListener("mouseup", onMouseUp)
        refCanvas.current!.addEventListener("contextmenu", preventDefault)

        return () =>
        {
            refCanvas.current!.removeEventListener("mousemove", onMouseMove)
            refCanvas.current!.removeEventListener("mousedown", onMouseDown)
            refCanvas.current!.removeEventListener("mouseup", onMouseUp)
            refCanvas.current!.removeEventListener("contextmenu", preventDefault)
        }

    }, [refCanvas.current])


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

			{ /*contentCtx.contentState.tracks.map((track, i) =>
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
			)*/ }
		</div>
	)
}