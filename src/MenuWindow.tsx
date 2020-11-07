import React from "react"
import * as Project from "./project"
import * as Menubar from "./menubar"
import * as Popup from "./popup"
import * as Dockable from "./dockable"
import * as Windows from "./windows"
import Rect from "./util/rect"


export default function MenuWindow()
{
    const dockable = Dockable.useDockable()


    const onOpenWindow = (elem: any, data: any) =>
    {
        dockable.ref.current.createFloating(
            elem, data,
            new Rect(
                100, 100,
                1, 1))
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