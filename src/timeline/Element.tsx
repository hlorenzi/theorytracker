import React from "react"
import * as Timeline from "./index"
import * as Project from "../project"
import * as Playback from "../playback"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Dockable from "../dockable"
import * as UI from "../ui"
import { useRefState, RefState } from "../util/refState"
import Rect from "../util/rect"
import styled from "styled-components"


const StyledTrackButton = styled.button`
    pointer-events: auto;
    color: #fff;
    border: 1px solid #888;
    border-radius: 0.5em;
    background-color: #2f3136;
    padding: 0.1em 0.3em;
    cursor: pointer;

    &:hover
    {
        border: 1px solid #fff;
    }
`


export function TimelineElement(props: { state?: RefState<Timeline.State> })
{
    const refDiv = React.useRef<HTMLDivElement | null>(null)
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)

    const editorState = props.state ?? useRefState(() => Timeline.init())
    const dockableWindow = Dockable.useWindow()

    const lastTimelineRenderRef = React.useRef(0)

    const render = (force?: boolean) =>
    {
        if (!refCanvas.current)
            return

        const now = new Date().getTime()
        if (!force && now < lastTimelineRenderRef.current + 15)
            return

        //console.log("Timeline render")
        lastTimelineRenderRef.current = now

        Timeline.render(
            editorState.ref.current,
            refCanvas.current.getContext("2d")!)
    }

    const onResize = () =>
    {
        if (!refDiv.current || !refCanvas.current)
            return

        const pixelRatio = window.devicePixelRatio || 1
        
        const rect = refDiv.current.getBoundingClientRect()
        const x = Math.floor(rect.x)
        const y = Math.floor(rect.y)
        const w = Math.floor(rect.width * pixelRatio)
        const h = Math.floor(rect.height * pixelRatio)
        
        refCanvas.current.style.width = Math.floor(rect.width) + "px"
        refCanvas.current.style.height = Math.floor(rect.height) + "px"
        refCanvas.current.width = w
        refCanvas.current.height = h

        const renderRect = new Rect(x, y, w, h)

        Timeline.resize(editorState.ref.current, pixelRatio, renderRect)
        render(true)
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
        Timeline.scrollPlaybackTimeIntoView(editorState.ref.current)
        render(!Playback.global.playing)
        
    }, [Playback.globalObservable.updateToken])

    React.useEffect(() =>
    {
        Timeline.refreshTracks(editorState.ref.current)
        render(true)

    }, [Project.global.project.tracks])

    React.useEffect(() =>
    {
        const refCanvasCurrent = refCanvas.current
        if (!refCanvasCurrent)
            return

        const transformMousePos = (canvas: HTMLCanvasElement, ev: MouseEvent) =>
        {
            const rect = canvas.getBoundingClientRect()
            return {
                x: (ev.clientX - rect.left) * editorState.ref.current.pixelRatio,
                y: (ev.clientY - rect.top) * editorState.ref.current.pixelRatio,
            }
        }

		const preventDefault = (ev: Event) => ev.preventDefault()

        const setCursor = (state: Timeline.State) =>
        {
            let cursor = "text"
            const mouseAction =
                state.mouse.down ? state.mouse.action :
                state.hoverControl != Timeline.TrackControl.None ? Timeline.MouseAction.DragTrackControl :
                state.hover ? state.hover.action :
                Timeline.MouseAction.None
            
            if (state.tracks.some((tr: any) => !!tr.pencil) ||
                mouseAction == Timeline.MouseAction.Pencil)
                cursor = "crosshair"
            else if (mouseAction == Timeline.MouseAction.DragTrackControl)
                cursor = "crosshair"
            else if (mouseAction == Timeline.MouseAction.DragClone)
                cursor = "crosshair"
            else if (mouseAction == Timeline.MouseAction.DragTime ||
                mouseAction == Timeline.MouseAction.DragTimeAndRow ||
                mouseAction == Timeline.MouseAction.DragRow ||
                mouseAction == Timeline.MouseAction.DragTrackHeader)
                cursor = (state.mouse.down ? "grabbing" : "grab")
            else if (mouseAction == Timeline.MouseAction.Pan)
                cursor = "move"
            else if (mouseAction == Timeline.MouseAction.StretchTimeStart ||
                mouseAction == Timeline.MouseAction.StretchTimeEnd)
                cursor = "col-resize"

            refCanvasCurrent.style.cursor = cursor
        }

		const onMouseMove = (ev: MouseEvent) =>
		{
            const state = editorState.ref.current
            if (state.mouse.down)
                ev.preventDefault()
                
            const pos = transformMousePos(refCanvasCurrent, ev)
            const projectBefore = Project.global.project
            const needsRender1 = Timeline.mouseMove(state, pos)
            const needsRender2 = Timeline.mouseDrag(state, pos, false)

            if (projectBefore !== Project.global.project)
                Project.notifyObservers()

            if (needsRender1 || needsRender2)
                render(true)

            setCursor(state)
        }
        
		const onMouseDown = (ev: MouseEvent) =>
		{
            if (document.activeElement instanceof HTMLElement)
                document.activeElement.blur()

            ev.preventDefault()

            Dockable.removeEphemerals(Dockable.global.state)
            Dockable.notifyObservers()

            const state = editorState.ref.current
            const pos = transformMousePos(refCanvasCurrent, ev)
            const projectBefore = Project.global.project
            Timeline.mouseMove(state, pos)
            Timeline.mouseDown(state, ev.button != 0)
            Timeline.mouseDrag(state, pos, true)

            if (projectBefore !== Project.global.project)
                Project.notifyObservers()

            render()
            setCursor(state)
            editorState.commit()
        }
        
		const onMouseUp = (ev: MouseEvent) =>
		{
            const state = editorState.ref.current
            if (state.mouse.down)
                ev.preventDefault()

            const pos = transformMousePos(refCanvasCurrent, ev)
            const projectBefore = Project.global.project
            Timeline.mouseUp(state)

            if (projectBefore !== Project.global.project)
            {
                Project.notifyObservers()
                window.dispatchEvent(new Event("timelineRefresh"))
            }

            render()
            setCursor(state)
            editorState.commit()
        }
		
		const onMouseWheel = (ev: WheelEvent) =>
		{
			Timeline.mouseWheel(editorState.ref.current, ev.deltaX, ev.deltaY)
            render()
		}
		
		const onKeyDown = (ev: KeyboardEvent) =>
		{
            const isActiveWindow =
                Dockable.global.state.activePanel === dockableWindow.panel &&
                (!document.activeElement || document.activeElement.tagName != "INPUT")

            const projectBefore = Project.global.project
			Timeline.keyDown(editorState.ref.current, isActiveWindow, ev.key.toLowerCase())
            
            if (projectBefore !== Project.global.project)
                Project.notifyObservers()

            render()
            editorState.commit()
        }
		
		const onKeyUp = (ev: KeyboardEvent) =>
		{
			Timeline.keyUp(editorState.ref.current, ev.key.toLowerCase())
        }

        const onRewind = (ev: Event) =>
        {
            Timeline.rewind(editorState.ref.current)
            editorState.commit()
            render(true)
        }
		
		const onRefresh = (ev: Event) =>
		{
            Timeline.refreshTracks(editorState.ref.current)
            editorState.commit()
            render(true)
        }
		
		const onReset = (ev: Event) =>
		{
            const state = editorState.ref.current
            Timeline.modeStackPop(state, 0)
            Timeline.reset(state)
            Timeline.rewind(state)
            Timeline.refreshTracks(state)
            editorState.commit()
            render(true)
        }
        
        refCanvasCurrent.addEventListener("mousedown", onMouseDown)
        refCanvasCurrent.addEventListener("wheel", onMouseWheel)
        refCanvasCurrent.addEventListener("contextmenu", preventDefault)

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        window.addEventListener("timelineRewind", onRewind)
        window.addEventListener("timelineRefresh", onRefresh)
        window.addEventListener("timelineReset", onReset)

        return () =>
        {
            refCanvasCurrent.removeEventListener("mousedown", onMouseDown)
            refCanvasCurrent.removeEventListener("wheel", onMouseWheel)
            refCanvasCurrent.removeEventListener("contextmenu", preventDefault)

            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)

            window.removeEventListener("timelineRewind", onRewind)
            window.removeEventListener("timelineRefresh", onRefresh)
            window.removeEventListener("timelineReset", onReset)
        }

    }, [refCanvas.current])


    const yTrackEnd =
        editorState.ref.current.tracks.length == 0 ?
            0 :
            editorState.ref.current.tracks[editorState.ref.current.tracks.length - 1].renderRect.y2

    const onAddTrack = () =>
    {
        let proj = Project.global.project
        proj = Project.upsertTrack(proj, Project.makeTrackNotes())
        Project.global.project = proj
        Project.splitUndoPoint()
        Project.addUndoPoint("addTrack")
        Project.notifyObservers()
        
        window.dispatchEvent(new Event("timelineRefresh"))
    }

    const onTrackSettings = (ev: React.MouseEvent, trackIndex: number) =>
    {
        Popup.global.elem = () =>
        {
            return <Popup.Root>
                <Popup.Button label="Delete"/>
            </Popup.Root>
        }
        Popup.global.rect = Rect.fromElement(ev.target as HTMLElement)
        Popup.notifyObservers()
    }

    const pixelRatio = window.devicePixelRatio || 1

	return React.useMemo(() =>
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

            <div style={{
                position: "absolute",
                left: 0,
                top: (yTrackEnd - editorState.ref.current.trackScroll) / pixelRatio,
                width: editorState.ref.current.trackHeaderW / pixelRatio,
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
                    style={{
                        padding: "0.5em 1em",
                }}>
                    +{/*➕*/}
                </StyledTrackButton>
            </div>
		</div>
        , [
            Project.global.project.tracks,
            editorState.ref.current.tracks,
            editorState.ref.current.trackScroll,
        ])
}


export function sendEventRefresh()
{
    window.dispatchEvent(new Event("timelineRefresh"))
}


export function sendEventReset()
{
    window.dispatchEvent(new Event("timelineReset"))
}