import React from "react"
import { AppState, AppDispatch } from "./App"
import Rect from "./util/rect"
import Project from "./project/project2"


interface PopupProps
{
	appState: AppState
    appDispatch: AppDispatch
    rect: Rect
    popupElem: any
    popupProps: any
}


export default function Popup(props: PopupProps)
{
    return <div style={{
        zIndex: 100000,
        position: "absolute",
        left: props.rect.x2 + 4,
        top: props.rect.y2 + 4,

        backgroundColor: "#111",
        border: "1px solid #ccc",
        padding: "0.5em",

        textAlign: "left",
    }}>
		{ React.createElement(props.popupElem, {
            appState: props.appState,
            appDispatch: props.appDispatch,
            ...props.popupProps
        }) }
    </div>
}