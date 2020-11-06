import React from "react"
import * as Dockable from "./dockable"
import * as Editor from "./editor"
import * as Playback from "./playback"
import { useRefState } from "./util/refState"
import styled from "styled-components"


export default function PlaybackToolbar()
{
    const playback = Playback.usePlayback()


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
    </div>
}