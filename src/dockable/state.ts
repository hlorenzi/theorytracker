import Rect from "../util/rect"
import Immutable from "immutable"


export type PanelId = number
export type WindowId = number


export interface State
{
    idNext: PanelId
    rootPanel: Panel
    floatingPanels: FloatingPanel[]
}


export enum SplitMode
{
    LeftRight,
    TopBottom,
}


export enum DockMode
{
    Full,
    Left,
    Right,
    Top,
    Bottom,
}


export interface Panel
{
    id: PanelId
    windowIds: WindowId[]
    curWindowIndex: number
    splitPanels: Panel[]
    splitMode: SplitMode
    splitSize: number
}


export interface FloatingPanel
{
    panel: Panel
    rect: Rect
}


export interface PanelRect
{
    panel: Panel
    rect: Rect
    floating: boolean
}


export interface Divider
{
    panel: Panel
    vertical: boolean
    rect: Rect
    resizeMin: number
    resizeMax: number
}


export interface Anchor
{
    panel: Panel
    x: number
    y: number
    mode: DockMode
    previewRect: Rect
}


export interface Layout
{
    panelRects: PanelRect[]
    dividers: Divider[]
    anchors: Anchor[]
}


export function makeRoot(): State
{
    return {
        idNext: 2,
        rootPanel: {
            id: 1,
            windowIds: [],
            curWindowIndex: 0,
            splitPanels: [],
            splitMode: SplitMode.LeftRight,
            splitSize: 0.5,
        },
        floatingPanels: [],
    }
}


export function findPanelWithContent(panel: Panel, wantedContentId: number): Panel | null
{
    if (panel.windowIds.some(c => c == wantedContentId))
        return panel
        
    for (const subpanel of panel.splitPanels)
    {
        const found = findPanelWithContent(subpanel, wantedContentId)
        if (found)
            return found
    }

    return null
}


export function clonePanel(panel: Panel): Panel
{
    return {
        ...panel,
        splitPanels: panel.splitPanels.map(p => clonePanel(p)),
    }
}


export function findPanel(panel: Panel, wantedId: number): Panel | null
{
    if (panel.id == wantedId)
        return panel
        
    for (const subpanel of panel.splitPanels)
    {
        const found = findPanel(subpanel, wantedId)
        if (found)
            return found
    }

    return null
}


export function findPanelParent(panel: Panel, wantedId: number): Panel | null
{
    for (const subpanel of panel.splitPanels)
    {
        if (subpanel.id == wantedId)
            return panel

        const found = findPanelParent(subpanel, wantedId)
        if (found)
            return found
    }

    return null
}


export function changePanel(panel: Panel, wantedId: number, newPanel: Panel): Panel
{
    if (panel.id == wantedId)
        return newPanel

    return {
        ...panel,
        splitPanels: panel.splitPanels.map(p => changePanel(p, wantedId, newPanel))
    }
}


export function modifyPanel(panel: Panel, wantedId: number, modifyFn: ((oldPanel: Panel) => Panel)): Panel
{
    if (panel.id == wantedId)
        return modifyFn(panel)

    return {
        ...panel,
        splitPanels: panel.splitPanels.map(p => modifyPanel(p, wantedId, modifyFn))
    }
}


export function modifyPanelFromRoot(root: State, wantedId: number, modifyFn: ((oldPanel: Panel) => Panel)): State
{
    return {
        ...root,
        rootPanel: modifyPanel(root.rootPanel, wantedId, modifyFn),
        floatingPanels: root.floatingPanels.map(fp =>
        {
            if (fp.panel.id == wantedId)
                return { ...fp, panel: modifyFn(fp.panel) }

            return fp
        })
    }
}


export function addContent(root: State, panelId: number, contentId: number): State
{
    return modifyPanelFromRoot(root, panelId, (panel) =>
    {
        return {
            ...panel,
            windowIds: [...panel.windowIds, contentId]
        }
    })
}


