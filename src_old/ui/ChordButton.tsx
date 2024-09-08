import React from "react"
import * as Theory from "../theory"
import * as CanvasUtils from "../util/canvasUtils"


interface ChordButtonProps
{
    chord: Theory.Chord
    theoryKey: Theory.Key
    onClick?: () => void
    disabled?: boolean
}


export function ChordButton(props: ChordButtonProps)
{
    const refCanvas = React.useRef<HTMLCanvasElement>(null!)

    const w = 60
    const h = 50

    React.useEffect(() =>
    {
        const ctx = refCanvas.current!.getContext("2d")!
        CanvasUtils.renderChord(ctx, 0, 0, w, h, props.chord, props.theoryKey)

    }, [props.theoryKey, props.chord])

    
    return <button
        onClick={ props.onClick }
        style={{
            margin: 0,
            marginRight: "0.25em",
            padding: 0,
            border: 0,
            backgroundColor: "transparent",
    }}>
        <canvas ref={ refCanvas } width={ w } height={ h } style={{
            width: w + "px",
            height: h + "px",
            borderRadius: "0.25em",
        }}/>
    </button>
}