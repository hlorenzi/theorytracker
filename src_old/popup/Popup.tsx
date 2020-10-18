import React from "react"
import Rect from "../util/rect"
import { PopupContext } from "./PopupContext"
import { useAppManager } from "../AppContext"
import { AppReducer } from "../AppState"


interface PopupProps
{
    rect: Rect
    isSub: boolean
    popupElem?: any
    popupProps?: any
    children?: any
}


export default function Popup(props: PopupProps)
{
    const appManager = useAppManager()
    const [subOpen, setSubOpen] = React.useState<any>(null)
    
    const dismiss = () =>
    {
        appManager.appState = AppReducer.removePopup(appManager.appState)
        appManager.dispatch()
    }

    return <PopupContext.Provider value={{
        curSubPopup: subOpen,
        openSubPopup: setSubOpen,
        itemIndex: 1,
    }}>
        <div
            onContextMenu={ ev => ev.preventDefault() }
            onClick={ props.isSub ? undefined : dismiss }
            style={{
                zIndex: 100000,
                position: "fixed",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100vh",

                backgroundColor: "transparent",
                pointerEvents: props.isSub ? "none" : undefined,
        }}>
            <div style={{
                zIndex: 100001,
                position: "absolute",
                left: props.isSub ? props.rect.x2 : props.rect.x1,
                top: props.isSub ? props.rect.y1 :props.rect.y2,

                backgroundColor: "#111",
                border: "1px solid #888",

                textAlign: "left",

                display: "grid",
                gridTemplate: "auto / auto auto auto",
                gridAutoFlow: "row",
                pointerEvents: "auto",
            }}>
                { props.isSub ? props.children : React.createElement(props.popupElem, {
                    ...props.popupProps
                }) }
            </div>
        </div>
    </PopupContext.Provider>
}