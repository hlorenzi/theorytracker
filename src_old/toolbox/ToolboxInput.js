import React from "react"
import Editor from  "../editor/editor.js"
import Ribbon from "./Ribbon.js"
import ToolboxNote from "./ToolboxNote.js"
import ToolboxChord from "./ToolboxChord.js"
import ToolboxMarkers from "./ToolboxMarkers.js"


export default function ToolboxInput(props)
{
    const state = props.state
    const dispatch = props.dispatch

    const track = Editor.insertionTrack(state)
    const trackKind = state.tracks[track].kind

    const toolboxNote = ToolboxNote({ state, dispatch })
    const toolboxChord = ToolboxChord({ state, dispatch })
    const toolboxMarkers = ToolboxMarkers({ state, dispatch })

    return <Ribbon.Tab label="Input">
        { trackKind != "notes" ? null : toolboxNote }
        { trackKind != "chords" ? null : toolboxChord }
        { trackKind != "markers" ? null : toolboxMarkers }
    </Ribbon.Tab>
}