import React from "react"
import DockableRoot from "./dockable/DockableRoot"
import DockableData, { DockingMode, Root, Content } from "./dockable/DockableData"
import { EditorContent } from "./editor2/EditorContent"
import { AppState, AppReducer, ContentManager, AppManager } from "./AppState"
import { AppContext } from "./AppContext"
import EditorState from "./editor2/editor"
import Project from "./project/project2"
import Immutable from "immutable"
import Rect from "./util/rect"
import MenuBar from "./popup/MenuBar"
import Popup from "./popup/Popup"
import InspectorContent from "./editor2/InspectorContent"


const initialAppState = AppReducer.makeNew()


export default function App(props: {})
{
    const rootRef = React.useRef<HTMLDivElement>(null)

    const [, setDummy] = React.useState(0)
    const appStateRef = React.useRef<AppState>(initialAppState)
    const appDispatch = React.useCallback((newState: AppState) =>
    {
        //console.log(newState)
        appStateRef.current = newState
        setDummy(dummy => dummy + 1)

    }, [])

    const setDockableRoot = (newRoot: Root) => appDispatch({
        ...appStateRef.current,
        dockableRoot: newRoot,
    })

    const appManager = new AppManager(
        () => appStateRef.current,
        (newState) => appStateRef.current = newState,
        (newState) => appDispatch(newState))

    React.useEffect(() =>
    {
        if (!rootRef.current)
            return
            
        const onResize = () =>
        {
            const elemRect = rootRef.current!.getBoundingClientRect()

            appDispatch({
                ...appStateRef.current,
                dockableRect: new Rect(
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


    return <AppContext.Provider value={{ appManager }}>
        <div style={{
            position: "absolute",
            top: "0px",
            left: "0px",
            width: "100vw",
            height: "100vh",
            display: "grid",
            gridTemplate: "auto 1fr / 1fr",
        }}>
            <MenuBar/>

            <div ref={ rootRef } style={{
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: -1000,
            }}/>
            
            <DockableRoot
                root={ appStateRef.current.dockableRoot }
                rect={ appStateRef.current.dockableRect }
                setRoot={ setDockableRoot }
                contents={ appStateRef.current.dockableContents }
                contentTypeToComponent={ contentTypeToComponent }
                contentTypeToTitle={ contentTypeToTitle }
            />

            { !appStateRef.current.popup ? null :
                <Popup
                    rect={ appStateRef.current.popup.rect }
                    popupElem={ appStateRef.current.popup.elem }
                    popupProps={ appStateRef.current.popup.props }
                />
            }
        </div>
    </AppContext.Provider>
}


function contentTypeToComponent(type: string): any
{
    switch (type)
    {
        case "editor": return EditorContent
        case "inspector": return InspectorContent

        default:
            throw "invalid content type"
    }
}


function contentTypeToTitle(type: string): any
{
    switch (type)
    {
        case "editor": return "Editor"
        case "inspector": return "Inspector"

        default:
            throw "invalid content type"
    }
}