import React from "react"
import * as Dockable from "../dockable"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Playback from "../playback"
import * as Theory from "../theory"
import * as UI from "../ui"


export interface InspectorChordProps
{
    elemIds: Project.ID[]
}


export function InspectorChord(props: InspectorChordProps)
{
    const windowCtx = Dockable.useWindow()

    const [baseChordType, setBaseChordType] = Dockable.useWindowState(() => 5)


	const chords: Project.Chord[] = []
	for (const elemId of props.elemIds)
	{
		const chord = Project.getElem(Project.global.project, elemId, "chord")
		if (!chord)
			continue

		chords.push(chord)
	}

	if (chords.length == 0)
		return null


	windowCtx.setTitle(chords.length == 1 ? `Chord` : `${ chords.length } Chords`)


	let sameChord: Theory.Chord | null = chords[0].chord
	let sameKey: Theory.Key = Project.keyAt(Project.global.project, chords[0].parentId, chords[0].range.start)
	for (const chord of chords)
	{
		if (chord.chord !== sameChord)
            sameChord = null
        
        //const key = Project.keyAt(Project.global.project, chord.parentId, chord.range.start)
        //if (key !== sameKey)
        //    sameKey = null
	}


	const modifyChords = (func: (chord: Project.Chord) => Project.Chord) =>
	{
		for (const chord of chords)
		{
			const newChord = func(chord)
			console.log("InspectorKeyChange.modifyChords", chord, newChord)
			Project.global.project = Project.upsertElement(Project.global.project, newChord)
		}

        Project.notifyObservers()
        window.dispatchEvent(new Event("timelineRefresh"))
	}


    const onChooseChord = (chord: Theory.Chord) =>
    {
        Playback.playChordPreview(
            Project.global.project.chordTrackId,
            chord,
            0, 1)

        modifyChords(ch =>
        {
            return Project.elemModify(ch, { chord })
        })
    }


    const chordTypeOptions: { label: string, value: any }[] = []
    Theory.Chord.kinds.map((chord, index) =>
    {
        chordTypeOptions.push({
            label:
                (chord.symbol[0] ? "iv" : "IV") +
                chord.symbol[1] +
                (chord.symbol[2] || "") +
                " - " + chord.name,
            value: chord.id,
        })
    })

    const chordButtons = []
    if (typeof baseChordType === "number")
    {
        for (let degree = 0; degree < 7; degree++)
        {
            const root = sameKey.midiForDegree(degree)
                
            let pitches = [0]
            pitches.push(sameKey.midiForDegree(degree + 2) - root)
            pitches.push(sameKey.midiForDegree(degree + 4) - root)
            
            if (baseChordType >= 7)
                pitches.push(sameKey.midiForDegree(degree + 6) - root)
            
            if (baseChordType >= 9)
                pitches.push(sameKey.midiForDegree(degree + 8) - root)
            
            if (baseChordType >= 11)
                pitches.push(sameKey.midiForDegree(degree + 10) - root)
            
            if (baseChordType >= 13)
                pitches.push(sameKey.midiForDegree(degree + 12) - root)
            
            const kind = Theory.Chord.kindFromPitches(pitches)
            const chord = new Theory.Chord(root, kind, 0, [])
            chordButtons.push({ chord })
        }
    }
    else
    {
        for (let rootNote = 0; rootNote < 12; rootNote++)
        {
            const root = sameKey.tonic.chroma + rootNote
                
            const kind = Theory.Chord.kindFromId(baseChordType)
            const chord = new Theory.Chord(root, kind, 0, [])

            chordButtons.push({ chord })
        }
    }


	return <div style={{
		padding: "1em",
	}}>

		<div style={{
			display: "grid",
			gridTemplate: "auto / auto",
			gridRowGap: "0.25em",
			gridColumnGap: "0.25em",
			justifyItems: "start",
			alignItems: "center",

			minWidth: 0,
			maxWidth: "max-content",
		}}>

            <UI.DropdownMenu
                items={[
                    {
                        label: "In key",
                        subitems: [
                            { label: "Triads", value: 5 },
                            { label: "Seventh chords", value: 7 },
                            { label: "Ninth chords", value: 9 },
                            { label: "Eleventh chords", value: 11 },
                            { label: "Thirteenth chords", value: 13 },
                        ]
                    },
                    {
                        label: "By type",
                        subitems: chordTypeOptions,
                    },
                ]}
                selected={ baseChordType }
                onChange={ (item) => setBaseChordType(item.value) }
            />
			
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                justifyItems: "start",
                alignItems: "center",

                minWidth: 0,
                maxWidth: "100%",
            }}>
                { chordButtons.map((cb, i) =>
                    <UI.ChordButton
                        key={ i }
                        chord={ cb.chord }
                        theoryKey={ sameKey! }
                        onClick={ () => onChooseChord(cb.chord) }
                    />
                )}
            </div>

		</div>

	</div>
}