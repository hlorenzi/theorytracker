import React from "react"
import Tab from "./tab.js"
import Editor from "../editor/editor2.js"
import CanvasUtils from "../util/canvas.js"


function NoteButton(props)
{
    const refCanvas = React.useRef(null)

    const w = 50
    const h = 20

    const key = props.theoryKey
    const midi = props.noteIndex + key.tonic.midi
    const degree = key.degreeForMidi(midi) + key.scale.metadata.mode

    React.useEffect(() =>
    {
        const ctx = refCanvas.current.getContext("2d")
        ctx.fillStyle = CanvasUtils.fillStyleForDegree(ctx, degree)
        ctx.fillRect(0, 0, w, h)

    }, [props.theoryKey, props.noteIndex])

    const onClick = () =>
    {
        const time = props.state.cursor.time1.min(props.state.cursor.time2)
        props.dispatch({ type: "insertNote", chroma: midi, time })
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
                opacity: (degree == Math.floor(degree) ? 1 : 0.25),
            }}>
                <canvas ref={ refCanvas } width={ w } height={ h } style={{
                    gridRow: 1,
                    gridColumn: 1,
                    width: w + "px",
                    height: h + "px",
                    borderRadius: "0.25em",
                }}/>

                <div style={{
                    gridRow: 1,
                    gridColumn: 1,
                    zIndex: 1,
                    width: w + "px",
                    alignSelf: "center",
                    textShadow: "-1px -1px 0 #eee, 1px -1px 0 #eee, -1px 1px 0 #eee, 1px 1px 0 #eee",
                }}>
                    { key.nameForMidi(midi).str }
                </div>
            </div>
        </div>
    </>
}


export default function ToolboxNote(props)
{
    const state = props.state
    const dispatch = props.dispatch

    const cursorKeyCh = state.project.keyChanges.findActiveAt(state.cursor.time1.min(state.cursor.time2))
    const key = cursorKeyCh ? cursorKeyCh.key : Editor.defaultKey()


	return <>
        <div style={{ 
            display: "grid",
            gridTemplate: "auto auto / auto",
            gridGap: "0.25em 0.25em",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
            ...props.style,
        }}>
            <div style={{ margin: "0.5em 0" }}>
                { key.str }
            </div>
            <div>
                { [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(noteIndex =>
                    <NoteButton key={ noteIndex } state={ state } dispatch={ dispatch } theoryKey={ key } noteIndex={ noteIndex }/>
                )}
            </div>
        </div>
    </>
}