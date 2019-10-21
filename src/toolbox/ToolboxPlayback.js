import React from "react"
import Ribbon from "./Ribbon.js"


export default function ToolboxPlayback(props)
{
    const state = props.state
    const playbackController = props.playbackController

    const rewind = () =>
    {
        props.dispatch({ type: "rewind" })
    }

    const setBaseBpm = (value) =>
    {
        props.dispatch({ type: "set", state: { project: state.project.withChanges({ baseBpm: value }) } })
    }

    return <Ribbon.Tab label="Playback">
        <Ribbon.Group label="Playback">
            <Ribbon.SlotButton tall
                selected={ state.playback.playing }
                icon={ state.playback.playing ? "⏹️" : "▶️" }
                label={ state.playback.playing ? "Stop" : "Play" }
                onClick={ playbackController.togglePlaying }
            />
            <Ribbon.SlotButton tall
                icon="⏪"
                label="Rewind"
                onClick={ rewind }
            />
            <Ribbon.Slot>
                <Ribbon.SlotLayout
                    icon={<span>Base BPM</span>}
                    label={<Ribbon.Input
                        type="number"
                        value={ state.project.baseBpm }
                        onChange={ ev => setBaseBpm(ev.target.value) }
                    />}
                />
            </Ribbon.Slot>
        </Ribbon.Group>
    </Ribbon.Tab>
}