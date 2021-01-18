import React from "react"
import * as Editor from "./index"
import * as Project from "../project"
import * as Playback from "../playback"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Dockable from "../dockable"
import * as UI from "../ui"
import { useRefState, RefState } from "../util/refState"
import Rect from "../util/rect"
import { EditorUpdateData } from "./state"
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


export function EditorElement(props: { state?: RefState<Editor.EditorState> })
{
    const refDiv = React.useRef<HTMLDivElement | null>(null)
    const refCanvas = React.useRef<HTMLCanvasElement | null>(null)

    const editorState = props.state ?? useRefState(() => Editor.init())
    const project = Project.useProject()
    const playback = Playback.usePlayback()
    const prefs = Prefs.usePrefs()
    const popup = Popup.usePopup()
    const dockableWindow = Dockable.useWindow()
    const dockable = Dockable.useDockable()

    const lastTimelineRenderRef = React.useRef(0)

    const makeUpdateData: () => EditorUpdateData = () =>
    {
        return {
            state: editorState.ref.current,
            project: project.ref.current.project,
            projectCtx: project,
            playback: playback.ref.current,
            prefs: prefs.ref.current,
            popup,
            dockable,
            activeWindow: dockable.ref.current.state.activePanel === dockableWindow.panel,
            ctx: null!,
        }
    }

    const render = (force?: boolean) =>
    {
        if (!refCanvas.current)
            return

        const now = new Date().getTime()
        if (!force && now < lastTimelineRenderRef.current + 15)
            return

        //console.log("Timeline render")
        lastTimelineRenderRef.current = now

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
        const updateData = makeUpdateData()
        Editor.scrollPlaybackTimeIntoView(updateData)
        render(!playback.ref.current.playing)
        
    }, [playback.update])

    React.useEffect(() =>
    {
        const updateData = makeUpdateData()
        Editor.refreshTracks(updateData)
        render(true)

    }, [project.ref.current.project.tracks])

    React.useEffect(() =>
    {
        const refCanvasCurrent = refCanvas.current
        if (!refCanvasCurrent)
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
                state.hoverControl != Editor.TrackControl.None ? Editor.EditorAction.DragTrackControl :
                state.hover ? state.hover.action :
                Editor.EditorAction.None
            
            if (state.tracks.some((tr: any) => !!tr.pencil) ||
                mouseAction == Editor.EditorAction.Pencil)
                cursor = "crosshair"
            else if (mouseAction == Editor.EditorAction.DragTrackControl)
                cursor = "crosshair"
            else if (mouseAction == Editor.EditorAction.DragClone)
                cursor = "crosshair"
            else if (mouseAction == Editor.EditorAction.DragTime ||
                mouseAction == Editor.EditorAction.DragTimeAndRow ||
                mouseAction == Editor.EditorAction.DragRow ||
                mouseAction == Editor.EditorAction.DragTrackHeader)
                cursor = (state.mouse.down ? "grabbing" : "grab")
            else if (mouseAction == Editor.EditorAction.Pan)
                cursor = "move"
            else if (mouseAction == Editor.EditorAction.StretchTimeStart ||
                mouseAction == Editor.EditorAction.StretchTimeEnd)
                cursor = "col-resize"

            refCanvasCurrent.style.cursor = cursor
        }

		const onMouseMove = (ev: MouseEvent) =>
		{
            const updateData = makeUpdateData()
            if (updateData.state.mouse.down)
                ev.preventDefault()
                
            const pos = transformMousePos(refCanvasCurrent, ev)
            const needsRender1 = Editor.mouseMove(updateData, pos)
            const needsRender2 = Editor.mouseDrag(updateData, pos)

            if (updateData.project !== project.ref.current.project)
            {
                project.ref.current.project = updateData.project
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

            Dockable.removeEphemerals(dockable.ref.current.state)
            dockable.commit()

            const updateData = makeUpdateData()
            const pos = transformMousePos(refCanvasCurrent, ev)
            Editor.mouseMove(updateData, pos)
            Editor.mouseDown(updateData, ev.button != 0)
            Editor.mouseDrag(updateData, pos)
            render()
            setCursor(updateData.state)
            editorState.commit()
        }
        
		const onMouseUp = (ev: MouseEvent) =>
		{
            const updateData = makeUpdateData()
            if (updateData.state.mouse.down)
                ev.preventDefault()

            const pos = transformMousePos(refCanvasCurrent, ev)
            Editor.mouseMove(updateData, pos)
            Editor.mouseDrag(updateData, pos)
            Editor.mouseUp(updateData)

            if (updateData.project !== project.ref.current.project)
            {
                project.ref.current.project = updateData.project
                project.commit()
                
                window.dispatchEvent(new Event("timelineRefresh"))
            }

            render()
            setCursor(updateData.state)
            editorState.commit()
        }
		
		const onMouseWheel = (ev: WheelEvent) =>
		{
            const updateData = makeUpdateData()
			Editor.mouseWheel(updateData, ev.deltaX, ev.deltaY)
            render()
		}
		
		const onKeyDown = (ev: KeyboardEvent) =>
		{
            const updateData = makeUpdateData()
			Editor.keyDown(updateData, ev.key.toLowerCase())
            
            if (updateData.project !== project.ref.current.project)
            {
                project.ref.current.project = updateData.project
                project.commit()
            }

            render()
            editorState.commit()
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
            render(true)
        }
		
		const onRefresh = (ev: Event) =>
		{
            const updateData = makeUpdateData()
            Editor.refreshTracks(updateData)
            editorState.commit()
            render(true)
        }
		
		const onReset = (ev: Event) =>
		{
            const updateData = makeUpdateData()
            Editor.modeStackPop(updateData, 0)
            Editor.reset(updateData)
            Editor.rewind(updateData)
            Editor.refreshTracks(updateData)
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
        let proj = project.ref.current.project
        proj = Project.upsertTrack(proj, Project.makeTrackNotes())
        project.ref.current.project = proj
        project.ref.current.splitUndoPoint()
        project.ref.current.addUndoPoint("addTrack")
        project.commit()
        
        window.dispatchEvent(new Event("timelineRefresh"))
    }

    const onTrackSettings = (ev: React.MouseEvent, trackIndex: number) =>
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
        , [
            project.ref.current.project.tracks,
            editorState.ref.current.tracks,
            editorState.ref.current.trackScroll,
        ])
}