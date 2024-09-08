import React from "react"
import * as Playback from "./playback"
import * as Project from "./project"


export default function PlaybackToolbar()
{
    const onChangeBpm = (ev: React.ChangeEvent<HTMLInputElement>) =>
    {
        Project.global.project =
        {
            ...Project.global.project,
            baseBpm: parseInt(ev.target.value)
        }
        
        Project.addUndoPoint("setBpm")
        Project.notifyObservers()
    }


    return <div style={{
        padding: "0.1em",
        display: "grid",
        gridAutoFlow: "column",
        alignItems: "stretch",
        justifyItems: "start",
    }}>
        <button
            onClick={ () => Playback.togglePlaying() }
            style={{
                width: "5em",
        }}>
            { Playback.global.playing ? "■ Stop" : "▶ Play" }
        </button>

        <button
            onClick={ () =>
            {
                Playback.setPlaying(false)
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
            value={ Project.global.project.baseBpm }
            onChange={ onChangeBpm }
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