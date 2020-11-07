import React from "react"
import * as Dockable from "./index"
import * as DockableData from "./state"
import { WindowContext } from "./windowContext"
import Rect from "../util/rect"
import Immutable from "immutable"
import styled from "styled-components"


const colorVoid = "#202225"
const colorPanelBkg = "#2f3136"


const StyledCloseButton = styled.button`
    pointer-events: auto;
    color: #fff;
    border: 1px solid #888;
    border-radius: 0.5em;
    background-color: #2f3136;
    padding: 0.1em 0.3em;
    cursor: pointer;
    margin-left: 0.25em;
    width: 1.5em;

    &:hover
    {
        border: 1px solid #fff;
    }
`


export function Container()
{
    const dockable = Dockable.useDockable()
    const state = dockable.ref.current.state

    const [rect, setRect] = React.useState(new Rect(0, 0, 0, 0))
    const rootRef = React.useRef<HTMLDivElement>(null)


    React.useLayoutEffect(() =>
    {
        const onResize = () =>
        {
            if (!rootRef.current)
                return
    
            const elemRect = rootRef.current!.getBoundingClientRect()

            setRect(new Rect(
                elemRect.x,
                elemRect.y,
                elemRect.width,
                elemRect.height))
        }

        onResize()

        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)

    }, [rootRef.current])


    const layout = React.useMemo(() =>
    {
        if (!rect)
            return null
        
        return DockableData.getLayout(state, rect)

    }, [rect, state])

    
    const mouseData = useMouseHandling(layout, rootRef)

    const anchorSize = 5
    const anchorColor = "#0bf"

    return <div style={{
        width: "100%",
        height: "100%",
        backgroundColor: colorVoid,
    }}>

        { !layout ? null : layout.panelRects.map(panelRect =>
            <Panel
                key={ panelRect.panel.id }
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

                borderTop: (anchorSize) + "px solid " + (anchor.mode == DockableData.DockMode.Bottom || anchor.mode == DockableData.DockMode.Full ? anchorColor : "transparent"), 
                borderBottom: (anchorSize) + "px solid " + (anchor.mode == DockableData.DockMode.Top || anchor.mode == DockableData.DockMode.Full ? anchorColor : "transparent"), 
                borderLeft: (anchorSize) + "px solid " + (anchor.mode == DockableData.DockMode.Right || anchor.mode == DockableData.DockMode.Full ? anchorColor : "transparent"), 
                borderRight: (anchorSize) + "px solid " + (anchor.mode == DockableData.DockMode.Left || anchor.mode == DockableData.DockMode.Full ? anchorColor : "transparent"), 
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
            position: "relative",
            top: "0px",
            left: "0px",
            width: "100%",
            height: "100%",
            cursor: mouseData.cursor,
            pointerEvents: mouseData.blockEvents ? "auto" : "none",
        }}/>

    </div>
}


const DivPanel = styled.div`
    border: 1px solid ${ colorVoid };

    &:hover
    {
        border: 1px solid #fff;
    }
`


function Panel(props: any)
{
    const dockable = Dockable.useDockable()
    const panelRect: DockableData.PanelRect = props.panelRect

    const onCloseTab = (windowId: DockableData.WindowId) =>
    {
        const panel = DockableData.findPanelWithContent(dockable.ref.current.state.rootPanel, windowId)
        if (panel)
        {
            if (panel.windowIds.length <= 1)
            {
                dockable.ref.current.state =
                    DockableData.removePanel(dockable.ref.current.state, panel.id)
            }
            else
            {
                dockable.ref.current.state =
                    DockableData.modifyPanelFromRoot(dockable.ref.current.state, panel.id, (panel) =>
                    {
                        const newContentIds = panel.windowIds.filter(cId => cId != windowId)
                        return {
                            ...panel,
                            windowIds: newContentIds,
                            curWindowIndex: Math.min(panel.curWindowIndex, newContentIds.length - 1),
                        }
                    })
            }
        }

        dockable.ref.current.state =
            DockableData.removeFloatingContent(dockable.ref.current.state, windowId)

        dockable.commit()
    }

    return <div key={ panelRect.panel.id } style={{
        position: "absolute",
        left: (panelRect.rect.x) + "px",
        top: (panelRect.rect.y) + "px",
        width: (panelRect.rect.w) + "px",
        height: (panelRect.rect.h) + "px",
        boxSizing: "border-box",

        backgroundColor: colorVoid,
        borderRadius: "0.5em",
        padding: "0.25em",
    }}>
        <DivPanel style={{
            backgroundColor: colorPanelBkg,
            borderRadius: "0.5em",
            boxSizing: "border-box",
            width: "100%",
            height: "100%",
            
            display: "grid",
            gridTemplate: "auto 1fr / 1fr",
            overflow: "hidden",
        }}>

            { (() => {
                const contentIds = panelRect.panel.windowIds
                const contentIndex = panelRect.panel.curWindowIndex

                if (contentIndex >= contentIds.length)
                    return null

                return <>
                    <div id={ "dockable_header_" + panelRect.panel.id } style={{
                        backgroundColor: colorVoid,
                        textAlign: "left",
                    }}>

                        { panelRect.panel.windowIds.map((cId, idx) =>
                            <div
                                key={ cId }
                                id={ "dockable_tab_" + cId }
                                onContextMenu={ ev => ev.preventDefault() }
                                style={{
                                    display: "inline-block",
                                    backgroundColor: panelRect.panel.curWindowIndex == idx ? colorPanelBkg : colorVoid,
                                    color: "#fff",
                                    padding: "0.25em 0.5em",
                                    marginRight: "0.25em",
                                    userSelect: "none",
                                    borderTopRightRadius: "0.5em",
                                    borderTopLeftRadius: "0.5em",
                            }}>
                                { "Content " + cId }
                                <StyledCloseButton
                                    id={ "dockable_close_" + cId }
                                    onClick={ () => onCloseTab(cId) }
                                >
                                    x
                                </StyledCloseButton>
                            </div>
                        )}

                    </div>

                    { panelRect.panel.windowIds.map((cId, idx) =>
                    {
                        const component = !dockable.ref.current.contentIdToComponent ? null :
                            dockable.ref.current.contentIdToComponent(cId)

                        const data = !dockable.ref.current.contentIdToData ? null :
                            dockable.ref.current.contentIdToData(cId)

                        return <WindowContext.Provider key={ cId } value={{
                            contentId: cId,
                            data,
                        }}>
                            <div style={{
                                display: panelRect.panel.curWindowIndex == idx ? "block" : "none",
                                color: "#fff",
                                width: "100%",
                                height: "100%",
                                minWidth: "0px",
                                minHeight: "0px",
                                textAlign: "left",
                            }}>
                                { !component ? null : React.createElement(component, {
                                    key: cId,
                                    contentId: cId,
                                    rect: panelRect,
                                })}
                            </div>
                        </WindowContext.Provider>
                    })}
                </>
            })() }

        </DivPanel>

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
    draggingAnchor: DockableData.Anchor | null
    blockEvents: boolean

    mouseDown: boolean
    mouseDownPos: MousePos
    mousePosLast: MousePos
    mouseAction: MouseAction
    curHoverDivider: DockableData.Divider | null
    curHoverPanelId: number | null
    curHoverTabContentId: number | null
    curDragOrigRect: Rect | null
    curDragContentIds: number[] | null
    curDragFloatingPanelId: number | null
    curAnchor: DockableData.Anchor | null
}


