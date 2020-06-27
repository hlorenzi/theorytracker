import React from "react"
import PopupContext from "./PopupContext"
import Rect from "../util/rect"


interface MenuBarProps
{
}


interface MenuBarItemProps
{
    label: string
}


function MenuBarItem(props: MenuBarItemProps)
{
    const ctx = React.useContext(PopupContext)!
    const refButton = React.useRef<HTMLButtonElement>(null)
    const onClick = () =>
    {
        const domRect = refButton.current!.getBoundingClientRect()
        const rect = new Rect(domRect.x, domRect.y, domRect.width, domRect.height)
    }

    return <button
        className="popupButton"
        ref={ refButton }
        onClick={ onClick }
        style={{
            fontFamily: "inherit",
            padding: "0.5em 1em",
            border: 0,
            outline: "none",
    }}>
        { props.label }
    </button>
}


export default function Popup(props: MenuBarProps)
{
    const ctx = React.useContext(PopupContext)!


    return <div
        style={{
            backgroundColor: "#111",
            borderBottom: "1px solid #888",
            display: "grid",
            gridTemplate: "1fr / auto",
            gridAutoFlow: "column",
            justifyContent: "start",
    }}>

        <MenuBarItem
            label="File"
        />
        
    </div>
}