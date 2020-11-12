import React from "react"
import * as Editor from "./index"
import * as Project from "../project"
import * as Playback from "../playback"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Dockable from "../dockable"
import { useRefState, RefState } from "../util/refState"
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
    padding: 0.1em 0.3em;
    cursor: pointer;

    &:hover
    {
        border: 1px solid #fff;
    }
`


export function EditorElement(props: { state?: RefState<Editor.EditorState> })
{
    const refDiv = React.useRef<HTMLDivElement | null>(null)
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)

    const editorState = props.state ?? useRefState(() => Editor.init())
    const project = Project.useProject()
    const playback = Playback.usePlayback()
    const prefs = Prefs.usePrefs()
    const popup = Popup.usePopup()
    const dockable = Dockable.useDockable()

    const makeUpdateData: () => EditorUpdateData = () =>
    {
        return {
            state: editorState.ref.current,
            project: project.ref.current,
            playback: playback.ref.current,
            prefs: prefs.ref.current,
            popup,
            dockable,
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
        const updateData = makeUpdateData()
        Editor.scrollPlaybackTimeIntoView(updateData)
        render()
        
    }, [playback.update])

    React.useEffect(() =>
    {
        const updateData = makeUpdateData()
        Editor.refreshTracks(updateData)
        render()

    }, [project.ref.current.tracks])

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
            else if (mouseAction & (Editor.EditorAction.DragTime | Editor.EditorAction.DragTrackHeader))
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
            if (document.activeElement instanceof HTMLElement)
                document.activeElement.blur()

            ev.preventDefault()
            const updateData = makeUpdateData()
            const pos = transformMousePos(refCanvas.current!, ev)
            Editor.mouseMove(updateData, pos)
            Editor.mouseDown(updateData, ev.button != 0)
            render()
            setCursor(updateData.state)
            editorState.commit()
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
                
                window.dispatchEvent(new Event("refreshProjectTracks"))
            }

            render()
            setCursor(updateData.state)
            editorState.commit()
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

        const onRewind = (ev: Event) =>
        {
            const updateData = makeUpdateData()
            Editor.rewind(updateData)
            editorState.commit()
            render()
        }
		
		const onRefreshProjectTracks = (ev: Event) =>
		{
            const updateData = makeUpdateData()
            Editor.refreshTracks(updateData)
            editorState.commit()
            render()
        }
		
		const onReset = (ev: Event) =>
		{
            const updateData = makeUpdateData()
            Editor.modeStackPop(updateData, 0)
            Editor.refreshTracks(updateData)
            Editor.rewind(updateData)
            editorState.commit()
            render()
        }
        
        refCanvas.current!.addEventListener("mousemove", onMouseMove)
        refCanvas.current!.addEventListener("mousedown", onMouseDown)
        refCanvas.current!.addEventListener("mouseup", onMouseUp)
        refCanvas.current!.addEventListener("wheel", onMouseWheel)
        refCanvas.current!.addEventListener("contextmenu", preventDefault)

        window.addEventListener("keydown", onKeyDown)
        window.addEventListener("keyup", onKeyUp)

        window.addEventListener("timelineRewind", onRewind)
        window.addEventListener("refreshProjectTracks", onRefreshProjectTracks)
        window.addEventListener("timelineReset", onReset)

        return () =>
        {
            refCanvas.current!.removeEventListener("mousemove", onMouseMove)
            refCanvas.current!.removeEventListener("mousedown", onMouseDown)
            refCanvas.current!.removeEventListener("mouseup", onMouseUp)
            refCanvas.current!.removeEventListener("wheel", onMouseWheel)
            refCanvas.current!.removeEventListener("contextmenu", preventDefault)

            window.removeEventListener("keydown", onKeyDown)
            window.removeEventListener("keyup", onKeyUp)

            window.removeEventListener("timelineRewind", onRewind)
            window.removeEventListener("refreshProjectTracks", onRefreshProjectTracks)
            window.removeEventListener("timelineReset", onReset)
        }

    }, [refCanvas.current])


    const yTrackEnd =
        editorState.ref.current.tracks.length == 0 ?
            0 :
            editorState.ref.current.tracks[editorState.ref.current.tracks.length - 1].renderRect.y2

    const onAddTrack = () =>
    {
        let proj = project.ref.current
        proj = Project.upsertTrack(proj, Project.makeTrackNotes())
        project.ref.current = proj
        project.commit()
        
        window.dispatchEvent(new Event("refreshProjectTracks"))
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
			{
                const top = track.renderRect.y - editorState.ref.current.trackScroll
                const width = editorState.ref.current.trackHeaderW
                const height = track.renderRect.h
                const props = {
                    top, width, height,
                    project: project.ref.current,
                    track,
                    onTrackSettings: (ev: React.MouseEvent) => onTrackOptions(ev, i)
                }

                if (track instanceof Editor.EditorTrackNoteBlocks)
                    return <TrackHeaderNoteBlocks key={ i } { ...props }/>
                else
                    return <TrackHeader key={ i } { ...props }/>
            })}

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
                    style={{
                        padding: "0.5em 1em",
                }}>
                    +{/*➕*/}
                </StyledTrackButton>
            </div>
		</div>
	)
}


interface TrackHeaderProps
{
    top: number
    width: number
    height: number

    project: Project.Root
    track: Editor.EditorTrack
    onTrackSettings: (ev: React.MouseEvent) => void
}


function TrackHeader(props: TrackHeaderProps)
{
    return <div style={{
        position: "absolute",
        left: 0,
        top: props.top,
        width: props.width,
        height: props.height,
        
        boxSizing: "border-box",
        padding: "0.1em 0.5em",
        userSelect: "none",
        pointerEvents: "none",
        overflow: "hidden",

        display: "grid",
        gridTemplate: "1fr / 1fr auto",
        alignItems: "center",
    }}>
        <div>
            { props.track.name }
        </div>
        <StyledTrackButton
            onClick={ props.onTrackSettings }
        >
            ...{/*🔧*/}
        </StyledTrackButton>
    </div>
}


function TrackHeaderNoteBlocks(props: TrackHeaderProps)
{
    const projectTrack = props.project.elems.get(props.track.projectTrackId) as Project.Track
    
    const instrumentName = !projectTrack || projectTrack.type != Project.ElementType.Track || projectTrack.instruments.length == 0 ?
        null :
        Project.instrumentName(projectTrack.instruments[0])
        
    return <div style={{
        position: "absolute",
        left: 0,
        top: props.top,
        width: props.width,
        height: props.height,
        
        boxSizing: "border-box",
        padding: "0.1em 0.5em",
        userSelect: "none",
        pointerEvents: "none",
        overflow: "hidden",

        display: "grid",
        gridTemplate: "1fr / 1fr auto",
        alignItems: "center",
    }}>
        <div>
            { props.track.name }
            { !instrumentName ? null :
                <span style={{ fontSize: "0.8em" }}>
                    <br/>
                    { instrumentName }
                </span>
            }
        </div>
        <StyledTrackButton
            onClick={ props.onTrackSettings }
        >
            ...{/*🔧*/}
        </StyledTrackButton>
    </div>
}