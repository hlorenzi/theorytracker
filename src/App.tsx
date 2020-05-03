import React from "react"
import DockableRoot from "./dockable/DockableRoot"
import DockableData, { DockingMode, Root, Content } from "./dockable/DockableData"
import { EditorContent } from "./editor/EditorContent"
// @ts-ignore
import Project from "./project/project.js"
// @ts-ignore
import Editor from "./editor/editor.js"


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
                }
            },

            project: Project.getDefault(),
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
    dockableContents: {
        [id: number]: Content
    }

    project: any
}


export type AppDispatch = (action: any) => void


function reduce(state: AppState, action: any): AppState
{
    const shouldLog = true
        //action.type !== "dockableRootSet" &&
        //action.type !== "contentStateSet"
    
    if (shouldLog)
    {
        console.log("App.oldState", state)
        console.log("App.action", action)
    }
    
    switch (action.type)
    {
        case "init":
        {

        }

        case "dockableRootSet":
        {
            state = {
                ...state,
                dockableRoot: action.newRoot,
            }
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
            state = {
                ...state,
                dockableContents: {
                    ...state.dockableContents,
                    [action.contentId]: {
                        ...content,
                        state: reducer(content.state, action.action),
                    }
                }
            }
            break
        }

        default:
        {
            console.error("unhandled App.action", action)
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
            return Editor.reduce

        default:
            throw "invalid content type"
    }
}