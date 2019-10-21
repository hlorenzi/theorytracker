import React from "react"
import Editor from "../editor/editor.js"
import CanvasUtils from "../util/canvas.js"
import Theory from "../theory.js"
import Ribbon from "./Ribbon.js"


function ChordButton(props)
{
    const refCanvas = React.useRef(null)

    const w = 60
    const h = 54

    const key = props.theoryKey
    const chord = props.chord

    React.useEffect(() =>
    {
        const ctx = refCanvas.current.getContext("2d")
        CanvasUtils.drawChord(ctx, 0, 0, w, h, chord, key)

    }, [props.theoryKey, props.chord])

    const onClick = () =>
    {
        const time = Editor.insertionTime(props.state)
        props.dispatch({ type: "insertChord", chord, time })
    }

    return <Ribbon.SlotButton tall thin
        onClick={ onClick }
        icon={ <canvas ref={ refCanvas } width={ w } height={ h } style={{
            width: w + "px",
            height: h + "px",
            borderRadius: "0.25em",
        }}/> }
        label=""
    />
}


function KindDropdown(props)
{
    return <Ribbon.Select
        value={ props.current }
        onChange={ ev => props.onChange(ev.target.value) }
        style={{ height:"2em" }}
    >

        { Theory.Chord.kinds.map((chord, index) =>
            <React.Fragment key={ chord.id }>
                { chord.startGroup ? <optgroup label={ chord.startGroup }/> : null }
                <option value={ chord.id }>
                    { (chord.symbol[0] ? "iv" : "IV") + chord.symbol[1] + (chord.symbol[2] || "") }
                </option>
            </React.Fragment>
        )}
        
    </Ribbon.Select>
}


export default function ToolboxChord(props)
{
    const state = props.state
    const dispatch = props.dispatch
    const [kindGroup, setKindGroup] = React.useState("inkey")
    const [inKeyType, setInKeyType] = React.useState(5)
    const [kindCustomId, setKindCustomId] = React.useState("M")
    const [accidental, setAccidental] = React.useState(0)

    const time = Editor.insertionTime(props.state)
    const cursorKeyCh = state.project.keyChanges.findActiveAt(time)
    const key = cursorKeyCh ? cursorKeyCh.key : Editor.defaultKey()

    let title = null
    let chordButtons = null
    switch (kindGroup)
    {
        case "inkey":
            switch (inKeyType)
            {
                case 5: title = "Triads in " + key.str; break
                case 7: title = "Seventh chords in " + key.str; break
                case 9: title = "Ninth chords in " + key.str; break
                case 11: title = "Eleventh chords in " + key.str; break
                case 13: title = "Thirteenth chords in " + key.str; break
            }

            chordButtons = [0, 1, 2, 3, 4, 5, 6].map(degree =>
            {
                const root = key.midiForDegree(degree)
                
                let pitches = [0]
                pitches.push(key.midiForDegree(degree + 2) - root)
                pitches.push(key.midiForDegree(degree + 4) - root)
                
                if (inKeyType >= 7)
                    pitches.push(key.midiForDegree(degree + 6) - root)
                
                if (inKeyType >= 9)
                    pitches.push(key.midiForDegree(degree + 8) - root)
                
                if (inKeyType >= 11)
                    pitches.push(key.midiForDegree(degree + 10) - root)
                
                if (inKeyType >= 13)
                    pitches.push(key.midiForDegree(degree + 12) - root)
                
                const kind = Theory.Chord.kindFromPitches(pitches)
                const chord = new Theory.Chord(root, accidental, kind, 0, [])

                return <ChordButton state={ state } dispatch={ dispatch } key={ degree } theoryKey={ key } chord={ chord }/>
            })
            break

        case "custom":
            title = Theory.Chord.kinds[Theory.Chord.kindFromId(kindCustomId)].name + " chords"
            chordButtons = [0, 1, 2, 3, 4, 5, 6].map(degree => {
                const kind = Theory.Chord.kindFromId(kindCustomId)
                const root = key.midiForDegree(degree)
                const chord = new Theory.Chord(root, accidental, kind, 0, [])
                
                return <ChordButton state={ state } dispatch={ dispatch } key={ degree } theoryKey={ key } chord={ chord }/>
            })
            break
    }

    return <>
        <Ribbon.Group label={ title }>
            { chordButtons }
        </Ribbon.Group>

        <Ribbon.Group label="Chord Type">
            <Ribbon.Slot onClick={ () => setKindGroup("inkey") }>
                <Ribbon.SlotLayout
                    icon={ <span style={{ display: "inline-block", width: "4em" }}>In-Key</span> }
                    label={ <Ribbon.InlineRadioGroup
                        current={ kindGroup == "inkey" ? inKeyType : null }
                        onChange={ setInKeyType }
                        options={[
                            { value: 5, render: "-" },
                            { value: 7, render: "7" },
                            { value: 9, render: "9" },
                            { value: 11, render: "11" },
                            { value: 13, render: "13" },
                        ]}/>
                    }
                />
            </Ribbon.Slot>

            <Ribbon.Slot
                selected={ kindGroup == "custom" }
                onClick={ () => setKindGroup("custom") }
            >
                <Ribbon.SlotLayout
                    icon={ <span style={{ display: "inline-block", width: "4em" }}>Other</span> }
                    label={ <KindDropdown current={ kindCustomId } onChange={ setKindCustomId }/> }
                />
            </Ribbon.Slot>
        </Ribbon.Group>

        <Ribbon.Group thin label="Acc.">
            <Ribbon.SlotRadioGroup
                thin
                current={ accidental }
                onChange={ setAccidental }
                options={[
                    { value:  1, render: "♯" },
                    { value:  0, render: "♮" },
                    { value: -1, render: "♭" },
                ]}
            />

        </Ribbon.Group>
    </>
}