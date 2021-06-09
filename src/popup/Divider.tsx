import React from "react"
import * as Popup from "./index"
import Rect from "../util/rect"


export function Divider()
{
    const popupRootCtx = Popup.usePopupRoot()

    const index = popupRootCtx.itemIndex
    popupRootCtx.itemIndex++

    const [_, bugfixRefresh] = React.useState(0)
    React.useLayoutEffect(() =>
    {
        bugfixRefresh(1)
    }, [])

    return <>
        <div style={{
            borderBottom: "1px solid #fff",
            gridRow: index,
            gridColumn: "1 / 4",
            alignSelf: "center",
        }}/>
    </>
}