export function addFloatingPanel(root: State, rect: Rect, contentIds: number | number[]): State
{
    const contentIdsArray = Array.isArray(contentIds) ? contentIds : [contentIds]

    const newFloatingPanels = [
        ...root.floatingPanels,
        {
            panel: {
                id: root.idNext,
                curWindowIndex: 0,
                windowIds: contentIdsArray,
                splitPanels: [],
                splitMode: SplitMode.LeftRight,
                splitSize: 0.5,
            },
            rect,
        },
    ]

    return {
        ...root,
        idNext: root.idNext + 1,
        floatingPanels: newFloatingPanels,
    }
}


export function moveFloatingPanel(root: State, panelId: number, newRect: Rect): State
{
    return {
        ...root,
        floatingPanels: root.floatingPanels.map(fp =>
        {
            if (fp.panel.id !== panelId)
                return fp

            return {
                ...fp,
                rect: newRect,
            }
        })
    }
}


export function removeFloatingPanel(root: State, panelId: number): State
{
    return {
        ...root,
        floatingPanels: root.floatingPanels.filter(fp => fp.panel.id !== panelId),
    }
}


export function removeFloatingContent(root: State, contentId: number): State
{
    const panel = root.floatingPanels.find(fp => fp.panel.windowIds.some(c => c === contentId))
    if (!panel)
        return root
    
    return {
        ...root,
        floatingPanels: root.floatingPanels.filter(fp => fp !== panel),
    }
}


export function addPanel(root: State, dockIntoId: number, mode: DockMode, contentIds: number | number[]): State
{
    const contentIdsArray = Array.isArray(contentIds) ? contentIds : [contentIds]
    const dockIntoPanel = findPanel(root.rootPanel, dockIntoId)!

    if (mode == DockMode.Full ||
        (dockIntoPanel.windowIds.length == 0 && dockIntoPanel.splitPanels.length == 0))
    {
        if (dockIntoPanel.splitPanels.length > 0)
            throw "invalid full docking into subdivided panel"

        
        return modifyPanelFromRoot(
            root,
            dockIntoId,
            (panel) =>
            {
                const newContentIds = [...panel.windowIds, ...contentIdsArray]
                return {
                    ...panel,
                    windowIds: newContentIds,
                    curWindowIndex: newContentIds.length - 1,
                }
            })
    }
    else if (mode == DockMode.Right ||
        mode == DockMode.Left ||
        mode == DockMode.Top ||
        mode == DockMode.Bottom)
    {
        const subdivMode =
            (mode == DockMode.Right || mode == DockMode.Left) ?
                SplitMode.LeftRight :
                SplitMode.TopBottom

        const subdivOriginalFirst =
            (mode == DockMode.Bottom || mode == DockMode.Right)

        const newSubpanels = []
        if (subdivOriginalFirst)
            newSubpanels.push(dockIntoPanel)
            
        newSubpanels.push(
        {
            id: root.idNext,
            windowIds: contentIdsArray,
            curWindowIndex: 0,
            splitPanels: [],
            splitMode: SplitMode.LeftRight,
            splitSize: 0.5,
        })

        if (!subdivOriginalFirst)
            newSubpanels.push(dockIntoPanel)

        let newRootPanel = changePanel(
            root.rootPanel,
            dockIntoId,
            {
                id: root.idNext + 1,
                windowIds: [],
                curWindowIndex: 0,
                splitPanels: newSubpanels,
                splitMode: subdivMode,
                splitSize: subdivOriginalFirst ? 0.75 : 0.25,
            })

        return {
            ...root,
            idNext: root.idNext + 2,
            rootPanel: newRootPanel,
        }
    }

    throw "invalid docking"
}


