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
            icon="📄"
            label="New"
            onClick={ doNew }
        />
        <PopupButton
            icon="📂"
            label="Open..."
        />
        <PopupButton
            label="Open Recent"
        >
            <PopupButton label="Test!"/>
            <PopupButton label="Test!"/>
            <PopupButton label="Test!"/>
            <PopupButton label="Test!"/>
        </PopupButton>
    </>
}