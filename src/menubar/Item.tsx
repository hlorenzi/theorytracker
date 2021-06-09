import React from "react"
import * as Popup from "../popup"
import Rect from "../util/rect"


export interface ItemProps
{
    children: JSX.Element
    label: string
}


export function Item(props: ItemProps)
{
    const popupElemRef = React.useRef(() => props.children)
    
    const refButton = React.useRef<HTMLButtonElement>(null)
    const onClick = () =>
    {
        if (!props.children)
            return
        
        const domRect = refButton.current!.getBoundingClientRect()
        Popup.global.rect = new Rect(domRect.x, domRect.y, domRect.width, domRect.height)
        Popup.global.elem = popupElemRef.current
        Popup.notifyObservers()
    }

    const isOpen =
        !!props.children &&
        Popup.global.elem === popupElemRef.current

    return <button
        className="popupButton"
        ref={ refButton }
        onClick={ onClick }
        onMouseDown={ onClick }
        //onMouseEnter={ popupCtx.ref.current.elem ? onClick : undefined }
        style={{
            fontFamily: "inherit",
            padding: "0.5em 1em",
            border: 0,
            outline: "none",
            backgroundColor: isOpen ? "#048" : undefined,
    }}>
        { props.label }
    </button>
}