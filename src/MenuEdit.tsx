import React from "react"
import * as Command from "./command"
import * as Menubar from "./menubar"
import * as Popup from "./popup"


export default function MenuEdit()
{
    return <>
        <Menubar.Item label="Edit">
            <Popup.Root>
                <Popup.Button command={ Command.undo }/>
                <Popup.Button command={ Command.redo }/>
            </Popup.Root>
        </Menubar.Item>
    </>
}