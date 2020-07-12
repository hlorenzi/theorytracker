import React from "react"
import Rect from "../util/rect"
import { useAppManager } from "../AppContext"
import Project from "../project/project2"
import { AppReducer } from "../AppState"
import MenuFilePopup from "./MenuFilePopup"
import PlaybackToolbox from "./PlaybackToolbox"


interface MenuBarProps
{
}


interface MenuBarItemProps
{
    label: string
    popupElem: any
}


function MenuBarItem(props: MenuBarItemProps)
{
    const appManager = useAppManager()
    
    const refButton = React.useRef<HTMLButtonElement>(null)
    const onClick = () =>
    {
        const domRect = refButton.current!.getBoundingClientRect()
        const rect = new Rect(domRect.x, domRect.y, domRect.width, domRect.height)
        appManager.appState = AppReducer.createPopup(
            appManager.appState,
            rect,
            props.popupElem,
            {})
        appManager.dispatch()
    }

    const isOpen =
        appManager.appState.popup != null &&
        appManager.appState.popup.elem == props.popupElem

    return <button
        className="popupButton"
        ref={ refButton }
        onClick={ onClick }
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


export default function MenuBar(props: MenuBarProps)
{
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
            popupElem={ MenuFilePopup }
        />

        <PlaybackToolbox/>
        
    </div>
}