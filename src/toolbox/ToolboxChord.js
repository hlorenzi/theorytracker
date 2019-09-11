import React from "react"
import Tab from "./tab.js"
import Editor from "../editor/editor2.js"
import CanvasUtils from "../util/canvas.js"
import Theory from "../theory.js"
import { setIn } from "immutable"


function ChordButton(props)
{
    const refCanvas = React.useRef(null)

    const w = 70
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
        const time = props.state.cursor.time1.min(props.state.cursor.time2)
        props.dispatch({ type: "insertChord", chord, time })
    }

    return <>
        <div onClick={ onClick } style={{
            display: "inline-block",
            margin: "0.1em 0.1em",
            userSelect: "none",
            cursor: "pointer",
        }}>
            <div style={{
                display: "grid",
                gridTemplate: "auto / auto",
                alignContent: "center",
                alignItems: "center",
            }}>
                <canvas ref={ refCanvas } width={ w } height={ h } style={{
                    gridRow: 1,
                    gridColumn: 1,
                    width: w + "px",
                    height: h + "px",
                    borderRadius: "0.25em",
                }}/>
            </div>
        </div>
    </>
}


function KindDropdown(props)
{
    return <select value={ props.current } style={{ height:"2em" }} onChange={ ev => props.onChange(ev.target.value) }>
    
        { Theory.Chord.kinds.map((chord, index) =>
            <React.Fragment key={ chord.id }>
                { chord.startGroup ? <optgroup label={ chord.startGroup }/> : null }
                <option value={ chord.id }>
                    { (chord.symbol[0] ? "iv" : "IV") + chord.symbol[1] + (chord.symbol[2] || "") }
                </option>
            </React.Fragment>
        )}
        
    </select>
}


export default function ToolboxChord(props)
{
    const state = props.state
    const dispatch = props.dispatch
    const [kindGroup, setKindGroup] = React.useState("inkey")
    const [inKeyType, setInKeyType] = React.useState(5)
    const [kindCustomId, setKindCustomId] = React.useState("M")
    const [accidental, setAccidental] = React.useState(0)

    const cursorKeyCh = state.project.keyChanges.findActiveAt(state.cursor.time1.min(state.cursor.time2))
    const key = cursorKeyCh ? cursorKeyCh.key : Editor.defaultKey()


    let title = null
    let chordButtons = null
    switch (kindGroup)
    {
        case "inkey":
            title = key.str + " • "
            switch (inKeyType)
            {
                case 5: title += "Triads in key"; break
                case 7: title += "Seventh chords in key"; break
                case 9: title += "Ninth chords in key"; break
                case 11: title += "Eleventh chords in key"; break
                case 13: title += "Thirteenth chords in key"; break
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
            title = key.str + " • " + Theory.Chord.kinds[Theory.Chord.kindFromId(kindCustomId)].name + " chords"
            chordButtons = [0, 1, 2, 3, 4, 5, 6].map(degree => {
                const kind = Theory.Chord.kindFromId(kindCustomId)
                const root = key.midiForDegree(degree)
                const chord = new Theory.Chord(root, accidental, kind, 0, [])
                
                return <ChordButton state={ state } dispatch={ dispatch } key={ degree } theoryKey={ key } chord={ chord }/>
            })
            break
    }

	return <div style={{ ...props.style }}>
        <div style={{
            display: "grid",
            gridTemplate: "auto auto / auto auto auto",
            gridGap: "0.5em 0.5em",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
        }}>
            <div style={{ gridRow: 1, gridColumn: 1 }}>
                { title }
            </div>

            <div style={{ gridRow: 2, gridColumn: 1 }}>
                { chordButtons }
            </div>

            <div style={{ gridRow: 2, gridColumn: 2, margin: "0 0.5em" }}>
                <Tab current={ accidental } onChange={ setAccidental } vertical options={[
                    { value:  1, render: "♯" },
                    { value:  0, render: "♮" },
                    { value: -1, render: "♭" },
                ]}/>
            </div>
    
            <div style={{ gridRow: 2, gridColumn: 3, margin: "0 0.5em" }}>
                <Tab current={ kindGroup } onChange={ setKindGroup } vertical options={[
                    { value: "inkey", render:
                        <div>
                            In Key
                            <br/>
                            <Tab current={ kindGroup == "inkey" ? inKeyType : null }
                                onChange={ setInKeyType }
                                options={[
                                    { value: 5, render: "-" },
                                    { value: 7, render: "7" },
                                    { value: 9, render: "9" },
                                    { value: 11, render: "11" },
                                    { value: 13, render: "13" },
                            ]}/>
                        </div>
                    },
                    { value: "custom", render:
                        <KindDropdown current={ kindCustomId } onChange={ setKindCustomId }/>
                    },
                ]}/>
            </div>
        
        </div>
    </div>
}