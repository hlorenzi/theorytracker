export interface Root
{
    idNext: number
    rootPanel: Panel
    //floatingPanels: FloatingPanel[]
}


export enum SubdivMode
{
    LeftRight,
    TopBottom,
}


export enum DockingMode
{
    Full,
    Left,
    Right,
    Top,
    Bottom,
}


export interface Panel
{
    id: number
    contentIds: number[]
    curContent: number
    subpanels: Panel[]
    subdivMode: SubdivMode
    subdivSize: number
}


export interface Rect
{
    x1: number
    x2: number
    y1: number
    y2: number
}


export interface PanelRect
{
    panel: Panel
    rect: Rect
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
    mode: DockingMode
    previewRect: Rect
}


export interface Layout
{
    panelRects: PanelRect[]
    dividers: Divider[]
    anchors: Anchor[]
}


export default class DockableData
{
    static makeRoot(): Root
    {
        return {
            idNext: 1,
            rootPanel: {
                id: 0,
                contentIds: [],
                curContent: 0,
                subpanels: [],
                subdivMode: SubdivMode.LeftRight,
                subdivSize: 0.5,
            }
        }
    }


    static clonePanel(panel: Panel): Panel
    {
        return {
            ...panel,
            subpanels: panel.subpanels.map(p => DockableData.clonePanel(p)),
        }
    }


    static findPanel(panel: Panel, wantedId: number): Panel | null
    {
        if (panel.id == wantedId)
            return panel
            
        for (const subpanel of panel.subpanels)
        {
            const found = DockableData.findPanel(subpanel, wantedId)
            if (found)
                return found
        }

        return null
    }


    static findPanelParent(panel: Panel, wantedId: number): Panel | null
    {
        for (const subpanel of panel.subpanels)
        {
            if (subpanel.id == wantedId)
                return panel

            const found = DockableData.findPanelParent(subpanel, wantedId)
            if (found)
                return found
        }

        return null
    }


    static changePanel(panel: Panel, wantedId: number, newPanel: Panel): Panel
    {
        if (panel.id == wantedId)
            return newPanel

        return {
            ...panel,
            subpanels: panel.subpanels.map(p => DockableData.changePanel(p, wantedId, newPanel))
        }
    }


    static modifyPanel(panel: Panel, wantedId: number, modifyFn: ((oldPanel: Panel) => Panel)): Panel
    {
        if (panel.id == wantedId)
            return modifyFn(panel)

        return {
            ...panel,
            subpanels: panel.subpanels.map(p => DockableData.modifyPanel(p, wantedId, modifyFn))
        }
    }


    static modifyPanelFromRoot(root: Root, wantedId: number, modifyFn: ((oldPanel: Panel) => Panel)): Root
    {
        return {
            ...root,
            rootPanel: DockableData.modifyPanel(root.rootPanel, wantedId, modifyFn),
        }
    }


    static addContent(root: Root, panelId: number, contentId: number): Root
    {
        return DockableData.modifyPanelFromRoot(root, panelId, (panel) =>
        {
            return {
                ...panel,
                contentIds: [...panel.contentIds, contentId]
            }
        })
    }


    static addPanel(root: Root, dockIntoId: number, mode: DockingMode, contentIds: number | number[]): Root
    {
        const contentIdsArray = Array.isArray(contentIds) ? contentIds : [contentIds]
        const dockIntoPanel = DockableData.findPanel(root.rootPanel, dockIntoId)!

        if (mode == DockingMode.Full ||
            (dockIntoPanel.contentIds.length == 0 && dockIntoPanel.subpanels.length == 0))
        {
            if (dockIntoPanel.subpanels.length > 0)
                throw "invalid full docking into subdivided panel"

            
            return DockableData.modifyPanelFromRoot(
                root,
                dockIntoId,
                (panel) =>
                {
                    const newContentIds = [...panel.contentIds, ...contentIdsArray]
                    return {
                        ...panel,
                        contentIds: newContentIds,
                        curContent: newContentIds.length - 1,
                    }
                })
        }
        else if (mode == DockingMode.Right ||
            mode == DockingMode.Left ||
            mode == DockingMode.Top ||
            mode == DockingMode.Bottom)
        {
            const subdivMode =
                (mode == DockingMode.Right || mode == DockingMode.Left) ?
                    SubdivMode.LeftRight :
                    SubdivMode.TopBottom

            const subdivOriginalFirst =
                (mode == DockingMode.Bottom || mode == DockingMode.Right)

            const newSubpanels = []
            if (subdivOriginalFirst)
                newSubpanels.push(dockIntoPanel)
                
            newSubpanels.push(
            {
                id: root.idNext,
                contentIds: contentIdsArray,
                curContent: 0,
                subpanels: [],
                subdivMode: SubdivMode.LeftRight,
                subdivSize: 0.5,
            })

            if (!subdivOriginalFirst)
                newSubpanels.push(dockIntoPanel)

            let newRootPanel = DockableData.changePanel(
                root.rootPanel,
                dockIntoId,
                {
                    id: root.idNext + 1,
                    contentIds: [],
                    curContent: 0,
                    subpanels: newSubpanels,
                    subdivMode,
                    subdivSize: subdivOriginalFirst ? 0.75 : 0.25,
                })

            return {
                ...root,
                idNext: root.idNext + 2,
                rootPanel: newRootPanel,
            }
        }

        throw "invalid docking"
    }


