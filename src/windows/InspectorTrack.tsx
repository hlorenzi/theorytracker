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
    const windowCtx = Dockable.useWindow()
    const project = Project.useProject()


	const tracks: Project.Track[] = []
	for (const elemId of props.elemIds)
	{
		const track = Project.getElem(project.ref.current.project, elemId, "track")
		if (!track)
			continue

		tracks.push(track)
	}

	if (tracks.length == 0)
		return null
        
        
    windowCtx.setTitle(tracks.length == 1 ? `Track` : `${ tracks.length } Tracks`)


    let definiteName: string | null = tracks[0].name
    let definiteShowInstrument: boolean = Project.trackHasInstrument(tracks[0])
    let definiteInstrument: Project.Instrument | null = Project.trackGetInstrument(tracks[0])
    for (const track of tracks)
    {
        if (track.name !== definiteName)
            definiteName = null

        if (!Project.trackHasInstrument(track))
            definiteShowInstrument = false

        if (Project.trackHasInstrument(track) && definiteInstrument)
        {
            const instrument = Project.trackGetInstrument(track)!

            if (instrument.type !== definiteInstrument.type)
                definiteInstrument = null
            else switch (instrument.type)
            {
                case "sflib":
                {
                    const definiteSflib = definiteInstrument as Project.InstrumentSflib
                    if (instrument.collectionId !== definiteSflib.collectionId ||
                        instrument.instrumentId !== definiteSflib.instrumentId)
                        definiteInstrument = null
                } 
            }
        }
    }


	const modifyTracks = (func: (tr: Project.Track) => Project.Track) =>
	{
		for (const track of tracks)
		{
			const newTrack = func(track)
			console.log("InspectorTrack.modifyTracks", track, newTrack)
			project.ref.current.project = Project.upsertTrack(project.ref.current.project, newTrack)
		}

        project.commit()
        window.dispatchEvent(new Event("timelineRefresh"))
	}

    
    const onRename = (newName: string) =>
    {
        modifyTracks((track) =>
        {
            return Project.elemModify(track, { name: newName })
        })
    }
    

    const getInstrument = () =>
    {
        return definiteInstrument
    }


    const setInstrument = (newInstrument: Project.Instrument) =>
    {
        modifyTracks((track) =>
        {
            if (!Project.trackHasInstrument(track))
                return track

            return Project.elemModify(track, { instrument: newInstrument })
        })
    }


    return <div style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: "1em",

        display: "grid",
        gridTemplate: "auto auto auto 1fr / 1fr",
        gridGap: "0.5em 0.5em",
        justifyContent: "start",
        justifyItems: "start",
        alignItems: "start",
    }}>
        <div>
            Name
        </div>

        <div>
            <UI.Input
                value={ definiteName }
                onChange={ onRename }
            />
        </div>

        { !definiteShowInstrument ? null :
            <>
                <div>
                    Instrument
                </div>
            
                <InstrumentSelect
                    getInstrument={ getInstrument }
                    setInstrument={ setInstrument }
                />
            </>
        }
    </div>
}