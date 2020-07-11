import DockableData, * as Dock from "./dockable/DockableData"
import Project from "./project/project2"
import Immutable from "immutable"
import Rect from "./util/rect"
import Editor from "./editor2/editor"
import DockableRoot from "./dockable/DockableRoot"
import Rational from "./util/rational"
import { SflibMeta } from "./playback/library"


export interface AppState
{
    contentIdNext: number
    dockableRect: Rect
    dockableRoot: Dock.Root
    dockableContents: Immutable.Map<number, Dock.Content>

    project: Project
    selection: Immutable.Set<number>
    playback:
    {
        playing: boolean
        time: Rational
        timeAsFloat: number
        timeStart: Rational
    }

    sflib: SflibMeta

    popup: null |
    {
        rect: Rect
        elem: any
        props: any
    }
    
    prefs:
    {
        editor:
        {
            bkgColor: string
            trackVBorderColor: string
            trackHBorderColor: string
            
            selectionCursorColor: string
            selectionBkgColor: string
            playbackCursorColor: string
            trackSeparatorColor: string

            measureColor: string
            submeasureColor: string
            halfSubmeasureColor: string
            measureAlternateBkgColor: string

            octaveDividerColor: string
            noteRowAlternateBkgColor: string

            meterChangeColor: string
            keyChangeColor: string

            keyPan: string
            keyDraw: string
            keySelectMultiple: string
            keySelectRect: string

            mouseDragXLockedDistance: number
            mouseDragYLockedDistance: number

            mouseEdgeScrollThreshold: number
            mouseEdgeScrollSpeed: number
        }
    }
}


export class AppReducer
{
    static makeNew(): AppState
    {
        let root = DockableData.makeRoot()
        root = DockableData.addPanel(root, 1, Dock.DockingMode.Full, 1)

        return {
            contentIdNext: 2,
            dockableRect: new Rect(0, 0, 0, 0),
            dockableRoot: root,
            dockableContents: Immutable.Map<number, Dock.Content>()
                .set(1, {
                    type: "editor",
                    state: Editor.makeNewFull(),
                }),

            popup: null,

            project: Project.getDefault(),
            selection: Immutable.Set<number>(),
            playback: {
                playing: false,
                time: new Rational(0),
                timeAsFloat: 0,
                timeStart: new Rational(0),
            },

            sflib: {
                ready: false,
                collections: [],
            },

            prefs: {
                editor: {
                    bkgColor: "#000",//"#29242e",
                    trackVBorderColor: "#888",
                    trackHBorderColor: "#888",
                    
                    selectionCursorColor: "#0af",
                    selectionBkgColor: "#024",
                    playbackCursorColor: "#f00",
                    trackSeparatorColor: "#aaa",

                    measureColor: "#444",
                    submeasureColor: "#222",
                    halfSubmeasureColor: "#111",
                    measureAlternateBkgColor: "#fff1",

                    octaveDividerColor: "#444",
                    noteRowAlternateBkgColor: "#222",//"#19141e",

                    meterChangeColor: "#0cf",
                    keyChangeColor: "#f0c",

                    keyPan: " ",
                    keyDraw: "a",
                    keySelectMultiple: "control",
                    keySelectRect: "shift",

                    mouseDragXLockedDistance: 10,
                    mouseDragYLockedDistance: 10,

                    mouseEdgeScrollThreshold: 10,
                    mouseEdgeScrollSpeed: 1,
                },
            },
        }
    }


    static merge(state: AppState, newState: Partial<AppState>): AppState
    {
        return {
            ...state,
            ...newState,
        }
    }
    
    
    static getContent(state: AppState, contentId: number): any
    {
        return state.dockableContents.get(contentId)!.state
    }


    static setContent(state: AppState, contentId: number, newState: any): AppState
    {
        return {
            ...state,
            dockableContents: state.dockableContents.set(contentId,
            {
                ...state.dockableContents.get(contentId)!,
                state: newState,
            }),
        }
    }


    static mergeContent(state: AppState, contentId: number, newState: any): AppState
    {
        return AppReducer.setContent(state, contentId, {
            ...AppReducer.getContent(state, contentId),
            ...newState,
        })
    }


    static createTab(appState: AppState, nextToContentId: number, type: string, state: any): AppState
    {
        const panel = DockableData.findPanelWithContent(appState.dockableRoot.rootPanel, nextToContentId)
        if (!panel)
            return appState

        return {
            ...appState,
            contentIdNext: appState.contentIdNext + 1,
            dockableRoot: DockableData.addPanel(
                appState.dockableRoot,
                panel.id,
                Dock.DockingMode.Full,
                appState.contentIdNext),
            dockableContents: appState.dockableContents.set(appState.contentIdNext,
            {
                type,
                state,
            }),
        }
    }


