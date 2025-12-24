import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Inspector from "./index.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import Rect from "../utils/rect.ts"
import { styled } from "solid-styled-components"


export function InspectorInsert(props: {
})
{
    const time = Solid.createMemo(() => {
        const timeline = Global.get().timeline
        return timeline.cursor.time1
    })

    const key = Solid.createMemo(() => {
        const project = Global.get().project
        return Project.keyAt(project.root, project.root.noteTrackId, time())
    })

    const insertKeyChange = () => {
        const project = Global.get().project
        const timeline = Global.get().timeline
        const time = timeline.cursor.time1
        const id = project.root.nextId
        const key = Theory.Key.parse("C Major")
        const keyCh = Project.makeKeyChange(project.root.keyChangeTrackId, time, key)
        project.root = Project.upsertElement(project.root, keyCh)
        Timeline.selectionClear(timeline)
        Timeline.selectionAdd(timeline, id)
        Timeline.selectionResolveOverlappingAndDegenerate(timeline, project)
        timeline.cursor.visible = false
        Global.refresh()
    }

    const insertMeterChange = () => {
        const project = Global.get().project
        const timeline = Global.get().timeline
        const time = timeline.cursor.time1
        const id = project.root.nextId
        const meter = Theory.Meter.parse("4 / 4")
        const meterCh = Project.makeMeterChange(project.root.meterChangeTrackId, time, meter)
        project.root = Project.upsertElement(project.root, meterCh)
        Timeline.selectionClear(timeline)
        Timeline.selectionAdd(timeline, id)
        Timeline.selectionResolveOverlappingAndDegenerate(timeline, project)
        timeline.cursor.visible = false
        Global.refresh()
    }

    const insertChord = (chord: Theory.Chord) => {
        const project = Global.get().project
        const timeline = Global.get().timeline
        const time = timeline.cursor.time1
        const id = project.root.nextId
        const trackId = project.root.chordTrackId
        Timeline.insertChord(timeline, project, trackId, time, chord)
        Timeline.selectionClear(timeline)
        Timeline.selectionAdd(timeline, id)
        Timeline.selectionResolveOverlappingAndDegenerate(timeline, project)
        Timeline.selectionClear(timeline)
        timeline.cursor.visible = true
        Global.refresh()
    }

    return <Layout>
        <button onClick={ insertKeyChange }>
            + Key Change
        </button>
        <button onClick={ insertMeterChange }>
            + Meter Change
        </button>
        <br/>
        <Inspector.InspectorChord
            key={ key() }
            insertElem={ insertChord }
        />
    </Layout>
}


const Layout = styled.div`
    display: grid;
    grid-template: auto 1fr / auto auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    justify-content: center;
    justify-items: center;
    align-content: center;
    align-items: center;
    column-gap: 1em;
`