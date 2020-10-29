import React from "react"
import * as Editor from "./index"
import * as Popup from "../popup"
import Rect from "../util/rect"


export function mouseUp(data: Editor.EditorUpdateData)
{
    if (!data.state.mouse.down)
        return

    data.state.mouse.down = false

    if (data.state.hover &&
        data.state.mouse.action == Editor.EditorAction.Pan &&
        data.state.drag.xLocked && data.state.drag.yLocked)
    {
        Editor.selectionToggleHover(data, data.state.hover, false)

        const elems: JSX.Element[] = []
        const trackCtxMenu = data.state.tracks[data.state.mouse.point.trackIndex].contextMenu(data)
        if (trackCtxMenu)
        {
            elems.push(trackCtxMenu)
            elems.push(<Popup.Divider/>)
        }

        elems.push(
            <>
            <Popup.Button label="Insert track after">
                <Popup.Button label="Note track"/>
                <Popup.Button label="Chord track"/>
                <Popup.Button label="Key Change track"/>
                <Popup.Button label="Meter Change track"/>
            </Popup.Button>
            <Popup.Button label="Delete"/>
            </>
        )

        data.popup.ref.current.elem = () =>
        {
            return <Popup.Root>
                { elems }
            </Popup.Root>
        }
        data.popup.ref.current.rect = new Rect(
            data.state.renderRect.x + data.state.mouse.point.pos.x + 2,
            data.state.renderRect.y + data.state.mouse.point.pos.y + 2,
            0, 0)
        data.popup.commit()
    }
}