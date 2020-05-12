import React from "react"
import DockableData, { Root, Panel, Content, Rect, Layout, Divider, Anchor } from "./DockableData"
import { AppState, AppDispatch, ContentStateManager } from "../App"


interface DockableRootProps
{
    root: Root
    setRoot: ((newRoot: Root) => void)

    contents: { [id: number]: Content }
    contentTypeToComponent: (type: string) => any

    appState: AppState
    appDispatch: AppDispatch
}


export default function DockableRoot(props: DockableRootProps)
{
    const rootRef = React.useRef<HTMLDivElement>(null)
    const [rect, setRect] = React.useState<Rect>({ x1: 0, x2: 0, y1: 0, y2: 0 })
    

    const layout = React.useMemo(() =>
    {
        if (!rect)
            return null
        
        return DockableData.getLayout(props.root, rect)

    }, [rect, props.root])


    React.useEffect(() =>
    {
        if (!rootRef.current)
            return
            
        const onResize = () =>
        {
            const elemRect = rootRef.current!.getBoundingClientRect()
            setRect({
                x1: elemRect.x,
                x2: elemRect.x + elemRect.width,
                y1: elemRect.y,
                y2: elemRect.y + elemRect.height,
            })
        }

        onResize()
        
        window.addEventListener("resize", onResize)

        return () =>
        {
            window.removeEventListener("resize", onResize)
        }

    }, [rootRef.current])


    const mouseData = useMouseHandling(props, layout, rootRef)


    return <div style={{
        width: "100vw",
        height: "100vh",
    }}>

        { !layout ? null : layout.panelRects.map(panelRect =>
            <div key={ panelRect.panel.id } style={{
                position: "absolute",
                left: (panelRect.rect.x1) + "px",
                top: (panelRect.rect.y1) + "px",
                width: (panelRect.rect.x2 - panelRect.rect.x1 - 1) + "px",
                height: (panelRect.rect.y2 - panelRect.rect.y1 - 1) + "px",
                borderBottom: "1px solid #888",
                borderRight: "1px solid #888",
                overflow: "hidden",

                display: "grid",
                gridTemplate: "auto 1fr / 1fr",
            }}>

                <div id={ "dockable_header_" + panelRect.panel.id } style={{
                    backgroundColor: "#444",
                    textAlign: "left",
                }}>

                    { panelRect.panel.contentIds.map((cId, idx) =>
                        <div key={ cId } id={ "dockable_tab_" + cId } style={{
                            display: "inline-block",
                            backgroundColor: panelRect.panel.curContent == idx ? "#222" : "#666",
                            color: "#fff",
                            borderRight: "1px solid #888",
                            padding: "0.25em 0.5em",
                            userSelect: "none",
                        }}>
                            { "Content " + cId }
                        </div>
                    )}

                </div>

                <div style={{
                    backgroundColor: "#222",
                    color: "#fff",
                    fontSize: "3em",
                    width: "100%",
                    height: "100%",
                    minWidth: "0px",
                    minHeight: "0px",
                }}>
                    { (() =>
                    {
                        const contentIds = panelRect.panel.contentIds
                        const contentIndex = panelRect.panel.curContent

                        if (contentIndex >= contentIds.length)
                            return null

                        const contentId = contentIds[contentIndex]
                        const content = props.contents[contentId]
                        if (!content)
                            return null

                        const component = props.contentTypeToComponent(content.type)
                        const contentStateSet = (newState: any) =>
                        {
                            props.appDispatch({
                                type: "contentStateSet",
                                contentId,
                                newState,
                            })
                        }
                        
                        const contentDispatch = (action: any) =>
                        {
                            props.appDispatch({
                                type: "contentDispatch",
                                contentId,
                                action,
                            })
                        }
                        
                        return React.createElement(component, {
                            state: new ContentStateManager<any>(props.appState, contentId),
                            appState: props.appState,
                            appDispatch: props.appDispatch,
                            contentId,
                            contentState: content.state,
                            contentStateSet,
                            contentDispatch,
                            rect: panelRect.rect,
                        })

                    })() }
                </div>

            </div>
        )}

        { !mouseData.draggingAnchor ? null :
            <div style={{
                position: "absolute",
                left: (mouseData.draggingAnchor.previewRect.x1) + "px",
                top: (mouseData.draggingAnchor.previewRect.y1) + "px",
                width: (mouseData.draggingAnchor.previewRect.x2 - mouseData.draggingAnchor.previewRect.x1 - 1) + "px",
                height: (mouseData.draggingAnchor.previewRect.y2 - mouseData.draggingAnchor.previewRect.y1 - 1) + "px",

                backgroundColor: "#fff4",
            }}/>
        }

        { !mouseData.draggingPanelPos ? null :
            <div style={{
                position: "absolute",
                left: (mouseData.draggingPanelPos.x) + "px",
                top: (mouseData.draggingPanelPos.y) + "px",
                width: (100) + "px",
                height: (100) + "px",

                backgroundColor: "#444",
                border: "1px solid #888",
            }}/>
        }

        <div ref={ rootRef } style={{
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "100%",
            height: "100%",
            cursor: mouseData.cursor,
            pointerEvents: mouseData.blockEvents ? "auto" : "none",
        }}/>

    </div>
}


