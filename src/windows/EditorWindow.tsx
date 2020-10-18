import React from "react"
import * as Dockable from "../dockable"
import * as Editor from "../editor"


export default function EditorWindow()
{
    return <div style={{
        padding: "0.5em",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
    }}>
        Editor
        <br/>
        <Editor.EditorElement/>
    </div>
}