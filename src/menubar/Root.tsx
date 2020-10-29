import React from "react"
import Rect from "../util/rect"
import * as Popup from "../popup"


export function Root(props: any)
{
    return <div
        style={{
            backgroundColor: "#202225",
            display: "grid",
            gridTemplate: "1fr / auto",
            gridAutoFlow: "column",
            justifyContent: "start",
    }}>

        { props.children }
        
    </div>
}