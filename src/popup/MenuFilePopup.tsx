import React from "react"
import PopupButton from "../popup/PopupButton"
import { ContentStateManager } from "../App"
import Rect from "../util/rect"


interface MenuFilePopupProps
{
	state: ContentStateManager<void>
}


export default function MenuFilePopup(props: MenuFilePopupProps)
{
    return <>
        <PopupButton
            text="New"
        />
        <PopupButton
            text="Open..."
        />
    </>
}