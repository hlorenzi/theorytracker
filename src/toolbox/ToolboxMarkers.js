import React from "react"
import Tab from "./tab.js"
import Editor from "../editor/editor2.js"
import Theory from "../theory.js"
import Project from "../project/project.js"


function KeyChangeToolbox(props)
{
    const state = props.state
    const dispatch = props.dispatch

    const time = state.cursor.time1.min(state.cursor.time2)
    const cursorKeyCh = state.project.keyChanges.findActiveAt(time)
    const key = cursorKeyCh ? cursorKeyCh.key : Editor.defaultKey()

    const accidentalNames = ["♭♭", "♭", "♮", "♯", "♯♯"]

    const insertNew = () => dispatch({ type: "insertKeyChange", time, key: Editor.defaultKey() })

    const setTonicLetter = (letter) =>
    {
        if (!cursorKeyCh)
            return
        
        const newKey = new Theory.Key(new Theory.PitchName(letter, key.tonic.accidental), key.scale)
        const newKeyCh = cursorKeyCh.withChanges({ key: newKey })
        const project = state.project.upsertKeyChange(newKeyCh)
        dispatch({ type: "projectSet", project })
    }

    const setTonicAccidental = (acc) =>
    {
        if (!cursorKeyCh)
            return
        
        const newKey = new Theory.Key(new Theory.PitchName(key.tonic.letter, acc), key.scale)
        const newKeyCh = cursorKeyCh.withChanges({ key: newKey })
        const project = state.project.upsertKeyChange(newKeyCh)
        dispatch({ type: "projectSet", project })
    }

    const setScale = (scale) =>
    {
        if (!cursorKeyCh)
            return
        
        const newKey = new Theory.Key(key.tonic, scale)
        const newKeyCh = cursorKeyCh.withChanges({ key: newKey })
        const project = state.project.upsertKeyChange(newKeyCh)
        dispatch({ type: "projectSet", project })
    }

	return <div style={{ ...props.style }}>
        <div style={{
            display: "grid",
            gridTemplate: "auto auto / auto",
            gridGap: "0.25em 0.25em",
            alignItems: "center",
            justifyItems: "start",
            textAlign: "left",
            ...props.style,
        }}>
            <div style={{ backgroundColor:"#fdf", padding:"0.5em" }}>
                <span>Key Change</span>
                <br/>
                <button onClick={ insertNew }>Insert New</button>
                <br/>
                <br/>
                <span>Current:</span>
                <br/>
                <select
                    value={ key.tonic.letter }
                    onChange={ ev => setTonicLetter(parseInt(ev.target.value)) }
                    style={{ height:"2em" }}
                >
                    { [0, 1, 2, 3, 4, 5, 6].map(i => <option key={ i } value={ i }>{ Theory.Utils.letterToStr(i) }</option>) } 
                </select>
                <select
                    value={ key.tonic.accidental }
                    onChange={ ev => setTonicAccidental(parseInt(ev.target.value)) }
                    style={{ height:"2em" }}
                >
                    { [-2, -1, 0, 1, 2].map(acc => <option key={ acc } value={ acc }>{ accidentalNames[acc + 2] }</option>) } 
                </select>
                <select
                    value={ key.scale.id }
                    onChange={ ev => setScale(Theory.Scale.fromId(ev.target.value)) }
                    style={{ height:"2em" }}
                >
                    { Theory.Scale.list.map(scale => <option key={ scale.id } value={ scale.id }>{ scale.names[0] }</option>) } 
                </select>
            </div>
        </div>
    </div>
}


function MeterChangeToolbox(props)
{
    const state = props.state
    const dispatch = props.dispatch

    const time = state.cursor.time1.min(state.cursor.time2)
    const cursorMeterCh = state.project.meterChanges.findActiveAt(time)
    const meter = cursorMeterCh ? cursorMeterCh.meter : Editor.defaultMeter()

	const meterDenominators = [1, 2, 4, 8, 16, 32, 64]
	
    const insertNew = () => dispatch({ type: "insertMeterChange", time, meter: Editor.defaultMeter() })

    const setNumerator = (numerator) =>
    {
        if (!cursorMeterCh)
            return
        
        const newMeter = new Theory.Meter(numerator, meter.denominator)
        const newMeterCh = cursorMeterCh.withChanges({ meter: newMeter })
        const project = state.project.upsertMeterChange(newMeterCh)
        dispatch({ type: "projectSet", project })
    }

    const setDenominator = (denominator) =>
    {
        if (!cursorMeterCh)
            return
        
        const newMeter = new Theory.Meter(meter.numerator, denominator)
        const newMeterCh = cursorMeterCh.withChanges({ meter: newMeter })
        const project = state.project.upsertMeterChange(newMeterCh)
        dispatch({ type: "projectSet", project })
    }

	return <div style={{ ...props.style }}>
        <div style={{
            display: "grid",
            gridTemplate: "auto auto 1fr / auto",
            gridGap: "0.25em 0.25em",
            gridAutoFlow: "row",
            alignItems: "center",
            justifyItems: "start",
            textAlign: "left",
        }}>
            <div style={{ backgroundColor:"#def", padding:"0.5em" }}>
                <span>Meter Change</span>
                <br/>
                <button onClick={ insertNew }>Insert New</button>
                <br/>
                <br/>
                <span>Current:</span>
                <br/>
                <input type="number"
                    value={ meter.numerator }
                    onChange={ ev => setNumerator(Math.max(1, Math.min(64, ev.target.value))) }
                    onKeyDown={ ev => ev.stopPropagation() }
                    min="1" max="64"
                    style={{ width:"3em", height:"2em" }}
                />
                <span>{ " / " }</span>
                <select
                    value={ meter.denominator }
                    onChange={ ev => setDenominator(parseInt(ev.target.value)) }
                    style={{ height:"2em" }}
                >
                    { meterDenominators.map(d => <option key={ d } value={ d }>{ d.toString() }</option>) } 
                </select>
            </div>
        </div>
    </div>
}


export default function ToolboxMarkers(props)
{
    const state = props.state
    const dispatch = props.dispatch

	return <div style={{ ...props.style }}>
        <div style={{ 
            display: "grid",
            gridTemplate: "auto / auto auto",
            gridGap: "0.25em 0.25em",
            alignItems: "start",
            justifyContent: "start",
            justifyItems: "start",
        }}>
            <KeyChangeToolbox state={ state } dispatch={ dispatch }/>
            <MeterChangeToolbox state={ state } dispatch={ dispatch }/>
        </div>
    </div>
}