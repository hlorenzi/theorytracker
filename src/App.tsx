import React from "react"
import DockableRoot from "./dockable/DockableRoot"
import DockableData, { DockingMode, Root, Content } from "./dockable/DockableData"
import { EditorContent } from "./editor2/EditorContent"
import EditorState from "./editor2/editor"
import Project from "./project/project2"
import Immutable from "immutable"
import Rect from "./util/rect"
import Popup from "./Popup"
import PopupKeyChange from "./editor2/PopupKeyChange"


export default function App(props: {})
{
    const rootRef = React.useRef<HTMLDivElement>(null)

    
    const appInit = (): AppState =>
    {
        let root = DockableData.makeRoot()
        console.log(root)
        
        root = DockableData.addPanel(root, 0, DockingMode.Full, 0)
        console.log(root)
        
        /*root = DockableData.addPanel(root, 0, DockingMode.Bottom, 2)
        console.log(root)
        
        root = DockableData.addPanel(root, 2, DockingMode.Right, 1)
        console.log(root)
        
        root = DockableData.addPanel(root, 1, DockingMode.Right, 3)
        console.log(root)

        root = DockableData.addPanel(root, 6, DockingMode.Bottom, 4)
        console.log(root)*/

        return {
            contentIdNext: 6,
            dockableRect: new Rect(0, 0, 0, 0),
            dockableRoot: root,
            dockableContents: Immutable.Map<number, Content>()
                .set(0, {
                    type: "editor",
                    state: null,
                })
                .set(1, {
                    type: "editor",
                    state: null,
                }),

            project: Project.getDefault(),
            selection: Immutable.Set<number>(),

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

    const [appState, appDispatch] = React.useReducer(reduce, null, appInit)

    const setDockableRoot = (newRoot: Root) => appDispatch({
        type: "dockableRootSet",
        newRoot,
    })

    React.useEffect(() =>
    {
        if (!rootRef.current)
            return
            
        const onResize = () =>
        {
            const elemRect = rootRef.current!.getBoundingClientRect()

            appDispatch({
                type: "appResize",
                rect: new Rect(
                    elemRect.x,
                    elemRect.y,
                    elemRect.width,
                    elemRect.height),
            })
        }

        onResize()
        
        window.addEventListener("resize", onResize)

        return () =>
        {
            window.removeEventListener("resize", onResize)
        }

    }, [rootRef.current])


    return <>
        <div ref={ rootRef } style={{
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "100vw",
            height: "100vh",
            pointerEvents: "none",
        }}/>
        
        <DockableRoot
            root={ appState.dockableRoot }
            rect={ appState.dockableRect }
            setRoot={ setDockableRoot }
            contents={ appState.dockableContents }
            contentTypeToComponent={ contentTypeToComponent }
            contentTypeToTitle={ contentTypeToTitle }
            appState={ appState }
            appDispatch={ appDispatch }
        />
    </>
}


export interface AppState
{
    contentIdNext: number
    dockableRect: Rect
    dockableRoot: Root
    dockableContents: Immutable.Map<number, Content>

    project: Project
    selection: Immutable.Set<number>
    prefs: AppPreferences
}


export type AppDispatch = (action: any) => void


export interface AppPreferences
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


export class ContentStateManager<T>
{
    appState: AppState
    contentId: number


    constructor(appState: AppState, contentId: number)
    {
        this.appState = appState
        this.contentId = contentId
    }


    mergeAppState(newState: Partial<AppState>)
    {
        this.appState = {
            ...this.appState,
            ...newState,
        }
    }


    get contentState(): T
    {
        return this.appState.dockableContents.get(this.contentId)!.state
    }


    set contentState(newState: T)
    {
        this.appState = {
            ...this.appState,
            dockableContents: this.appState.dockableContents.set(this.contentId,
            {
                ...this.appState.dockableContents.get(this.contentId)!,
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


    createPopup(type: string, state: any, rect: Rect)
    {
        this.appState = {
            ...this.appState,
            contentIdNext: this.appState.contentIdNext + 1,
            dockableRoot: DockableData.addFloatingPanel(
                this.appState.dockableRoot,
                rect,
                this.appState.contentIdNext),
            dockableContents: this.appState.dockableContents.set(this.appState.contentIdNext,
            {
                type,
                state,
            }),
        }
    }


    removePopup(type: string)
    {
        let root = this.appState.dockableRoot
        for (const [key, value] of this.appState.dockableContents)
        {
            if (value.type === type)
                root = DockableData.removeFloatingContent(root, key)
        }

        this.appState = {
            ...this.appState,
            contentIdNext: this.appState.contentIdNext + 1,
            dockableRoot: root,
        }
    }
}


function reduce(state: AppState, action: any): AppState
{
    const shouldLog = 
        action.type !== "contentDispatch" &&
        action.type !== "dockableRootSet"
    
    if (shouldLog)
    {
        console.log("App.oldState", state)
        console.log("App.action", action)
    }
    
    switch (action.type)
    {
        case "dockableRootSet":
        {
            state = {
                ...state,
                dockableRoot: action.newRoot,
            }
            break
        }


        case "appStateSet":
        {
            state = action.newState
            break
        }


        case "appResize":
        {
            state = {
                ...state,
                dockableRect: action.rect,
            }
            break
        }


        /*case "contentStateSet":
        {
            state = {
                ...state,
                dockableContents: {
                    ...state.dockableContents,
                    [action.contentId]: {
                        ...state.dockableContents[action.contentId],
                        state: action.newState,
                    }
                }
            }
            break
        }*/

        case "contentDispatch":
        {
            const content = state.dockableContents.get(action.contentId)!
            const reducer = contentTypeToReducer(content.type)

            const stateManager = new ContentStateManager(state, action.contentId)
            reducer(stateManager, action.action)
            state = stateManager.appState
            break
        }

        default:
        {
            console.error("unhandled App.action", action)
            console.log("")
        }
    }

    if (shouldLog)
    {
        console.log("App.newState", state)
        console.log("")
    }

    return state
}


function contentTypeToComponent(type: string): any
{
    switch (type)
    {
        case "editor": return EditorContent
        case "inspector": return PopupKeyChange

        default:
            throw "invalid content type"
    }
}


function contentTypeToReducer(type: string): any
{
    switch (type)
    {
        case "editor": return EditorState.reduce
        case "inspector": return null

        default:
            throw "invalid content type"
    }
}


function contentTypeToTitle(type: string, state: ContentStateManager<any>): any
{
    switch (type)
    {
        case "editor": return "Editor"
        case "inspector": return "Inspector"

        default:
            throw "invalid content type"
    }
}