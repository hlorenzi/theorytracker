import React from "react"
import * as Editor from "./index"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import { useRefState } from "../util/refState"
import Rect from "../util/rect"
import { EditorUpdateData } from "./state"
import styled from "styled-components"


declare class ResizeObserver
{
    constructor(callback: (entries: any) => void)
    observe(elem: HTMLElement): void
    unobserve(elem: HTMLElement): void
}


const StyledTrackButton = styled.button`
    pointer-events: auto;
    color: #fff;
    border: 1px solid #888;
    border-radius: 0.5em;
    background-color: #2f3136;
    padding: 0.5em 1em;

    &:hover
    {
        border: 1px solid #fff;
    }
`


export function EditorElement()
{
    const refDiv = React.useRef<HTMLDivElement | null>(null)
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)

    const editorState = useRefState(() => Editor.init())
    const project = Project.useProject()
    const prefs = Prefs.usePrefs()
    const popup = Popup.usePopup()

    const makeUpdateData: () => EditorUpdateData = () =>
    {
        return {
            state: editorState.ref.current,
            project: project.ref.current,
            prefs: prefs.ref.current,
            popup,
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
            
            if (state.tracks.some((tr: any) => !!tr.pencil) || mouseAction & Editor.EditorAction.Pencil)
                cursor = "crosshair"
            else if (mouseAction & (Editor.EditorAction.DragTime | Editor.EditorAction.DragTrack))
                cursor = (state.mouse.down ? "grabbing" : "grab")
            else if (mouseAction & Editor.EditorAction.Pan)
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

            if (updateData.project !== project.ref.current)
            {
                project.ref.current = updateData.project
                project.commit()
                
                const ev = new Event("refreshProjectTracks")
                window.dispatchEvent(ev)
            }

            render()
            setCursor(updateData.state)
        }
		
		const onMouseWheel = (ev: WheelEvent) =>
		{
			ev.preventDefault()
            const updateData = makeUpdateData()
			Editor.mouseWheel(updateData, ev.deltaX, ev.deltaY)
            render()
		}
		
		const onKeyDown = (ev: KeyboardEvent) =>
		{
            const updateData = makeUpdateData()
			Editor.keyDown(updateData, ev.key.toLowerCase())
        }
		
		const onKeyUp = (ev: KeyboardEvent) =>
		{
            const updateData = makeUpdateData()
			Editor.keyUp(updateData, ev.key.toLowerCase())
        }
		
		const onRefreshProjectTracks = (ev: Event) =>
		{
            const updateData = makeUpdateData()
            Editor.refreshTracks(updateData)
            render()
        }
        
        refCanvas.current!.addEventListener("mousemove", onMouseMove)
        refCanvas.current!.addEventListener("mousedown", onMouseDown)
        refCanvas.current!.addEventListener("mouseup", onMouseUp)
        refCanvas.current!.addEventListener("wheel", onMouseWheel)
        refCanvas.current!.addEventListener("contextmenu", preventDefault)

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        window.addEventListener("refreshProjectTracks", onRefreshProjectTracks)

        return () =>
        {
            refCanvas.current!.removeEventListener("mousemove", onMouseMove)
            refCanvas.current!.removeEventListener("mousedown", onMouseDown)
            refCanvas.current!.removeEventListener("mouseup", onMouseUp)
            refCanvas.current!.removeEventListener("wheel", onMouseWheel)
            refCanvas.current!.removeEventListener("contextmenu", preventDefault)

            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)

            window.removeEventListener("refreshProjectTracks", onRefreshProjectTracks)
        }

    }, [refCanvas.current])


    const yTrackEnd =
        editorState.ref.current.tracks.length == 0 ?
            0 :
            editorState.ref.current.tracks[editorState.ref.current.tracks.length - 1].renderRect.y2

    const onAddTrack = () =>
    {
        let proj = project.ref.current
        proj = Project.Root.upsertTrack(proj, Project.makeTrackNotes())
        project.ref.current = proj
        project.commit()
        
        const ev = new Event("refreshProjectTracks")
        window.dispatchEvent(ev)
    }

    const onTrackOptions = (ev: React.MouseEvent, trackIndex: number) =>
    {
        popup.ref.current.elem = () =>
        {
            return <Popup.Root>
                <Popup.Button label="Delete"/>
            </Popup.Root>
        }
        popup.ref.current.rect = Rect.fromElement(ev.target as HTMLElement)
        popup.commit()
    }

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

			{ editorState.ref.current.tracks.map((track, i) =>
				<div key={ i } style={{
					position: "absolute",
					left: 0,
					top: track.renderRect.y - editorState.ref.current.trackScroll,
					width: editorState.ref.current.trackHeaderW,
                    height: track.renderRect.h,
                    boxSizing: "border-box",
					padding: "1em 1em",
                    userSelect: "none",
                    pointerEvents: "none",
                    overflow: "hidden",

                    display: "grid",
                    gridTemplate: "1fr / 1fr auto",
                    alignItems: "center",
				}}>
					<div>Track Name</div>
                    <StyledTrackButton
                        onClick={ ev => onTrackOptions(ev, i) }
                    >
                        ...{/*🔧*/}
                    </StyledTrackButton>
				</div>
			)}

            <div style={{
                position: "absolute",
                left: 0,
                top: yTrackEnd - editorState.ref.current.trackScroll,
                width: editorState.ref.current.trackHeaderW,
                height: 100,
                boxSizing: "border-box",
                padding: "1em 1em",
                userSelect: "none",
                pointerEvents: "none",
                display: "flex",
                justifyContent: "center",
                alignItems: "start",
            }}>
                <StyledTrackButton
                    onClick={ onAddTrack }
                >
                    +{/*➕*/}
                </StyledTrackButton>
            </div>
		</div>
	)
}