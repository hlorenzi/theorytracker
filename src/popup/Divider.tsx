import React from "react"
import { usePopupRoot } from "./popupContext"


export function Divider()
{
    const popupRootCtx = usePopupRoot()
    const index = popupRootCtx.itemIndex
    popupRootCtx.itemIndex++

    return <>
        <div style={{
            borderBottom: "1px solid #fff",
            gridRow: index,
            gridColumn: "1 / 4",
            alignSelf: "center",
        }}/>
    </>
}