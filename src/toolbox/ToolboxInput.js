import React from "react"
import Tab from "./tab.js"
import ToolboxNote from "./ToolboxNote.js"
import ToolboxChord from "./ToolboxChord.js"
import ToolboxMarkers from "./ToolboxMarkers.js"


export default function ToolboxInput(props)
{
    const state = props.state
    const dispatch = props.dispatch
    const [mainTab, setMainTab] = React.useState("notes")

    const track = Math.min(state.cursor.track1, state.cursor.track2)
    const trackKind = state.tracks[track].kind


	return <>
        <div style={{
            width: "100%",
            display: "grid",
            gridTemplate: "auto 1fr / auto",
            gridGap: "0.25em 0.25em",
            alignItems: "center",
            ...props.style,
        }}>
            <Tab current={ mainTab } onChange={ setMainTab } options={[
                { value: "notes", render: "Notes" },
                { value: "chords", render: "Chords" },
                { value: "markers", render: "Markers" },
            ]} style={{
                justifySelf: "start",
            }}/>

            <ToolboxNote state={ state } dispatch={ dispatch } style={{
                gridRow: 2,
                gridColumn: 1,
                justifySelf: "start",
                display: (trackKind == "notes" ? "block" : "none"),
            }}/>

            <ToolboxChord state={ state } dispatch={ dispatch } style={{
                gridRow: 2,
                gridColumn: 1,
                justifySelf: "start",
                display: (trackKind == "chords" ? "block" : "none"),
            }}/>

            <ToolboxMarkers state={ state } dispatch={ dispatch } style={{
                gridRow: 2,
                gridColumn: 1,
                justifySelf: "start",
                display: (trackKind == "markers" ? "block" : "none"),
            }}/>
        </div>
    </>
}