interface MousePos
{
    x: number
    y: number
}


function useMouseHandling(layout: DockableData.Layout | null, rootDivRef: React.RefObject<HTMLDivElement>)
{
    const dockable = Dockable.useDockable()

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


    const rootRef = dockable.ref

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

                    for (const contentId of panelLayout.panel.windowIds)
                    {
                        const closeElem = document.getElementById("dockable_close_" + contentId)
                        if (closeElem && isMouseOverElem(mousePos, closeElem))
                        {
                            state.curHoverPanelId = null
                            break
                        }

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
                    rootRef.current.state, divider.panel.id,
                    (panel) => ({ ...panel, splitSize: newSize }))

                rootRef.current.setState(newRoot)
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

                    const dragPanel = DockableData.findPanel(rootRef.current.state.rootPanel, state.curHoverPanelId!)
                    if (!dragPanel)
                    {
                        const dragPanelLayout = layoutRef.current!.panelRects.find(p => p.panel.id === state.curHoverPanelId)!
                        state.curDragFloatingPanelId = state.curHoverPanelId
                        state.curDragContentIds = dragPanelLayout.panel.windowIds
                        state.curDragOrigRect = dragPanelLayout.rect
                    }
                    else if (state.curHoverTabContentId === null || dragPanel.windowIds.length <= 1)
                    {
                        const dragPanelLayout = layoutRef.current!.panelRects.find(p => p.panel.id === state.curHoverPanelId)!
                        state.curDragContentIds = dragPanel.windowIds
                        state.curDragOrigRect = dragPanelLayout.rect
                        let newRoot = DockableData.removePanel(rootRef.current.state, state.curHoverPanelId!)
                        state.curDragFloatingPanelId = rootRef.current.state.idNext
                        newRoot = DockableData.addFloatingPanel(
                            newRoot,
                            dragPanelLayout.rect,
                            dragPanel.windowIds)
                        rootRef.current.setState(newRoot)
                    }
                    else
                    {
                        const dragPanelLayout = layoutRef.current!.panelRects.find(p => p.panel.id === state.curHoverPanelId)!
                        state.curDragContentIds = [state.curHoverTabContentId]
                        state.curDragOrigRect = dragPanelLayout.rect
                        let newRoot = DockableData.modifyPanelFromRoot(rootRef.current.state, state.curHoverPanelId!, (panel) =>
                        {
                            const newContentIds = panel.windowIds.filter(cId => cId != state.curHoverTabContentId)
                            return {
                                ...panel,
                                windowIds: newContentIds,
                                curWindowIndex: Math.min(panel.curWindowIndex, newContentIds.length - 1),
                            }
                        })

                        state.curDragFloatingPanelId = rootRef.current.state.idNext
                        newRoot = DockableData.addFloatingPanel(
                            newRoot,
                            dragPanelLayout.rect,
                            [state.curHoverTabContentId])
                        rootRef.current.setState(newRoot)
                    }
                }

                refresh()
            }
            else if (state.mouseAction == MouseAction.MoveHeader)
            {
                ev.preventDefault()
                ev.stopPropagation()

                let nearestDist = 50 * 50//Infinity
                let nearestAnchor: DockableData.Anchor | null = null

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

                rootRef.current.setState(DockableData.moveFloatingPanel(rootRef.current.state, state.curDragFloatingPanelId!, newRect))

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
                    rootRef.current.setState(DockableData.modifyPanelFromRoot(rootRef.current.state, state.curHoverPanelId!, (panel) =>
                    {
                        return {
                            ...panel,
                            curWindowIndex: panel.windowIds.findIndex(cId => cId === state.curHoverTabContentId),
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
                    let newRoot = DockableData.removeFloatingPanel(rootRef.current.state, state.curDragFloatingPanelId!)
                    
                    newRoot = DockableData.addPanel(
                        newRoot,
                        state.curAnchor!.panel.id,
                        state.curAnchor!.mode,
                        state.curDragContentIds!)

                    rootRef.current.setState(newRoot)
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