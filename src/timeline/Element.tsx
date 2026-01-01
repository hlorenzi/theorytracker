import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Timeline from "./index.ts"
import * as Playback from "../playback"
import Rect from "../utils/rect.ts"


export const eventTimelineRedraw = "timelineRedraw"
export const eventTimelineRelayout = "timelineRelayout"


export function Element(props: {})
{
    let div: HTMLDivElement | undefined = undefined
    let canvas: HTMLCanvasElement | undefined = undefined

    Solid.createEffect(() => {
        if (!div || !canvas)
            return

        const cleanup = registerHandlers(div, canvas)

        Solid.onCleanup(cleanup)
    })


    return <div ref={ div } style={{
        width: "100%",
        height: "100%",
        contain: "size",
    }}>
        <canvas ref={ canvas }/>
    </div>
}


function canvasResize(
    div: HTMLDivElement,
    canvas: HTMLCanvasElement,
    timeline: Timeline.State)
{
    const pixelRatio = window.devicePixelRatio ?? 1
    
    const domRect = div.getBoundingClientRect()
    const x = Math.floor(domRect.x)
    const y = Math.floor(domRect.y)
    const w = Math.floor(domRect.width * pixelRatio)
    const h = Math.floor(domRect.height * pixelRatio)

    if (canvas.width === w &&
        canvas.height === h &&
        timeline.renderRect.w === w &&
        timeline.renderRect.h === h)
        return
    
    canvas.style.width = Math.floor(domRect.width) + "px"
    canvas.style.height = Math.floor(domRect.height) + "px"
    canvas.width = w
    canvas.height = h

    console.log("resize", w, h)

    const rect = new Rect(0, 0, w, h)

    Timeline.resize(timeline, pixelRatio, rect)
}


function registerHandlers(
    div: HTMLDivElement,
    canvas: HTMLCanvasElement)
{
    const ctx = canvas.getContext("2d")!
        
    const timeline = Global.getStatic().timeline
    const project = Global.getStatic().project
    const prefs = Global.getStatic().prefs
    const playback = Global.getStatic().playback

    const transformMousePos = (canvas: HTMLCanvasElement, ev: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        return {
            x: (ev.clientX - rect.left) * timeline.pixelRatio,
            y: (ev.clientY - rect.top) * timeline.pixelRatio,
        }
    }

    const setCursor = () => {
        const action = timeline.mouse.down ?
            timeline.mouse.action :
            timeline.hover?.action

        canvas.style.cursor =
            action === Timeline.MouseAction.DragTime ||
            action === Timeline.MouseAction.DragRow ||
            action === Timeline.MouseAction.DragTimeAndRow ?
                timeline.mouse.down ? "grabbing" : "grab" :
            action === Timeline.MouseAction.StretchTimeStart ||
            action === Timeline.MouseAction.StretchTimeEnd ?
                "col-resize" :
            action === Timeline.MouseAction.SelectCursor ?
                timeline.cursor.rectMode ? "crosshair" : "text" :
                "text"
    }

    let needsRedraw = true

    let drawLoopHandle = -1

    const drawLoop = () => {
        if (needsRedraw)
        {
            needsRedraw = false
            Timeline.draw(timeline, playback, prefs, ctx)
        }

        window.requestAnimationFrame(drawLoop)
    }

    drawLoopHandle = window.requestAnimationFrame(drawLoop)

    const queueRedraw = () => {
        needsRedraw = true
    }

    const relayout = () => {
        Timeline.layout(timeline, project.root, prefs)
        queueRedraw()
    }

    const onResize = () => {
        canvasResize(div, canvas, timeline)
        relayout()
    }

    const onMouseMove = (ev: MouseEvent) => {
        ev.preventDefault()

        const mouse = transformMousePos(canvas, ev)

        Timeline.mouseMove(timeline, project.root, mouse.x, mouse.y)

        if (Timeline.mouseDrag(timeline, project, playback, prefs))
        {
            Timeline.layout(timeline, project.root, prefs)
            Global.refresh()
        }
        
        queueRedraw()
        setCursor()
    }

    const onMouseDown = (ev: MouseEvent) => {
        ev.preventDefault()
        canvas.focus()

        const mouse = transformMousePos(canvas, ev)
        
        Timeline.mouseMove(timeline, project.root, mouse.x, mouse.y)
        Timeline.mouseDown(timeline, project, playback, prefs, ev.button !== 0)
        queueRedraw()
        Global.refresh()
        setCursor()
    }

    const onMouseUp = (ev: MouseEvent) => {
        ev.preventDefault()

        const mouse = transformMousePos(canvas, ev)
        
        Timeline.mouseMove(timeline, project.root, mouse.x, mouse.y)

        if (Timeline.mouseUp(timeline, project, ev.button !== 0))
            Timeline.layout(timeline, project.root, prefs)

        queueRedraw()
        Global.refresh()
        setCursor()
    }
    
    const onMouseWheel = (ev: WheelEvent) => {
        ev.preventDefault()
        
        Timeline.mouseWheel(timeline, ev.deltaX, ev.deltaY)
        Timeline.layout(timeline, project.root, prefs)
        queueRedraw()
        Global.refresh()
    }

    const onKeyDown = (ev: KeyboardEvent) => {
        if (document.activeElement &&
            document.activeElement.tagName === "INPUT")
            return
        
        Timeline.keyDown(timeline, project, playback, prefs, ev.key.toLowerCase())
        Timeline.layout(timeline, project.root, prefs)
        queueRedraw()
        Global.refresh()
    }

    const onKeyUp = (ev: KeyboardEvent) => {
        Timeline.keyUp(timeline, ev.key.toLowerCase())
        Global.refresh()
    }

    const onWindowBlur = () => {
        console.log("blur")
        Timeline.allKeysUp(timeline)
    }

    const preventDefault = (ev: MouseEvent) => {
        ev.preventDefault()
    }

    onResize()

    Solid.createComputed(
        (prevProject) => {
            if (Global.get().project.root !== prevProject)
                relayout()
        },
        project.root)

    window.addEventListener(eventTimelineRedraw, queueRedraw)
    window.addEventListener(eventTimelineRelayout, relayout)
    window.addEventListener("resize", onResize)
    window.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)
    canvas.addEventListener("wheel", onMouseWheel)
    canvas.addEventListener("contextmenu", preventDefault)
    window.addEventListener("blur", onWindowBlur)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    return () => {
        window.cancelAnimationFrame(drawLoopHandle)
        window.removeEventListener(eventTimelineRedraw, queueRedraw)
        window.removeEventListener(eventTimelineRelayout, relayout)
        window.removeEventListener("resize", onResize)
        window.removeEventListener("mousemove", onMouseMove)
        canvas.removeEventListener("mousedown", onMouseDown)
        window.removeEventListener("mouseup", onMouseUp)
        canvas.removeEventListener("wheel", onMouseWheel)
        canvas.removeEventListener("contextmenu", preventDefault)
        window.removeEventListener("blur", onWindowBlur)
        window.removeEventListener("keydown", onKeyDown)
        window.removeEventListener("keyup", onKeyUp)
    }
}