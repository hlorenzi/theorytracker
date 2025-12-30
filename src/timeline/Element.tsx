import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Timeline from "./index.ts"
import * as Playback from "../playback"
import Rect from "../utils/rect.ts"


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

    const transformMousePos = (canvas: HTMLCanvasElement, ev: MouseEvent) =>
    {
        const rect = canvas.getBoundingClientRect()
        const timeline = Global.get().timeline
        return {
            x: (ev.clientX - rect.left) * timeline.pixelRatio,
            y: (ev.clientY - rect.top) * timeline.pixelRatio,
        }
    }

    const setCursor = () => {
        const timeline = Global.get().timeline

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
                "inherit"
    }

    const draw = () => {
        const timeline = Global.get().timeline
        const project = Global.get().project
        const prefs = Global.get().prefs
        const playback = Global.get().playback
        Timeline.draw(timeline, playback, prefs, ctx)
    }

    const onResize = () => {
        const timeline = Global.get().timeline
        const project = Global.get().project
        const prefs = Global.get().prefs

        canvasResize(div, canvas, timeline)
        Timeline.layout(timeline, project.root, prefs)
        draw()
    }

    const onMouseMove = (ev: MouseEvent) => {
        ev.preventDefault()

        const timeline = Global.get().timeline
        const project = Global.get().project
        const playback = Global.get().playback
        const prefs = Global.get().prefs
        const mouse = transformMousePos(canvas, ev)

        Timeline.mouseMove(timeline, project.root, mouse.x, mouse.y)

        if (Timeline.mouseDrag(timeline, project, playback))
        {
            Timeline.layout(timeline, project.root, prefs)
            Global.refresh()
        }
        
        draw()
        setCursor()
    }

    const onMouseDown = (ev: MouseEvent) => {
        ev.preventDefault()
        canvas.focus()

        const timeline = Global.get().timeline
        const project = Global.get().project
        const playback = Global.get().playback
        const prefs = Global.get().prefs
        const mouse = transformMousePos(canvas, ev)
        
        Timeline.mouseMove(timeline, project.root, mouse.x, mouse.y)
        Timeline.mouseDown(timeline, project, playback, prefs, ev.button !== 0)
        draw()
        Global.refresh()
        setCursor()
    }

    const onMouseUp = (ev: MouseEvent) => {
        ev.preventDefault()

        const timeline = Global.get().timeline
        const project = Global.get().project
        const prefs = Global.get().prefs
        const mouse = transformMousePos(canvas, ev)
        
        Timeline.mouseMove(timeline, project.root, mouse.x, mouse.y)

        if (Timeline.mouseUp(timeline, project, ev.button !== 0))
            Timeline.layout(timeline, project.root, prefs)

        draw()
        Global.refresh()
        setCursor()
    }
    
    const onMouseWheel = (ev: WheelEvent) => {
        ev.preventDefault()
        
        const timeline = Global.get().timeline
        const project = Global.get().project
        const prefs = Global.get().prefs

        Timeline.mouseWheel(timeline, ev.deltaX, ev.deltaY)
        Timeline.layout(timeline, project.root, prefs)
        draw()
        Global.refresh()
    }

    const onKeyDown = (ev: KeyboardEvent) => {
        if (document.activeElement &&
            document.activeElement.tagName === "INPUT")
            return
        
        const timeline = Global.get().timeline
        const project = Global.get().project
        const playback = Global.get().playback
        const prefs = Global.get().prefs

        Timeline.keyDown(timeline, project, playback, prefs, ev.key.toLowerCase())
        Timeline.layout(timeline, project.root, prefs)
        draw()
        Global.refresh()
    }

    const onKeyUp = (ev: KeyboardEvent) => {
        const timeline = Global.get().timeline

        Timeline.keyUp(timeline, ev.key.toLowerCase())
        Global.refresh()
    }

    const preventDefault = (ev: MouseEvent) => {
        ev.preventDefault()
    }

    onResize()

    window.addEventListener(Playback.eventPlaybackRefresh, draw)
    window.addEventListener("resize", onResize)
    window.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)
    canvas.addEventListener("wheel", onMouseWheel)
    canvas.addEventListener("contextmenu", preventDefault)
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    return () => {
        window.removeEventListener(Playback.eventPlaybackRefresh, draw)
        window.removeEventListener("resize", onResize)
        window.removeEventListener("mousemove", onMouseMove)
        canvas.removeEventListener("mousedown", onMouseDown)
        window.removeEventListener("mouseup", onMouseUp)
        canvas.removeEventListener("wheel", onMouseWheel)
        canvas.removeEventListener("contextmenu", preventDefault)
        window.removeEventListener("keydown", onKeyDown)
        window.removeEventListener("keyup", onKeyUp)
    }
}