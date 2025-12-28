import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Inspector from "./index.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import Rect from "../utils/rect.ts"
import Rational from "../utils/rational.ts"
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

    const firstElemId = Solid.createMemo(() => {
        if (selectedIds().count() !== 1)
            return undefined

        const project = Global.get().project

        let firstElem = null
        for (const id of selectedIds())
        {
            firstElem = Project.getElem(project.root, id)
            if (firstElem)
                break
        }

        return firstElem?.id
    })

    const project = Global.get().project

    const inspectorKind = Solid.createMemo(() => {
        const upsertElem = (elem: Project.Element) => {
            console.log(elem)
            project.root = Project.upsertElement(project.root, elem)
            Global.refresh()
        }

        const elemId = firstElemId()
        const elem = Project.getElem(project.root, elemId)
        const key = Project.keyAt(project.root, project.root.keyChangeTrackId, elem?.range.start ?? new Rational(0))

        if (elem?.type === "tempoChange")
            return <Inspector.InspectorTempoChange
                value={ elem }
                upsertElem={ upsertElem }
            />
        
        if (elem?.type === "keyChange")
            return <Inspector.InspectorKeyChange
                value={ elem }
                upsertElem={ upsertElem }
            />
        
        if (elem?.type === "meterChange")
            return <Inspector.InspectorMeterChange
                value={ elem }
                upsertElem={ upsertElem }
            />
        
        if (elem?.type === "chord")
            return <Inspector.InspectorChord
                key={ key }
                value={ elem }
                upsertElem={ upsertElem }
            />
        
        return <Inspector.InspectorInsert/>
    })

    return <Layout>
        <Inspector.TrackList
            style={{
                "grid-row": "1 / -1",
        }}/>

        <div>{ `${selectedIds().count()} selected` }</div>

        { inspectorKind() }
    </Layout>
}


const Layout = styled.div`
    display: grid;
    grid-template: auto auto 1fr / auto auto;
    contain: size;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 0.5em;
    justify-content: start;
    justify-items: start;
    align-content: start;
    align-items: start;
    column-gap: 1em;
`