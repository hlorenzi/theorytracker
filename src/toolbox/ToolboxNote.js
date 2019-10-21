import React from "react"
import Ribbon from "./Ribbon.js"
import Editor from "../editor/editor.js"
import CanvasUtils from "../util/canvas.js"


function NoteButton(props)
{
    const refCanvas = React.useRef(null)

    const w = 30
    const h = 50

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
        const time = Editor.insertionTime(props.state)
        props.dispatch({ type: "insertNote", chroma: midi, time })
    }

    return <Ribbon.SlotButton tall thin
        onClick={ onClick }
        icon={ <canvas ref={ refCanvas } width={ w } height={ h } style={{
            width: w + "px",
            height: h + "px",
            borderRadius: "0.25em",
        }}/> }
        label={ key.nameForMidi(midi).str }
    />
}


export default function ToolboxNote(props)
{
    const state = props.state
    const dispatch = props.dispatch

    const time = Editor.insertionTime(props.state)
    const cursorKeyCh = state.project.keyChanges.findActiveAt(time)
    const key = cursorKeyCh ? cursorKeyCh.key : Editor.defaultKey()

    return <Ribbon.Group label={ "Notes in " + key.str }>
        { [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(noteIndex =>
            <NoteButton key={ noteIndex } state={ state } dispatch={ dispatch } theoryKey={ key } noteIndex={ noteIndex }/>
        )}
    </Ribbon.Group>
}