enum MouseAction
{
    None,
    ResizeDivider,
    MoveHeaderStart,
    MoveHeader,
}


interface MouseHandlingState
{
    cursor: string | undefined
    draggingPanelPos: MousePos | null
    draggingAnchor: Anchor | null
    blockEvents: boolean
}


interface MousePos
{
    x: number
    y: number
}


function useMouseHandling(props: DockableRootProps, layout: Layout | null, rootDivRef: React.RefObject<HTMLDivElement>): MouseHandlingState
{
    const transformMouse = (ev: MouseEvent): MousePos =>
    {
        return {
            x: ev.x,
            y: ev.y,
        }
    }

    const isMouseOverElem = (mousePos: MousePos, elem: HTMLElement): boolean =>
    {
        const elemRect = elem.getBoundingClientRect()
        return (
            mousePos.x >= elemRect.x &&
            mousePos.y >= elemRect.y &&
            mousePos.x <= elemRect.x + elemRect.width &&
            mousePos.y <= elemRect.y + elemRect.height
        )
    }


    const rootRef = React.useRef(props.root)
    rootRef.current = props.root

    const layoutRef = React.useRef(layout)
    layoutRef.current = layout


    const mouseDown = React.useRef<boolean>(false)
    const mouseDownPos = React.useRef<MousePos>({ x: -1000, y: -1000 })
    const mousePosLast = React.useRef<MousePos>({ x: -1000, y: -1000 })
    const mouseAction = React.useRef<MouseAction>(MouseAction.None)
    const curDivider = React.useRef<Divider | null>(null)
    const curHeader = React.useRef<number | null>(null)
    const curTab = React.useRef<number | null>(null)
    const curDragContentIds = React.useRef<number[] | null>(null)
    const curAnchor = React.useRef<Anchor | null>(null)

    const [state, setState] = React.useState<MouseHandlingState>({
        cursor: undefined,
        draggingPanelPos: null,
        draggingAnchor: null,
        blockEvents: false,
    })


    React.useEffect(() =>
    {
        const onMouseMove = (ev: MouseEvent) =>
        {
            const mousePos = transformMouse(ev)
            mousePosLast.current = mousePos

            if (!mouseDown.current)
            {
                curDivider.current = null
                curHeader.current = null
                curTab.current = null

                if (!layoutRef.current)
                {
                    refresh()
                    return
                }

                const margin = 4

                for (const divider of layoutRef.current.dividers)
                {
                    if (!divider.vertical &&
                        mousePos.y >= divider.rect.y1 &&
                        mousePos.y <= divider.rect.y2)
                    {
                        if (Math.abs(mousePos.x - divider.rect.x1) < margin)
                        {
                            curDivider.current = divider
                            break
                        }
                    }
                    else if (divider.vertical &&
                        mousePos.x >= divider.rect.x1 &&
                        mousePos.x <= divider.rect.x2)
                    {
                        if (Math.abs(mousePos.y - divider.rect.y1) < margin)
                        {
                            curDivider.current = divider
                            break
                        }
                    }
                }

                if (curDivider.current)
                {
                    refresh()
                    return
                }

                for (const panelLayout of layoutRef.current.panelRects)
                {
                    if (mousePos.x < panelLayout.rect.x1 ||
                        mousePos.x > panelLayout.rect.x2 ||
                        mousePos.y < panelLayout.rect.y1 ||
                        mousePos.y > panelLayout.rect.y2)
                        continue

                    const headerElem = document.getElementById("dockable_header_" + panelLayout.panel.id)
                    if (!headerElem)
                        continue

                    if (!isMouseOverElem(mousePos, headerElem))
                        continue
                    
                    curHeader.current = panelLayout.panel.id

                    for (const contentId of panelLayout.panel.contentIds)
                    {
                        const tabElem = document.getElementById("dockable_tab_" + contentId)
                        if (!tabElem)
                            continue
    
                        if (!isMouseOverElem(mousePos, tabElem))
                            continue

                        curTab.current = contentId
                    }
                    break
                }

                refresh()
            }
            else if (mouseAction.current == MouseAction.ResizeDivider)
            {
                ev.preventDefault()
                ev.stopPropagation()

                const divider = curDivider.current!
                const newSize = Math.max(0.05, Math.min(0.95,
                    ((divider.vertical ? mousePos.y : mousePos.x) - divider.resizeMin) /
                    (divider.resizeMax - divider.resizeMin)
                ))

                const newRoot = DockableData.modifyPanelFromRoot(
                    rootRef.current, divider.panel.id,
                    (panel) => ({ ...panel, subdivSize: newSize }))

                props.setRoot(newRoot)
                refresh()
            }
            else if (mouseAction.current == MouseAction.MoveHeaderStart)
            {
                ev.preventDefault()
                ev.stopPropagation()

                const minDistance = 10

                if (Math.abs(mousePos.x - mouseDownPos.current.x) > minDistance ||
                    Math.abs(mousePos.y - mouseDownPos.current.y) > minDistance)
                {
                    mouseAction.current = MouseAction.MoveHeader

                    const dragPanel = DockableData.findPanel(rootRef.current.rootPanel, curHeader.current!)!
                    if (curTab.current === null || dragPanel.contentIds.length <= 1)
                    {
                        curDragContentIds.current = dragPanel.contentIds
                        props.setRoot(DockableData.removePanel(rootRef.current, curHeader.current!))
                    }
                    else
                    {
                        curDragContentIds.current = [curTab.current]
                        props.setRoot(DockableData.modifyPanelFromRoot(rootRef.current, curHeader.current!, (panel) =>
                        {
                            const newContentIds = panel.contentIds.filter(cId => cId != curTab.current)
                            return {
                                ...panel,
                                contentIds: newContentIds,
                                curContent: Math.min(panel.curContent, newContentIds.length - 1),
                            }
                        }))
                    }
                }

                refresh()
            }
            else if (mouseAction.current == MouseAction.MoveHeader)
            {
                ev.preventDefault()
                ev.stopPropagation()

                let nearestDist = Infinity
                let nearestAnchor: Anchor | null = null

                for (const anchor of layoutRef.current!.anchors)
                {
                    const xx = anchor.x - mousePos.x
                    const yy = anchor.y - mousePos.y
                    const dist = xx * xx + yy * yy
                    if (dist < nearestDist)
                    {
                        nearestDist = dist
                        nearestAnchor = anchor
                    }
                }

                curAnchor.current = nearestAnchor
                refresh()
            }
        }


        const onMouseDown = (ev: MouseEvent) =>
        {
            if (mouseDown.current)
                return

            mouseDown.current = true
            mouseDownPos.current = transformMouse(ev)

            if (curDivider.current)
            {
                ev.preventDefault()
                ev.stopPropagation()
                mouseAction.current = MouseAction.ResizeDivider
            }
            else if (curHeader.current !== null)
            {
                ev.preventDefault()
                ev.stopPropagation()
                mouseAction.current = MouseAction.MoveHeaderStart

                if (curTab.current !== null)
                {
                    props.setRoot(DockableData.modifyPanelFromRoot(rootRef.current, curHeader.current!, (panel) =>
                    {
                        return {
                            ...panel,
                            curContent: panel.contentIds.findIndex(cId => cId === curTab.current),
                        }
                    }))
                }
            }
            else
                mouseAction.current = MouseAction.None

            refresh()
        }


        const onMouseUp = (ev: MouseEvent) =>
        {
            if (!mouseDown)
                return

            if (mouseAction.current == MouseAction.MoveHeader)
            {
                props.setRoot(DockableData.addPanel(
                    rootRef.current,
                    curAnchor.current!.panel.id,
                    curAnchor.current!.mode,
                    curDragContentIds.current!))
            }

            mouseDown.current = false
            mouseAction.current = MouseAction.None
            curAnchor.current = null
            refresh()
        }


        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
        rootDivRef.current!.addEventListener("mousedown", onMouseDown)

        return () =>
        {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
            rootDivRef.current!.removeEventListener("mousedown", onMouseDown)
        }

    }, [])


    const refresh = () =>
    {
        let cursor: string | undefined = undefined
        
        if (mouseAction.current == MouseAction.MoveHeader)
            cursor = "grabbing"
        else if (curDivider.current)
            cursor = (curDivider.current.vertical ? "ns-resize" : "ew-resize")

        let draggingPanelPos: MousePos | null = null
        if (mouseAction.current == MouseAction.MoveHeader)
            draggingPanelPos = mousePosLast.current

        const blockEvents =
            !!curDivider.current ||
            curHeader.current !== null ||
            mouseAction.current == MouseAction.MoveHeaderStart ||
            mouseAction.current == MouseAction.MoveHeader

        setState({
            cursor,
            draggingPanelPos,
            draggingAnchor: curAnchor.current,
            blockEvents,
        })
    }
    
    return state
}