import React from "react"
import * as Playback from "./playback"
import * as Project from "./project"


export default function PlaybackToolbar()
{
    const playback = Playback.usePlayback()
    const project = Project.useProject()


    return <div style={{
        padding: "0.1em",
        display: "grid",
        gridAutoFlow: "column",
        alignItems: "stretch",
        justifyItems: "start",
    }}>
        <button
            onClick={ () => playback.ref.current.togglePlaying() }
            style={{
                width: "5em",
        }}>
            { playback.ref.current.playing ? "■ Stop" : "▶ Play" }
        </button>

        <button
            onClick={ () =>
            {
                playback.ref.current.stopPlaying()
                window.dispatchEvent(new Event("timelineRewind"))
            }}
            style={{
                width: "4em",
        }}>
            { "◀◀" }
        </button>

        <div style={{
            alignSelf: "center",
            color: "#fff",
            margin: "0 0.5em",
        }}>
            Base BPM:
        </div>

        <input
            type="number"
            value={ project.ref.current.baseBpm }
            onChange={ ev =>
            {
                project.ref.current.baseBpm = parseInt(ev.target.value)
                project.commit()
            }}
            style={{
                width: "4em",
                backgroundColor: "transparent",
                color: "#fff",
                border: "1px solid #888",
                borderRadius: "0.5em",
                padding: "0 0.5em",
        }}/>
    </div>
}