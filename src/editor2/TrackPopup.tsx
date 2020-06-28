import React from "react"
import PopupButton from "../popup/PopupButton"
import Rect from "../util/rect"


interface TrackPopupProps
{
}


export default function TrackPopup(props: TrackPopupProps)
{
    return <>
        <PopupButton
            text="Insert track before"
        />
        <PopupButton
            text="Insert track after"
        />
    </>
}