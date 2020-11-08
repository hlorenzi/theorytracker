import React from "react"
import * as Windows from "./index"
import * as Dockable from "../dockable"
import * as Project from "../project"
import * as UI from "../ui"
import Rect from "../util/rect"
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


export function TrackSettings()
{
    const window = Dockable.useWindow()
    const dockable = Dockable.useDockable()
    const project = Project.useProject()

    const trackId: Project.ID = window.data.trackId
    const elem = project.ref.current.elems.get(trackId)
    if (!elem)
        return null

    const track = elem as Project.Track

    const onRename = (newName: string) =>
    {
        const newTrack: Project.Track = {
            ...track,
            name: newName,
        }

        project.ref.current = Project.upsertTrack(project.ref.current, newTrack)
        project.commit()
    }

    const onAddInstrument = () =>
    {
        const newInstr: Project.InstrumentSflib = {
            instrumentType: "sflib",
            collectionId: "gm",
            instrumentId: "piano_1",
        }

        const newTrack: Project.Track = {
            ...track,
            instruments: [
                ...track.instruments,
                newInstr,
            ],
        }

        project.ref.current = Project.upsertTrack(project.ref.current, newTrack)
        project.commit()
    }

    const onRemoveInstrument = (index: number) =>
    {
        const newTrack: Project.Track = {
            ...track,
            instruments: [
                ...track.instruments.slice(0, index),
                ...track.instruments.slice(index + 1),
            ],
        }

        project.ref.current = Project.upsertTrack(project.ref.current, newTrack)
        project.commit()
    }

    const onEditInstrument = (index: number) =>
    {
        const getInstrument = () =>
        {
            const elem = project.ref.current.elems.get(trackId)
            if (!elem)
                return null
        
            const track = elem as Project.Track
            if (index >= track.instruments.length)
                return null

            return track.instruments[index]
        }

        const setInstrument = (newInstrument: Project.Instrument) =>
        {
            const newTrack: Project.Track = {
                ...track,
                instruments: [
                    ...track.instruments.slice(0, index),
                    newInstrument,
                    ...track.instruments.slice(index + 1),
                ],
            }
    
            project.ref.current = Project.upsertTrack(project.ref.current, newTrack)
            project.commit()
        }

        dockable.ref.current.createFloating(
            Windows.InstrumentSelect,
            { getInstrument, setInstrument },
            new Rect(
                100, 100,
                1, 1))
    }

    return <div style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: "0.5em",

        display: "grid",
        gridTemplate: "auto auto 1fr / 1fr",
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

        <br/>

        <div>
            Instruments:

            { track.instruments.map((instr, i) =>
                <div>
                    <StyledButton
                        onClick={ () => onRemoveInstrument(i) }
                    >
                        x
                    </StyledButton>
                    { "  " }
                    <StyledButton
                        onClick={ () => onEditInstrument(i) }
                    >
                        { instrumentPreviewName(instr) }
                    </StyledButton>
                </div>
            )}

            <div>
                <StyledButton
                    onClick={ onAddInstrument }
                >
                    +
                </StyledButton>
            </div>
        </div>
    </div>
}


function instrumentPreviewName(instrument: Project.Instrument): string
{
    switch (instrument.instrumentType)
    {
        case "basic": return "Basic"
        case "sflib": return instrument.collectionId + "/" + instrument.instrumentId
        default: return "???"
    }
}