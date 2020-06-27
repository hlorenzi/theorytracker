import React from "react"
import PopupContext from "./PopupContext"
import Rect from "../util/rect"


interface PopupProps
{
    rect: Rect
    popupElem: any
    popupProps: any
}


export default function Popup(props: PopupProps)
{
    const ctx = React.useContext(PopupContext)!


    return <div
        onClick={ () => ctx.appDispatch({ type: "appRemovePopup" })}
        onContextMenu={ ev => ev.preventDefault() }
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
            left: props.rect.x2 + 4,
            top: props.rect.y2 + 4,

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