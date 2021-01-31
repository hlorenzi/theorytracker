import React from "react"
import * as Dockable from "../dockable"
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
    const instrType = instr ? instr.type : "sflib"

    return <div style={{
        width: "100%",
        height: "100%",
        minWidth: "0",
        minHeight: "0",
        boxSizing: "border-box",

        display: "grid",
        gridTemplate: "auto 1fr / 1fr",
        gridGap: "0.5em 0.5em",
        justifyContent: "start",
        justifyItems: "start",
    }}>
        <div>
            <UI.DropdownMenu
                items={[
                    //{ value: "basic", label: "Basic" },
                    { value: "sflib", label: "Soundfont Library" },
                ]}
                selected={ instrType }
                onChange={ (item) => onChangeType(item.value) }
            />
        </div>

        { instrType != "sflib" ? null :
            <InstrumentSelectSflib data={ props }/>
        }

    </div>
}


function InstrumentSelectSflib(props: { data: InstrumentSelectProps })
{
    const instr = props.data.getInstrument() as (Project.InstrumentSflib | null)
    const sflibMeta = Playback.getSflibMeta()
    if (!sflibMeta)
        return null

    const [selCollection, setSelCollection] = Dockable.useWindowState(() => instr ? instr.collectionId : "gm")
    const curCollection = sflibMeta.collectionsById.get(selCollection)!

    const onChange = (collectionId: string, instrumentId: string) =>
    {
        let newInstr: Project.InstrumentSflib =
        {
            type: "sflib",
            collectionId,
            instrumentId,
        }

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
            Preset
        </div>

        <UI.ListBox
            active={ instr ? instr.collectionId : null }
            selected={ selCollection }
            onChange={ item => setSelCollection(item.value) }
            items={ collItems }
        />

        <UI.ListBox
            selected={ instr && instr.collectionId == selCollection ? instr.instrumentId : null }
            onChange={ item => onChange(curCollection.id, item.value) }
            items={ instrItems }
        />

    </div>
}