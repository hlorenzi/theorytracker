import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Inspector from "./index.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import Rect from "../utils/rect.ts"
import { styled } from "solid-styled-components"


export function InspectorRoot(props: {})
{
    const selectedIdsRaw = Solid.createMemo(() => {
        const timeline = Global.get().timeline
        return timeline.selection
    })

    const selectedIds = Solid.createMemo(() => {
        const ids = selectedIdsRaw()
        return ids
    })

    const firstElem = Solid.createMemo(() => {
        if (selectedIds().count() !== 1)
            return null

        const project = Global.get().project

        let firstElem = null
        for (const id of selectedIds())
        {
            firstElem = Project.getElem(project.root, id)
            if (firstElem)
                break
        }

        return firstElem
    })

    const inspectorKind = Solid.createMemo(() => {
        const setValue = (elem: Project.Element) => {
            const project = Global.get().project
            project.root = Project.upsertElement(project.root, elem)
            Global.refresh()
        }

        const elem = firstElem()

        if (elem?.type === "keyChange")
            return <Inspector.InspectorKeyChange
                value={ elem }
                setValue={ setValue }
            />
        
        return <Inspector.InspectorInsert/>
    })

    return <div style={{
        width: "100%",
        height: "100%",
        display: "grid",
        "grid-template": "auto 1fr / 1fr",
        contain: "size",
        "box-sizing": "border-box",
        padding: "0.5em",
    }}>
        <div>{ `${selectedIds().count()} selected` }</div>

        { inspectorKind() }
    </div>
}