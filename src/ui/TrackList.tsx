import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Ui from "./index.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import Rect from "../utils/rect.ts"
import Rational from "../utils/rational.ts"
import { styled } from "solid-styled-components"


export function TrackList(props: {
    style?: Solid.JSX.CSSProperties,
})
{
    const modifyTrack = (newTrack: Project.Track) => {
        console.log("modifyTrack", newTrack)
        let project = Global.get().project
        project.root = Project.upsertTrack(project.root, newTrack)
        Global.refresh()
    }

    const onClickTrack = (clickedTrack: Project.Track) => {
        const project = Global.get().project
        const timeline = Global.get().timeline
        const prefs = Global.get().prefs
        const selectMultiple = timeline.keysDown.has(prefs.timeline.keySelectMultiple)
        
        if (!selectMultiple)
            Timeline.selectionClear(timeline)
        
        Timeline.selectionAdd(timeline, clickedTrack.id)
        timeline.cursor.visible = false

        if (clickedTrack.trackType === "notes")
        {
            for (const track of project.root.tracks)
            {
                if (track.trackType !== "notes" &&
                    track.trackType !== "chords")
                    continue

                const newTrack = { ...track }
                newTrack.editable = (track.id === clickedTrack.id)
                project.root = Project.upsertTrack(project.root, newTrack)
            }
        }

        Global.refresh()
    }

    const onAddTrack = () => {
        const project = Global.get().project
        const timeline = Global.get().timeline
        const id = project.root.nextId
        const track = Project.makeTrackNotes()
        project.root = Project.upsertTrack(project.root, track)
        Timeline.selectionClear(timeline)
        Timeline.selectionAdd(timeline, id)
        timeline.cursor.visible = false
        
        for (const track of project.root.tracks)
        {
            if (track.trackType !== "notes" &&
                track.trackType !== "chords")
                continue

            const newTrack = { ...track }
            newTrack.editable = (track.id === id)
            project.root = Project.upsertTrack(project.root, newTrack)
        }

        Global.refresh()
    }

    const tracks = Solid.createMemo(() => Global.get().project.root.tracks)
    const selection = Solid.createMemo(() => Global.get().timeline.selection)

    const trackList = Solid.createMemo(() => {
        return tracks().map((track, i) => {
            const trackWithAttrb =
                track.trackType === "notes" || track.trackType === "chords" ?
                    track :
                    undefined

            if (!trackWithAttrb)
                return undefined

            const isEditable = !!trackWithAttrb?.editable
            const isSelected = selection().has(track.id)

            return <TrackSlot
                data-editable={ isEditable }
                data-selected={ isSelected }
                onMouseUp={ () => onClickTrack(track) }
            >
                <div>
                    { track.name }
                </div>
                <Ui.TrackButton
                    label="👁️"
                    groupId="visible"
                    disabled={ !trackWithAttrb }
                    checked={ trackWithAttrb?.visible }
                    onSet={
                        trackWithAttrb &&
                        (value => modifyTrack({ ...trackWithAttrb, visible: value }))
                    }
                />
                <Ui.TrackButton
                    label="🔊"
                    groupId="mute"
                    disabled={ !trackWithAttrb }
                    checked={ !trackWithAttrb?.mute }
                    onSet={
                        trackWithAttrb &&
                        (value => modifyTrack({ ...trackWithAttrb, mute: !value }))
                    }
                />
                <Ui.TrackButton
                    label="🎧"
                    groupId="solo"
                    disabled={ !trackWithAttrb }
                    checked={ trackWithAttrb?.solo }
                    onSet={
                        trackWithAttrb &&
                        (value => modifyTrack({ ...trackWithAttrb, solo: value }))
                    }
                />
            </TrackSlot>
        })
    })

    return <Layout
        style={ props.style }
    >
        <div/>
        <ScrollList>
            { trackList() }
        </ScrollList>
        <div>
            <Ui.Button
                label="+ Track"
                onClick={ onAddTrack }
            />
        </div>
    </Layout>
}


const Layout = styled.div`
    display: grid;
    grid-template: auto 1fr auto / 1fr;
    width: 20em;
    height: 100%;
    justify-items: center;
`


const ScrollList = styled.div`
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    border-radius: 0.25em;
`


const TrackSlot = styled.button<{
    "data-editable": boolean,
    "data-selected": boolean,
}>`
    display: grid;
    grid-template: auto / 1fr repeat(5, auto);
    justify-items: start;
    justify-content: start;
    user-select: none;
    cursor: pointer;

    width: 90%;
    margin: 0.25em;
    padding: 0.25em 0.5em;
    border: 2px solid transparent;
    border-radius: var(--theme-buttonBorderRadius);
    background-color: var(--theme-buttonBkg);
    color: inherit;
    font-family: inherit;
    font-size: inherit;

    &:hover {
        background-color: var(--theme-buttonBkgHover);
    }

    &:active {
        background-color: var(--theme-buttonBkgPress);
    }

    &[data-editable=true] {
        background-color: var(--theme-buttonBkgSelected);
    }
    
    &[data-selected=true] {
        border: 2px solid #fff8;
    }
`