    static createOrUpdateTab(appState: AppState, nextToContentId: number, type: string, state: any): AppState
    {
        const updatablePanel = DockableData.findPanelWithType(appState.dockableRoot.rootPanel, type, appState.dockableContents)
        if (updatablePanel)
        {
            const contentId = updatablePanel.contentIds.find(c => appState.dockableContents.get(c)!.type == type)!
            const contentIndex = updatablePanel.contentIds.findIndex(c => c == contentId)

            return {
                ...appState,
                dockableRoot: DockableData.modifyPanelFromRoot(
                    appState.dockableRoot, updatablePanel.id, (oldPanel) =>
                    {
                        return { ...oldPanel,
                            curContent: contentIndex,
                        }
                    }),
                dockableContents: appState.dockableContents.set(contentId,
                {
                    type,
                    state,
                })
            }
        }

        const panel = DockableData.findPanelWithContent(appState.dockableRoot.rootPanel, nextToContentId)
        if (!panel)
            return appState

        return {
            ...appState,
            contentIdNext: appState.contentIdNext + 1,
            dockableRoot: DockableData.addPanel(
                appState.dockableRoot,
                panel.id,
                Dock.DockingMode.Full,
                appState.contentIdNext),
            dockableContents: appState.dockableContents.set(appState.contentIdNext,
            {
                type,
                state,
            }),
        }
    }


    static createFloating(appState: AppState, type: string, state: any, rect: Rect): AppState
    {
        return {
            ...appState,
            contentIdNext: appState.contentIdNext + 1,
            dockableRoot: DockableData.addFloatingPanel(
                appState.dockableRoot,
                rect,
                appState.contentIdNext),
            dockableContents: appState.dockableContents.set(appState.contentIdNext,
            {
                type,
                state,
            }),
        }
    }


    static removeFloating(appState: AppState, type: string): AppState
    {
        let root = appState.dockableRoot
        for (const [key, value] of appState.dockableContents)
        {
            if (value.type === type)
                root = DockableData.removeFloatingContent(root, key)
        }

        return {
            ...appState,
            contentIdNext: appState.contentIdNext + 1,
            dockableRoot: root,
        }
    }


    static createPopup(appState: AppState, rect: Rect, elem: any, props: any): AppState
    {
        return {
            ...appState,
            popup: {
                rect,
                elem,
                props,
            }
        }
    }


    static removePopup(appState: AppState): AppState
    {
        return {
            ...appState,
            popup: null,
        }
    }
}


export class AppManager
{
    getAppStateFn: () => AppState
    setAppStateFn: (newState: AppState) => void
    dispatchFn: (state: AppState) => void


    constructor(
        getAppState: () => AppState,
        setAppState: (newState: AppState) => void,
        dispatch: (state: AppState) => void)
    {
        this.getAppStateFn = getAppState
        this.setAppStateFn = setAppState
        this.dispatchFn = dispatch
    }


    get appState(): AppState
    {
        return this.getAppStateFn()
    }


    set appState(newState: AppState)
    {
        this.setAppStateFn(newState)
    }


    dispatch()
    {
        this.dispatchFn(this.appState)
    }


    mergeAppState(newState: Partial<AppState>)
    {
        this.appState = {
            ...this.appState,
            ...newState,
        }
    }


    makeContentManager<T>(contentId: number)
    {
        return new ContentManager<T>(this, contentId)
    }
}


export class ContentManager<T>
{
    appManager: AppManager
    contentId: number


    constructor(appManager: AppManager, contentId: number)
    {
        this.appManager = appManager
        this.contentId = contentId
    }


    get appState(): AppState
    {
        return this.appManager.appState
    }


    set appState(newState: AppState)
    {
        this.appManager.appState = newState
    }


    dispatch()
    {
        this.appManager.dispatch()
    }


    mergeAppState(newState: Partial<AppState>)
    {
        this.appManager.appState = {
            ...this.appManager.appState,
            ...newState,
        }
    }


    get contentState(): T
    {
        return this.appManager.appState.dockableContents.get(this.contentId)!.state
    }


    set contentState(newState: T)
    {
        this.appManager.appState = {
            ...this.appManager.appState,
            dockableContents: this.appManager.appState.dockableContents.set(this.contentId,
            {
                ...this.appManager.appState.dockableContents.get(this.contentId)!,
                state: newState,
            }),
        }
    }


    mergeContentState(newState: Partial<T>)
    {
        this.contentState = {
            ...this.contentState,
            ...newState,
        }
    }
}