export function removePanel(root: State, panelId: number): State
{
    let panelParent = findPanelParent(root.rootPanel, panelId)

    if (!panelParent)
    {
        return {
            ...root,
            idNext: root.idNext + 1,
            rootPanel: {
                id: root.idNext,
                windowIds: [],
                curWindowIndex: 0,
                splitPanels: [],
                splitMode: SplitMode.LeftRight,
                splitSize: 0.5,
            }
        }
    }

    root = modifyPanelFromRoot(root, panelParent.id, (panel) =>
    {
        const remainingPanel = panel.splitPanels.find(p => p.id != panelId)!
        return remainingPanel
    })

    return root
}


export function traverseLayout(panel: Panel, rect: Rect, layout: Layout)
{
    const xMid = (rect.x1 + rect.x2) / 2
    const yMid = (rect.y1 + rect.y2) / 2

    if (panel.splitPanels.length == 2)
    {
        if (panel.splitMode == SplitMode.LeftRight)
        {
            const xSplit = rect.x1 + Math.round((rect.x2 - rect.x1) * panel.splitSize)

            const rect1 = rect.withX2(xSplit)
            const rect2 = rect.withX1(xSplit)
            const rectDivider = rect.withX1(xSplit).withX2(xSplit)

            traverseLayout(panel.splitPanels[0], rect1, layout)
            traverseLayout(panel.splitPanels[1], rect2, layout)
            
            layout.dividers.push({
                panel,
                vertical: false,
                rect: rectDivider,
                resizeMin: rect.x1,
                resizeMax: rect.x2,
            })
        }
        else if (panel.splitMode == SplitMode.TopBottom)
        {
            const ySplit = rect.y1 + Math.round((rect.y2 - rect.y1) * panel.splitSize)

            const rect1 = rect.withY2(ySplit)
            const rect2 = rect.withY1(ySplit)
            const rectDivider = rect.withY1(ySplit).withY2(ySplit)

            traverseLayout(panel.splitPanels[0], rect1, layout)
            traverseLayout(panel.splitPanels[1], rect2, layout)

            layout.dividers.push({
                panel,
                vertical: true,
                rect: rectDivider,
                resizeMin: rect.y1,
                resizeMax: rect.y2,
            })
        }
    }
    else
    {
        layout.panelRects.push({
            panel,
            rect,
            floating: false,
        })

        layout.anchors.push({
            panel,
            x: xMid,
            y: yMid,
            mode: DockMode.Full,
            previewRect: rect,
        })
    }

    layout.anchors.push({
        panel,
        x: rect.x2 - 10,
        y: yMid,
        mode: DockMode.Right,
        previewRect: rect.withX1(rect.x1 + (rect.x2 - rect.x1) * 3 / 4),
    })

    layout.anchors.push({
        panel,
        x: rect.x1 + 10,
        y: yMid,
        mode: DockMode.Left,
        previewRect: rect.withX2(rect.x1 + (rect.x2 - rect.x1) / 4),
    })

    layout.anchors.push({
        panel,
        x: xMid,
        y: rect.y2 - 10,
        mode: DockMode.Bottom,
        previewRect: rect.withY1(rect.y1 + (rect.y2 - rect.y1) * 3 / 4),
    })

    layout.anchors.push({
        panel,
        x: xMid,
        y: rect.y1 + 10,
        mode: DockMode.Top,
        previewRect: rect.withY2(rect.y1 + (rect.y2 - rect.y1) / 4),
    })
}


export function getLayout(root: State, rect: Rect): Layout
{
    const layout: Layout =
    {
        panelRects: [],
        dividers: [],
        anchors: [],
    }

    traverseLayout(root.rootPanel, rect, layout)

    for (const floatingPanel of root.floatingPanels)
        layout.panelRects.push({ ...floatingPanel, floating: true })

    return layout
}


export function getContentRect(root: State, rect: Rect, contentId: number): Rect | undefined
{
    const layout = getLayout(root, rect)
    return layout.panelRects.find(p => p.panel.windowIds.some(c => c === contentId))!.rect
}