import { Root } from "../project"
import Rect from "../util/rect"


export type PanelId = number
export type WindowId = any


export interface State
{
    idNext: PanelId
    rootPanel: Panel
    floatingPanels: Panel[]
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
    floating: boolean
    rect: Rect
    bugfixAppearOnTop: boolean
    windowIds: WindowId[]
    curWindowIndex: number
    splitPanels: Panel[]
    splitMode: SplitMode
    splitSize: number

    windowTitles: string[]
    preferredFloatingSize: Rect

    justOpened: boolean
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
            floating: false,
            bugfixAppearOnTop: false,
            rect: new Rect(0, 0, 0, 0),
            windowIds: [],
            curWindowIndex: 0,
            splitPanels: [],
            splitMode: SplitMode.LeftRight,
            splitSize: 0.5,

            windowTitles: [],
            preferredFloatingSize: new Rect(0, 0, 300, 250),

            justOpened: false,
        },
        floatingPanels: [],
    }
}


export function makePanel(root: State): Panel
{
    const id = root.idNext++
    const panel: Panel = {
        id,
        floating: true,
        bugfixAppearOnTop: false,
        rect: new Rect(0, 0, 0, 0),
        windowIds: [],
        curWindowIndex: 0,
        splitPanels: [],
        splitMode: SplitMode.LeftRight,
        splitSize: 0.5,

        windowTitles: [],
        preferredFloatingSize: new Rect(0, 0, 300, 250),

        justOpened: true,
    }
    root.floatingPanels.push(panel)
    return panel
}


export function detachPanel(root: State, panel: Panel)
{
    if (!panel.floating)
    {
        panel.floating = true
        root.floatingPanels.push(panel)
    }
}


export function addWindow(root: State, toPanel: Panel, window: WindowId)
{
    toPanel.windowIds.push(window)
    toPanel.windowTitles.push("")
    toPanel.curWindowIndex = toPanel.windowIds.length - 1
}


export function removeWindow(root: State, fromPanel: Panel, window: WindowId)
{
    const windowIndex = fromPanel.windowIds.findIndex(w => w === window)
    if (windowIndex < 0)
        return
    
    fromPanel.windowIds.splice(windowIndex, 1)
    fromPanel.windowTitles.splice(windowIndex, 1)
    fromPanel.curWindowIndex = Math.max(0, Math.min(fromPanel.windowIds.length - 1, fromPanel.curWindowIndex))
}


export function coallesceEmptyPanels(root: State)
{
    coallesceEmptyPanelsRecursive(root, root.rootPanel)
    for (var i = 0; i < root.floatingPanels.length; i++)
        coallesceEmptyPanelsRecursive(root, root.floatingPanels[i])

    root.floatingPanels = root.floatingPanels.filter(p =>
        p.windowIds.length != 0 || p.splitPanels.length != 0)
}


export function coallesceEmptyPanelsRecursive(root: State, fromPanel: Panel)
{
    for (var i = 0; i < fromPanel.splitPanels.length; i++)
        coallesceEmptyPanelsRecursive(root, fromPanel.splitPanels[i])

    fromPanel.splitPanels = fromPanel.splitPanels.filter(p =>
        p.windowIds.length != 0 || p.splitPanels.length != 0)

    if (fromPanel.splitPanels.length == 1)
        Object.assign(fromPanel, fromPanel.splitPanels[0])
}


export function dock(root: State, panel: Panel, dockIntoPanel: Panel, mode: DockMode)
{
    if (mode == DockMode.Full ||
        (dockIntoPanel.windowIds.length == 0 && dockIntoPanel.splitPanels.length == 0))
    {
        if (dockIntoPanel.splitPanels.length > 0)
            throw "invalid full docking into subdivided panel"

        for (const window of panel.windowIds)
            addWindow(root, dockIntoPanel, window)

        detachPanel(root, panel)
        panel.windowIds = []
        panel.windowTitles = []
        root.floatingPanels = root.floatingPanels.filter(p => p !== panel)
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

        const newSubpanels = [panel]

        const newSubpanel = makePanel(root)
        newSubpanel.windowIds = dockIntoPanel.windowIds
        newSubpanel.windowTitles = dockIntoPanel.windowTitles
        newSubpanel.curWindowIndex = dockIntoPanel.curWindowIndex
        newSubpanel.splitMode = dockIntoPanel.splitMode
        newSubpanel.splitPanels = dockIntoPanel.splitPanels
        newSubpanel.splitSize = dockIntoPanel.splitSize

        dockIntoPanel.windowIds = []
        dockIntoPanel.windowTitles = []
        dockIntoPanel.splitPanels = newSubpanels
        dockIntoPanel.splitMode = subdivMode
        dockIntoPanel.splitSize = subdivOriginalFirst ? 0.75 : 0.25

        if (subdivOriginalFirst)
            newSubpanels.unshift(newSubpanel)
        else
            newSubpanels.push(newSubpanel)
            
        panel.floating = false
        dockIntoPanel.floating = false
        newSubpanel.floating = false
        root.floatingPanels = root.floatingPanels.filter(p => p !== panel && p !== newSubpanel)
    }
    else
    {
        throw "invalid docking"
    }
}


export function clampFloatingPanels(root: State, rect: Rect)
{
    const margin = 10

    for (const panel of root.floatingPanels)
    {
        panel.rect.x =
            Math.max(rect.x + margin,
            Math.min(rect.x2 - margin - panel.rect.w,
                panel.rect.x))

        panel.rect.y =
            Math.max(rect.y + margin,
            Math.min(rect.y2 - margin - panel.rect.h,
                panel.rect.y))
    }
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
    {
        layout.panelRects.push(
        {
            panel: floatingPanel,
            rect: floatingPanel.rect,
            floating: true,
        })

        layout.anchors.push({
            panel: floatingPanel,
            x: floatingPanel.rect.xCenter,
            y: floatingPanel.rect.yCenter,
            mode: DockMode.Full,
            previewRect: floatingPanel.rect,
        })
    }

    return layout
}


export function getContentRect(root: State, rect: Rect, windowId: WindowId): Rect | undefined
{
    const layout = getLayout(root, rect)
    return layout.panelRects.find(p => p.panel.windowIds.some(c => c === windowId))!.rect
}