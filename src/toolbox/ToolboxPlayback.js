import React from "react"
import Project from "../project/project.js"


export default function ToolboxPlayback(props)
{
    const state = props.state
    const playbackController = props.playbackController

	const examples =
	[
		"mozartk453",
		"letitgo",
		"rollercoaster",
		"adventure",
		"isaac",
		"dontstarve",
		"chronotrigger",
		"jimmyneutron",
		"whensomebodylovedme",
	]
	
    const rewind = () =>
    {
        props.dispatch({ type: "rewind" })
    }

    const setBaseBpm = (value) =>
    {
        props.dispatch({ type: "set", state: { project: state.project.withChanges({ baseBpm: value }) } })
    }

    const loadExample = (filename) =>
    {
        if (filename == "")
            return
        
        fetch("examples/" + filename + ".json")
            .then(res => res.json())
            .then(json =>
            {
                props.dispatch({ type: "projectLoad", project: Project.fromJson(json) })
            })
    }
    
	return <>
        <div style={{ 
            display: "grid",
            gridTemplate: "auto / auto auto auto",
            gridGap: "0.25em 0.25em",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
            ...props.style,
        }}>
            <button
                title={ state.playback.playing ? "Stop (space)" : "Play (space)" }
                onClick={ playbackController.togglePlaying }
                style={{ width:"4em", height:"4em" }}
            >
                <span style={{ fontSize:"3em" }}>{ state.playback.playing ? "■" : "▶" }</span>
            </button>

            <button
                title="Rewind"
                onClick={ rewind }
                style={{ width:"4.5em", height:"3em" }}
            >
                <span style={{ fontSize:"2em" }}>◀◀</span>
            </button>

            <div>
                Base BPM:
                <br/>
                <input
                    type="number"
                    value={ state.project.baseBpm }
                    onKeyDown={ ev => ev.stopPropagation() }
                    onChange={ ev => setBaseBpm(ev.target.value) }
                    style={{ width:"5em" }}
                />
            </div>
            
            <div style={{ gridRow: 2, gridColumn: "1 / 4" }}>
                <br/>
            </div>
            
            <div style={{ gridRow: 3, gridColumn: "1 / 4" }}>
                <select value={0} onChange={ ev => loadExample(ev.target.value) }>
                    <option value={""}>Load an example...</option>
                    { examples.map(ex => <option key={ ex } value={ ex }>{ ex }</option>) }
                </select>
            </div>
        </div>
    </>
}