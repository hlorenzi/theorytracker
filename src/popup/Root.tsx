import React from "react"
import * as Popup from "./index"
import Rect from "../util/rect"


interface PopupRootProps
{
    rect?: Rect
    isSub?: boolean
    popupElem?: any
    popupProps?: any
    children?: any
}


export function Root(props: PopupRootProps)
{
    const rect = props.rect ?? Popup.global.rect
    const [subOpen, setSubOpen] = React.useState<HTMLButtonElement | null>(null)
    
    const dismiss = (ev: any) =>
    {
        Popup.global.elem = null
        Popup.notifyObservers()
    }

    React.useEffect(() =>
    {
        const onClickVoid = (ev: MouseEvent) =>
        {
            dismiss(ev)
        }

        window.addEventListener("mousedown", onClickVoid)
        return () =>
        {
            window.removeEventListener("mousedown", onClickVoid)
        }
    })

    return <Popup.PopupRootContext.Provider value={{
        curSubPopup: subOpen,
        openSubPopup: setSubOpen,
        itemIndex: 1,
    }}>
        <div
            onMouseDown={ ev => ev.stopPropagation() }
            style={{
                zIndex: 100001,
                position: "absolute",
                left: props.isSub ? rect.x2 : rect.x1,
                top: props.isSub ? rect.y1 : rect.y2,

                width: "fit-content",

                backgroundColor: "#2f3136",
                border: "1px solid #fff",
                borderRadius: "0.5em",
                //overflow: "hidden",
                boxShadow: "0 0.5em 0.5em 0.5em #0004",

                textAlign: "left",

                display: "grid",
                gridTemplate: "auto / auto auto auto",
                gridAutoFlow: "row",
                pointerEvents: "auto",
        }}>
            { props.children }
        </div>
    </Popup.PopupRootContext.Provider>
}