import React from "react"
import ButtonList from "../toolbox/ButtonList"
import DropdownMenu from "../toolbox/DropdownMenu"
import Editor from "./editor"
import { AppState } from "../AppState"
import Rect from "../util/rect"
import Project from "../project/project2"
import * as Theory from "../theory/theory"
import { useAppManager } from "../AppContext"
import ListBox from "../toolbox/ListBox"


interface TrackInstrumentContentProps
{
	contentId: number
	rect: Rect
}


interface TrackInstrumentContentState
{
	elemIds: Project.ID[]
}


function getMidiIcon(midiBank: number, midiPreset: number): string
{
    if (midiBank == 128) // Percussion
        return "🥁"

    if (midiPreset <= 7) // Piano
        return "🎹"
    else if (midiPreset <= 15) // Chromatic Percussion
        return "🔔"
    else if (midiPreset <= 23) // Organ
        return "💨"
    else if (midiPreset <= 31) // Guitar
        return "🎸"
    else if (midiPreset <= 39) // Bass
        return "🎸"
    else if (midiPreset <= 47) // Strings
        return "🎻"
    else if (midiPreset <= 55) // Ensemble
        return "🎻"
    else if (midiPreset <= 63) // Brass
        return "🎺"
    else if (midiPreset <= 71) // Reed
        return "🎷"
    else if (midiPreset <= 79) // Pipe
        return "✏️"
    else if (midiPreset <= 87) // Synth Lead
        return "🕹️"
    else if (midiPreset <= 95) // Synth Pad
        return "🕹️"
    else if (midiPreset <= 103) // Synth FX
        return "🕹️"
    else if (midiPreset <= 111) // Ethnic
        return "🪕"
    else if (midiPreset <= 119) // Percussive
        return "🥁"
    else if (midiPreset <= 127) // Sound FX
        return "🔊"
    else
        return "🎹"
}


export default function TrackInstrumentContent(props: TrackInstrumentContentProps)
{
	const appManager = useAppManager()
	const contentCtx = appManager.makeContentManager<TrackInstrumentContentState>(props.contentId)


	const elem = contentCtx.appState.project.elems.get(contentCtx.contentState.elemIds[0])
	if (!elem)
        return null
        
    const track = elem as Project.Track
    if (track.trackType != Project.TrackType.Notes)
        return null

    const trackNotes = track as Project.TrackNotes
    const trackInstr = trackNotes.instrument as Project.TrackInstrumentSflib
    const sflibMeta = appManager.appState.sflib
    const sflibCurrentColl = sflibMeta.collections.find(coll => coll.id == trackInstr.collectionId)!
    const sflibCurrentInstr = sflibCurrentColl.instruments.find(instr => instr.id == trackInstr.instrumentId)!


    const onChange = (collectionId: string, instrumentId: string) =>
    {
        const newTrack = Project.TrackNotes.withChanges(trackNotes, {
            instrument: {
                ...trackNotes.instrument,
                collectionId,
                instrumentId,
            }
        })

        const newProject = Project.upsertTrack(contentCtx.appState.project, newTrack)
        contentCtx.appManager.mergeAppState({ project: newProject })
        contentCtx.appManager.dispatch()
    }


	return <div style={{
        padding: "0.5em",
        height: "100%",
        boxSizing: "border-box",
	}}>

        <div style={{
            display: "grid",
            gridTemplate: "auto 1fr / 1fr 1fr",
            gridGap: "0.5em 0.5em",
            minHeight: 0,
            height: "100%",
            boxSizing: "border-box",
        }}>

            <div>
                Collection
            </div>

            <div>
                Instrument
            </div>

            <ListBox
                selected={ trackInstr.collectionId }
                onChange={ item => onChange(item.value, sflibMeta.collections.find(coll => coll.id == item.value)!.instruments[0].id) }
                items={ sflibMeta.collections.map(coll =>
                {
                    return {
                        value: coll.id,
                        label: coll.name,
                    }
                })}
            />

            <ListBox
                selected={ trackInstr.instrumentId }
                onChange={ item => onChange(sflibCurrentColl.id, item.value) }
                items={ sflibCurrentColl.instruments.map(instr =>
                {
                    return {
                        value: instr.id,
                        label:
                            getMidiIcon(instr.midiBank, instr.midiPreset) + " " +
                            //instr.midiBank.toString().padStart(3, "0") + "." +
                            //instr.midiPreset.toString().padStart(3, "0") + " : " +
                            instr.name,
                    }
                })}
            />

        </div>

	</div>
}