    static removePanel(root: Root, panelId: number): Root
    {
        let panelParent = DockableData.findPanelParent(root.rootPanel, panelId)

        if (!panelParent)
        {
            return {
                ...root,
                idNext: root.idNext + 1,
                rootPanel: {
                    id: root.idNext,
                    contentIds: [],
                    curContent: 0,
                    subpanels: [],
                    subdivMode: SubdivMode.LeftRight,
                    subdivSize: 0.5,
                }
            }
        }

        root = DockableData.modifyPanelFromRoot(root, panelParent.id, (panel) =>
        {
            const remainingPanel = panel.subpanels.find(p => p.id != panelId)!
            return remainingPanel
        })

        return root
    }


    static traverseLayout(panel: Panel, rect: Rect, layout: Layout)
    {
        const xMid = (rect.x1 + rect.x2) / 2
        const yMid = (rect.y1 + rect.y2) / 2

        if (panel.subpanels.length == 2)
        {
            if (panel.subdivMode == SubdivMode.LeftRight)
            {
                const xSplit = rect.x1 + (rect.x2 - rect.x1) * panel.subdivSize

                const rect1: Rect = { ...rect, x2: xSplit }
                const rect2: Rect = { ...rect, x1: xSplit }
                const rectDivider: Rect = { ...rect, x1: xSplit, x2: xSplit }

                DockableData.traverseLayout(panel.subpanels[0], rect1, layout)
                DockableData.traverseLayout(panel.subpanels[1], rect2, layout)
                
                layout.dividers.push({
                    panel,
                    vertical: false,
                    rect: rectDivider,
                    resizeMin: rect.x1,
                    resizeMax: rect.x2,
                })
            }
            else if (panel.subdivMode == SubdivMode.TopBottom)
            {
                const ySplit = rect.y1 + (rect.y2 - rect.y1) * panel.subdivSize

                const rect1: Rect = { ...rect, y2: ySplit }
                const rect2: Rect = { ...rect, y1: ySplit }
                const rectDivider: Rect = { ...rect, y1: ySplit, y2: ySplit }

                DockableData.traverseLayout(panel.subpanels[0], rect1, layout)
                DockableData.traverseLayout(panel.subpanels[1], rect2, layout)

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
            })

            layout.anchors.push({
                panel,
                x: xMid,
                y: yMid,
                mode: DockingMode.Full,
                previewRect: rect,
            })
        }

        layout.anchors.push({
            panel,
            x: rect.x2 - 1,
            y: yMid,
            mode: DockingMode.Right,
            previewRect: { ...rect, x1: rect.x1 + (rect.x2 - rect.x1) * 3 / 4 },
        })

        layout.anchors.push({
            panel,
            x: rect.x1 + 1,
            y: yMid,
            mode: DockingMode.Left,
            previewRect: { ...rect, x2: rect.x1 + (rect.x2 - rect.x1) / 4 },
        })

        layout.anchors.push({
            panel,
            x: xMid,
            y: rect.y2 - 1,
            mode: DockingMode.Bottom,
            previewRect: { ...rect, y1: rect.y1 + (rect.y2 - rect.y1) * 3 / 4 },
        })

        layout.anchors.push({
            panel,
            x: xMid,
            y: rect.y1 + 1,
            mode: DockingMode.Top,
            previewRect: { ...rect, y2: rect.y1 + (rect.y2 - rect.y1) / 4 },
        })
    }


    static getLayout(root: Root, rect: Rect): Layout
    {
        const layout: Layout =
        {
            panelRects: [],
            dividers: [],
            anchors: [],
        }

        DockableData.traverseLayout(root.rootPanel, rect, layout)

        return layout
    }
}