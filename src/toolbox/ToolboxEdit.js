import React from "react"
import Ribbon from "./Ribbon.js"
import Editor from "../editor/editor.js"


export default function ToolboxEdit(props)
{
    return <Ribbon.Tab label="Edit">

        <Ribbon.Group label="History">
            <Ribbon.SlotButton tall
                icon="↩️"
                label="Undo"
                disabled={ !Editor.canUndo(props.state) }
                onClick={ () => props.dispatch({ type: "undo" })}
            />
            <Ribbon.SlotButton tall
                icon="↪️"
                label="Redo"
                disabled={ !Editor.canRedo(props.state) }
                onClick={ () => props.dispatch({ type: "redo" })}
            />
        </Ribbon.Group>

        <Ribbon.Group label="Clipboard">
            <Ribbon.SlotButton tall
                icon="📋"
                label="Paste"
                onClick={ () => props.dispatch({ type: "paste" })}
            />
            <Ribbon.SlotButton
                icon="📑"
                label="Copy"
                onClick={ () => props.dispatch({ type: "copy" })}
            />
            <Ribbon.SlotButton
                icon="✂️"
                label="Cut"
                onClick={ () => props.dispatch({ type: "cut" })}
            />
        </Ribbon.Group>

    </Ribbon.Tab>
}