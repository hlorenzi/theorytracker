import React from "react"
import Rect from "../util/rect"
import * as Popup from "../popup"


export interface ItemProps
{
    children: JSX.Element
    label: string
}


export function Item(props: ItemProps)
{
    const popupCtx = Popup.usePopup()
    const popupElemRef = React.useRef(() => props.children)
    
    const refButton = React.useRef<HTMLButtonElement>(null)
    const onClick = () =>
    {
        if (!props.children)
            return
        
        const domRect = refButton.current!.getBoundingClientRect()
        popupCtx.ref.current.rect = new Rect(domRect.x, domRect.y, domRect.width, domRect.height)
        popupCtx.ref.current.elem = popupElemRef.current
        popupCtx.commit()
    }

    const isOpen =
        !!props.children &&
        popupCtx.ref.current.elem == popupElemRef.current

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