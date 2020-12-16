import React from "react"
import * as Project from "../project"
import * as Playback from "../playback"
import * as UI from "../ui"
import * as Misc from "../util/misc"


export interface InstrumentSelectProps
{
    getInstrument: () => Project.Instrument | null
    setInstrument: (newInstr: Project.Instrument) => void
}


export function InstrumentSelect(props: InstrumentSelectProps)
{
    const onChangeType = (newType: string) =>
    {
        props.setInstrument(Project.makeInstrumentOfKind(newType))
    }

    const instr = props.getInstrument()
    if (!instr)
        return null

    return <div style={{
        width: "100%",
        height: "100%",
        minWidth: "0",
        minHeight: "0",
        boxSizing: "border-box",
        padding: "0.5em",

        display: "grid",
        gridTemplate: "auto auto 1fr / 1fr",
        justifyContent: "start",
        justifyItems: "start",
    }}>
        <div>
            <select
                value={ instr.type }
                onChange={ (ev) => onChangeType(ev.target.value) }
            >
                <option value="basic">Basic</option>
                <option value="sflib">Soundfont Library</option>
            </select>
        </div>

        <br/>
        
        { instr.type != "sflib" ? null :
            <InstrumentSelectSflib data={ props }/>
        }

    </div>
}


function InstrumentSelectSflib(props: { data: InstrumentSelectProps })
{
    const instr = props.data.getInstrument() as Project.InstrumentSflib
    const sflibMeta = Playback.getSflibMeta()
    if (!sflibMeta)
        return null

    const curCollection = sflibMeta.collectionsById.get(instr.collectionId)!

    const onChange = (collectionId: string, instrumentId: string) =>
    {
        let newInstr = { ...props.data.getInstrument() as Project.InstrumentSflib }
        newInstr.collectionId = collectionId
        newInstr.instrumentId = instrumentId
        props.data.setInstrument(newInstr)
    }

    const collItems = React.useMemo(() =>
    {
        return sflibMeta.collections.map(coll =>
        {
            return {
                value: coll.id,
                label: coll.name,
            }
        })

    }, [])

    const instrItems = React.useMemo(() =>
    {
        return curCollection.instruments.map(instr =>
        {
            return {
                value: instr.id,
                label:
                    Misc.getMidiPresetEmoji(instr.midiBank, instr.midiPreset) + " " +
                    //"[" + instr.midiBank.toString().padStart(3, "0") + ":" +
                    //instr.midiPreset.toString().padStart(3, "0") + "] " +
                    instr.name,
            }
        })

    }, [curCollection])

    return <div style={{
        display: "grid",
        gridTemplate: "auto 1fr / 14em 1fr",
        gridGap: "0.5em 0.5em",
        width: "100%",
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

        <UI.ListBox
            selected={ instr.collectionId }
            onChange={ item => onChange(item.value, sflibMeta.collectionsById.get(item.value)!.instruments[0].id) }
            items={ collItems }
        />

        <UI.ListBox
            selected={ instr.instrumentId }
            onChange={ item => onChange(curCollection.id, item.value) }
            items={ instrItems }
        />

    </div>
}