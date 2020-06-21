import React from "react"
import DockableData, { Root, Panel, PanelRect, Content, Layout, Divider, Anchor, DockingMode } from "./DockableData"
import { AppState, AppDispatch, ContentStateManager } from "../App"
import Rect from "../util/rect"
import Immutable from "immutable"


interface DockableRootProps
{
    root: Root
    setRoot: ((newRoot: Root) => void)

    rect: Rect

    contents: Immutable.Map<number, Content>
    contentTypeToComponent: (type: string) => any
    contentTypeToTitle: (type: string, contentState: ContentStateManager<any>) => string

    appState: AppState
    appDispatch: AppDispatch
}


export default function DockableRoot(props: DockableRootProps)
{
    const rootRef = React.useRef<HTMLDivElement>(null)
    

    const layout = React.useMemo(() =>
    {
        if (!props.rect)
            return null
        
        return DockableData.getLayout(props.root, props.rect)

    }, [props.rect, props.root])

    
    const mouseData = useMouseHandling(props, layout, rootRef)

    const anchorSize = 5
    const anchorColor = "#0bf"

    return <div style={{
        width: "100vw",
        height: "100vh",
    }}>

        { !layout ? null : layout.panelRects.map(panelRect =>
            <Panel
                key={ panelRect.panel.id }
                rootProps={ props }
                panelRect={ panelRect }
            />
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

        { !mouseData.draggingPanelPos ? null : layout!.anchors.map((anchor, i) =>
            <div key={ i } style={{
                position: "absolute",
                left: (anchor.x - anchorSize) + "px",
                top: (anchor.y - anchorSize) + "px",
                width: "0px",
                height: "0px",

                borderTop: (anchorSize) + "px solid " + (anchor.mode == DockingMode.Bottom || anchor.mode == DockingMode.Full ? anchorColor : "transparent"), 
                borderBottom: (anchorSize) + "px solid " + (anchor.mode == DockingMode.Top || anchor.mode == DockingMode.Full ? anchorColor : "transparent"), 
                borderLeft: (anchorSize) + "px solid " + (anchor.mode == DockingMode.Right || anchor.mode == DockingMode.Full ? anchorColor : "transparent"), 
                borderRight: (anchorSize) + "px solid " + (anchor.mode == DockingMode.Left || anchor.mode == DockingMode.Full ? anchorColor : "transparent"), 
            }}/>
        )}

        { /*!mouseData.draggingPanelPos ? null :
            <div style={{
                position: "absolute",
                left: (mouseData.draggingPanelPos.x) + "px",
                top: (mouseData.draggingPanelPos.y) + "px",
                width: (100) + "px",
                height: (100) + "px",

                backgroundColor: "#444",
                border: "1px solid #888",
            }}/>*/
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


function Panel(props: any)
{
    const rootProps: DockableRootProps = props.rootProps
    const panelRect: PanelRect = props.panelRect

    return <div key={ panelRect.panel.id } style={{
        position: "absolute",
        left: (panelRect.rect.x1) + "px",
        top: (panelRect.rect.y1) + "px",
        width: (panelRect.rect.x2 - panelRect.rect.x1 - 1) + "px",
        height: (panelRect.rect.y2 - panelRect.rect.y1 - 1) + "px",
        borderBottom: "1px solid #888",
        borderRight: "1px solid #888",
        borderTop: !panelRect.floating ? undefined : "1px solid #888",
        borderLeft: !panelRect.floating ? undefined : "1px solid #888",
        overflow: "hidden",

        display: "grid",
        gridTemplate: "auto 1fr / 1fr",
    }}>

        { (() => {
            const contentIds = panelRect.panel.contentIds
            const contentIndex = panelRect.panel.curContent

            if (contentIndex >= contentIds.length)
                return null

            const contentId = contentIds[contentIndex]
            const content = rootProps.contents.get(contentId)
            if (!content)
                return null

            const component = rootProps.contentTypeToComponent(content.type)
            const contentStateSet = (newState: any) =>
            {
                rootProps.appDispatch({
                    type: "contentStateSet",
                    contentId,
                    newState,
                })
            }
            
            const contentDispatch = (action: any) =>
            {
                rootProps.appDispatch({
                    type: "contentDispatch",
                    contentId,
                    action,
                })
            }

            const contentStateManager = new ContentStateManager<any>(rootProps.appState, contentId)

            return <>
                <div id={ "dockable_header_" + panelRect.panel.id } style={{
                    backgroundColor: "#444",
                    textAlign: "left",
                }}>

                    { panelRect.panel.contentIds.map((cId, idx) =>
                        <div
                            key={ cId }
                            id={ "dockable_tab_" + cId }
                            onContextMenu={ ev => ev.preventDefault() }
                            style={{
                                display: "inline-block",
                                backgroundColor: panelRect.panel.curContent == idx ? "#222" : "#666",
                                color: "#fff",
                                borderRight: "1px solid #888",
                                padding: "0.25em 0.5em",
                                userSelect: "none",
                        }}>
                            { rootProps.contentTypeToTitle ?
                                rootProps.contentTypeToTitle(content.type, contentStateManager) :
                                "Content " + cId }
                        </div>
                    )}

                </div>

                <div style={{
                    backgroundColor: "#222",
                    color: "#fff",
                    width: "100%",
                    height: "100%",
                    minWidth: "0px",
                    minHeight: "0px",
                    textAlign: "left",
                }}>
                        { React.createElement(component, {
                            state: contentStateManager,
                            appState: rootProps.appState,
                            appDispatch: rootProps.appDispatch,
                            contentId,
                            contentState: content.state,
                            contentStateSet,
                            contentDispatch,
                            rect: panelRect,
                        })}
                </div>
            </>
        })() }

    </div>
}


enum MouseAction
{
    None,
    ResizeDivider,
    MoveHeaderStart,
    MoveHeader,
    MoveFloatingHeader,
}


interface MouseHandlingState
{
    cursor: string | undefined
    draggingPanelPos: MousePos | null
    draggingAnchor: Anchor | null
    blockEvents: boolean

    mouseDown: boolean
    mouseDownPos: MousePos
    mousePosLast: MousePos
    mouseAction: MouseAction
    curHoverDivider: Divider | null
    curHoverPanelId: number | null
    curHoverTabContentId: number | null
    curDragOrigRect: Rect | null
    curDragContentIds: number[] | null
    curDragFloatingPanelId: number | null
    curAnchor: Anchor | null
}


interface MousePos
{
    x: number
    y: number
}


function useMouseHandling(props: DockableRootProps, layout: Layout | null, rootDivRef: React.RefObject<HTMLDivElement>)
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

    const [prevState, setState] = React.useState<MouseHandlingState>(
    {
        cursor: undefined,
        draggingPanelPos: null,
        draggingAnchor: null,
        blockEvents: false,

        mouseDown: false,
        mouseDownPos: { x: -1000, y: -1000 },
        mousePosLast: { x: -1000, y: -1000 },
        mouseAction: MouseAction.None,
        curHoverDivider: null,
        curHoverPanelId: null,
        curHoverTabContentId: null,
        curDragOrigRect: null,
        curDragContentIds: null,
        curDragFloatingPanelId: null,
        curAnchor: null
    })

    let state = { ...prevState }


    React.useEffect(() =>
    {
        const onMouseMove = (ev: MouseEvent) =>
        {
            const mousePos = transformMouse(ev)
            state.mousePosLast = mousePos

            if (!state.mouseDown)
            {
                state.curHoverDivider = null
                state.curHoverPanelId = null
                state.curHoverTabContentId = null

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
                            state.curHoverDivider = divider
                            break
                        }
                    }
                    else if (divider.vertical &&
                        mousePos.x >= divider.rect.x1 &&
                        mousePos.x <= divider.rect.x2)
                    {
                        if (Math.abs(mousePos.y - divider.rect.y1) < margin)
                        {
                            state.curHoverDivider = divider
                            break
                        }
                    }
                }

                if (state.curHoverDivider)
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
                    
                    state.curHoverPanelId = panelLayout.panel.id

                    for (const contentId of panelLayout.panel.contentIds)
                    {
                        const tabElem = document.getElementById("dockable_tab_" + contentId)
                        if (!tabElem)
                            continue
    
                        if (!isMouseOverElem(mousePos, tabElem))
                            continue

                        state.curHoverTabContentId = contentId
                    }
                    break
                }

                refresh()
            }
            else if (state.mouseAction == MouseAction.ResizeDivider)
            {
                ev.preventDefault()
                ev.stopPropagation()

                const divider = state.curHoverDivider!
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
            else if (state.mouseAction == MouseAction.MoveHeaderStart)
            {
                ev.preventDefault()
                ev.stopPropagation()

                const minDistance = 10

                if (Math.abs(mousePos.x - state.mouseDownPos.x) > minDistance ||
                    Math.abs(mousePos.y - state.mouseDownPos.y) > minDistance)
                {
                    state.mouseAction = MouseAction.MoveHeader

                    const dragPanel = DockableData.findPanel(rootRef.current.rootPanel, state.curHoverPanelId!)
                    if (!dragPanel)
                    {
                        const dragPanelLayout = layoutRef.current!.panelRects.find(p => p.panel.id === state.curHoverPanelId)!
                        state.curDragFloatingPanelId = state.curHoverPanelId
                        state.curDragContentIds = dragPanelLayout.panel.contentIds
                        state.curDragOrigRect = dragPanelLayout.rect
                    }
                    else if (state.curHoverTabContentId === null || dragPanel.contentIds.length <= 1)
                    {
                        const dragPanelLayout = layoutRef.current!.panelRects.find(p => p.panel.id === state.curHoverPanelId)!
                        state.curDragContentIds = dragPanel.contentIds
                        state.curDragOrigRect = dragPanelLayout.rect
                        let newRoot = DockableData.removePanel(rootRef.current, state.curHoverPanelId!)
                        state.curDragFloatingPanelId = rootRef.current.idNext
                        newRoot = DockableData.addFloatingPanel(
                            newRoot,
                            dragPanelLayout.rect,
                            dragPanel.contentIds)
                        props.setRoot(newRoot)
                    }
                    else
                    {
                        const dragPanelLayout = layoutRef.current!.panelRects.find(p => p.panel.id === state.curHoverPanelId)!
                        state.curDragContentIds = [state.curHoverTabContentId]
                        state.curDragOrigRect = dragPanelLayout.rect
                        let newRoot = DockableData.modifyPanelFromRoot(rootRef.current, state.curHoverPanelId!, (panel) =>
                        {
                            const newContentIds = panel.contentIds.filter(cId => cId != state.curHoverTabContentId)
                            return {
                                ...panel,
                                contentIds: newContentIds,
                                curContent: Math.min(panel.curContent, newContentIds.length - 1),
                            }
                        })

                        state.curDragFloatingPanelId = rootRef.current.idNext
                        newRoot = DockableData.addFloatingPanel(
                            newRoot,
                            dragPanelLayout.rect,
                            [state.curHoverTabContentId])
                        props.setRoot(newRoot)
                    }
                }

                refresh()
            }
            else if (state.mouseAction == MouseAction.MoveHeader)
            {
                ev.preventDefault()
                ev.stopPropagation()

                let nearestDist = 50 * 50//Infinity
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

                state.curAnchor = nearestAnchor

                const xDelta = mousePos.x - state.mouseDownPos.x
                const yDelta = mousePos.y - state.mouseDownPos.y

                const newRect = state.curDragOrigRect!.displace(xDelta, yDelta)

                props.setRoot(DockableData.moveFloatingPanel(rootRef.current, state.curDragFloatingPanelId!, newRect))

                refresh()
            }
        }


        const onMouseDown = (ev: MouseEvent) =>
        {
            if (state.mouseDown)
                return

            state.mouseDown = true
            state.mouseDownPos = transformMouse(ev)

            if (state.curHoverDivider)
            {
                ev.preventDefault()
                ev.stopPropagation()
                state.mouseAction = MouseAction.ResizeDivider
            }
            else if (state.curHoverPanelId !== null)
            {
                ev.preventDefault()
                ev.stopPropagation()
                state.mouseAction = MouseAction.MoveHeaderStart

                if (state.curHoverTabContentId !== null)
                {
                    props.setRoot(DockableData.modifyPanelFromRoot(rootRef.current, state.curHoverPanelId!, (panel) =>
                    {
                        return {
                            ...panel,
                            curContent: panel.contentIds.findIndex(cId => cId === state.curHoverTabContentId),
                        }
                    }))
                }
            }
            else
                state.mouseAction = MouseAction.None

            refresh()
        }


        const onMouseUp = (ev: MouseEvent) =>
        {
            if (!state.mouseDown)
                return

            if (state.mouseAction == MouseAction.MoveHeader)
            {
                if (state.curAnchor)
                {
                    let newRoot = DockableData.removeFloatingPanel(rootRef.current, state.curDragFloatingPanelId!)
                    
                    newRoot = DockableData.addPanel(
                        newRoot,
                        state.curAnchor!.panel.id,
                        state.curAnchor!.mode,
                        state.curDragContentIds!)

                    props.setRoot(newRoot)
                }
            }

            state.mouseDown = false
            state.mouseAction = MouseAction.None
            state.curAnchor = null
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
        
        if (state.mouseAction == MouseAction.MoveHeader)
            cursor = "grabbing"
        else if (state.curHoverDivider)
            cursor = (state.curHoverDivider.vertical ? "ns-resize" : "ew-resize")

        let draggingPanelPos: MousePos | null = null
        if (state.mouseAction == MouseAction.MoveHeader)
            draggingPanelPos = state.mousePosLast

        const blockEvents =
            !!state.curHoverDivider ||
            state.curHoverPanelId !== null ||
            state.mouseAction == MouseAction.MoveHeaderStart ||
            state.mouseAction == MouseAction.MoveHeader

        setState(
        {
            ...state,
            cursor,
            draggingPanelPos,
            draggingAnchor: state.curAnchor,
            blockEvents,
        })
    }
    
    return prevState
}