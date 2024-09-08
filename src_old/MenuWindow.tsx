import React from "react"
import * as Project from "./project"
import * as Menubar from "./menubar"
import * as Popup from "./popup"
import * as Dockable from "./dockable"
import * as Windows from "./windows"
import Rect from "./util/rect"


export default function MenuWindow()
{
    const onOpenWindow = (elem: Dockable.WindowElement, data: any) =>
    {
        Dockable.createFloating(elem, data)
    }


    return <>
        <Menubar.Item label="Window">
            <Popup.Root>
                <Popup.Button
                    label="Timeline"
                    onClick={ () => onOpenWindow(Windows.Timeline, null) }
                />
            </Popup.Root>
        </Menubar.Item>
    </>
}