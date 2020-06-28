import React from "react"
import PopupButton from "../popup/PopupButton"
import Rect from "../util/rect"
import { useAppManager } from "../AppContext"
import Project from "../project/project2"


interface MenuFilePopupProps
{
}


export default function MenuFilePopup(props: MenuFilePopupProps)
{
    const appManager = useAppManager()
    
    const doNew = () =>
    {
        appManager.mergeAppState({ project: Project.getDefault() })
        appManager.dispatch()
    }

    return <>
        <PopupButton
            text="New"
            onClick={ doNew }
        />
        <PopupButton
            text="Open..."
        />
    </>
}