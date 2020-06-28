import React from "react"
import Rect from "../util/rect"
import { useAppManager } from "../AppContext"
import { AppReducer } from "../AppState"


interface PopupProps
{
    rect: Rect
    popupElem: any
    popupProps: any
}


export default function Popup(props: PopupProps)
{
    const appManager = useAppManager()
    
    const dismiss = () =>
    {
        appManager.appState = AppReducer.removePopup(appManager.appState)
        appManager.dispatch()
    }

    return <div
        onContextMenu={ ev => ev.preventDefault() }
        onClick={ dismiss }
        style={{
            zIndex: 100000,
            position: "absolute",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",

            backgroundColor: "transparent",
    }}>
        <div style={{
            zIndex: 100001,
            position: "absolute",
            left: props.rect.x1,
            top: props.rect.y2,

            backgroundColor: "#111",
            border: "1px solid #888",

            textAlign: "left",

            display: "grid",
            gridTemplate: "auto / auto",
            gridAutoFlow: "row",
        }}>
            { React.createElement(props.popupElem, {
                ...props.popupProps
            }) }
        </div>
    </div>
}