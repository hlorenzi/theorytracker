import React from "react"
import DockableRoot from "./dockable/DockableRoot"
import DockableData, { DockingMode, Root, Content } from "./dockable/DockableData"
import { EditorContent } from "./editor2/EditorContent"
import EditorState from "./editor2/editor"
import Project from "./project/project2"
import Immutable from "immutable"


export default function App(props: {})
{
    const appInit = (): AppState =>
    {
        let root = DockableData.makeRoot()
        console.log(root)
        
        root = DockableData.addPanel(root, 0, DockingMode.Full, 0)
        console.log(root)
        
        root = DockableData.addPanel(root, 0, DockingMode.Bottom, 2)
        console.log(root)
        
        root = DockableData.addPanel(root, 2, DockingMode.Right, 1)
        console.log(root)
        
        root = DockableData.addPanel(root, 1, DockingMode.Right, 3)
        console.log(root)

        root = DockableData.addPanel(root, 6, DockingMode.Bottom, 4)
        console.log(root)

        console.log(Project.getDefault())

        return {
            dockableRoot: root,
            dockableContents: {
                0: {
                    type: "editor",
                    state: null,
                },
                1: {
                    type: "editor",
                    state: null,
                },
            },

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

                    mouseEdgeScrollThreshold: 60,
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

    return <DockableRoot
        root={ appState.dockableRoot }
        setRoot={ setDockableRoot }
        contents={ appState.dockableContents }
        contentTypeToComponent={ contentTypeToComponent }
        appState={ appState }
        appDispatch={ appDispatch }
    />
}


export interface AppState
{
    dockableRoot: Root
    dockableContents:
    {
        [id: number]: Content
    }

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
        return this.appState.dockableContents[this.contentId].state
    }


    set contentState(newState: T)
    {
        this.appState = {
            ...this.appState,
            dockableContents: {
                ...this.appState.dockableContents,
                [this.contentId]: {
                    ...this.appState.dockableContents[this.contentId],
                    state: newState,
                }
            }
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


function reduce(state: AppState, action: any): AppState
{
    const shouldLog = 
        action.type !== "contentDispatch"
    
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

        case "contentStateSet":
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
        }

        case "contentDispatch":
        {
            const content = state.dockableContents[action.contentId]
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
        case "editor":
            return EditorContent

        default:
            throw "invalid content type"
    }
}


function contentTypeToReducer(type: string): any
{
    switch (type)
    {
        case "editor":
            return EditorState.reduce

        default:
            throw "invalid content type"
    }
}