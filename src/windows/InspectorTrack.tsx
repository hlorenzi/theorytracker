import React from "react"
import * as Windows from "./index"
import * as Dockable from "../dockable"
import * as Project from "../project"
import * as UI from "../ui"
import { InstrumentSelect } from "./InstrumentSelect"
import styled from "styled-components"


const StyledButton = styled.button`
    font-family: inherit;
    color: #fff;
    border: 1px solid #888;
    border-radius: 0.25em;
    background-color: transparent;
    padding: 0.5em 1em;
    margin: 0.5em 0.25em;
    cursor: pointer;
    outline: none;

    &:hover
    {
        background-color: #2f3136;
        border: 1px solid #fff;
    }

    &:active
    {
        background-color: #222;
        border: 1px solid #fff;
    }
`


export interface InspectorTrackProps
{
    elemIds: Project.ID[]
}


export function InspectorTrack(props: InspectorTrackProps)
{
    const project = Project.useProject()

    const trackId: Project.ID = props.elemIds[0]
    
    const getTrack = () =>
    {
        const elem = project.ref.current.elems.get(trackId)
        if (!elem || elem.type != "track")
            return null

        return elem as Project.Track
    }

    const track = getTrack()
    if (!track)
        return null
    
    const onRename = (newName: string) =>
    {
        const newTrack: Project.Track = {
            ...track,
            name: newName,
        }

        project.ref.current = Project.upsertTrack(project.ref.current, newTrack)
        project.commit()
    }

    const getInstrument = () =>
    {
        const track = getTrack()
        if (!track || track.trackType != "notes")
            return null

        return track.instrument
    }

    const setInstrument = (newInstrument: Project.Instrument) =>
    {
        const track = getTrack()
        if (!track || track.trackType != "notes")
            return null

        const newTrack: Project.TrackNotes =
        {
            ...track,
            instrument: newInstrument,
        }

        project.ref.current = Project.upsertTrack(project.ref.current, newTrack)
        project.commit()
    }

    return <div style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: "0.5em",

        display: "grid",
        gridTemplate: "auto 1fr / 1fr",
        justifyContent: "start",
        justifyItems: "start",
    }}>
        <div>
            Name:
            <UI.Input
                value={ track.name }
                onChange={ onRename }
            />
        </div>

        { track.trackType != "notes" ? <div/> :
            <InstrumentSelect
                getInstrument={ getInstrument }
                setInstrument={ setInstrument }
            />
        }
    </div>
}