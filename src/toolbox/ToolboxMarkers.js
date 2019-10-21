import React from "react"
import Editor from "../editor/editor.js"
import Theory from "../theory.js"
import Ribbon from "./Ribbon.js"


function KeyChangeToolbox(props)
{
    const state = props.state
    const dispatch = props.dispatch

    const time = Editor.insertionTime(props.state)
    const cursorKeyCh = state.project.keyChanges.findActiveAt(time)
    const key = cursorKeyCh ? cursorKeyCh.key : Editor.defaultKey()

    const accidentalNames = ["♭♭", "♭", "♮", "♯", "♯♯"]

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

    return <Ribbon.Group label="Current Key">
        <Ribbon.Slot>
            <Ribbon.SlotLayout
                label={ <>
                    <Ribbon.Select
                        value={ key.tonic.letter }
                        onChange={ ev => setTonicLetter(parseInt(ev.target.value)) }
                    >
                        { [0, 1, 2, 3, 4, 5, 6].map(i => <option key={ i } value={ i }>{ Theory.Utils.letterToStr(i) }</option>) } 
                    </Ribbon.Select>
                    <Ribbon.Select
                        value={ key.tonic.accidental }
                        onChange={ ev => setTonicAccidental(parseInt(ev.target.value)) }
                    >
                        { [2, 1, 0, -1, -2].map(acc => <option key={ acc } value={ acc }>{ accidentalNames[acc + 2] }</option>) } 
                    </Ribbon.Select>
                    <Ribbon.Select
                        value={ key.scale.id }
                        onChange={ ev => setScale(Theory.Scale.fromId(ev.target.value)) }
                    >
                        { Theory.Scale.list.map(scale => <option key={ scale.id } value={ scale.id }>{ scale.names[0] }</option>) } 
                    </Ribbon.Select>
                </> }
            />
        </Ribbon.Slot>
    </Ribbon.Group>
}


function MeterChangeToolbox(props)
{
    const state = props.state
    const dispatch = props.dispatch

    const time = Editor.insertionTime(props.state)
    const cursorMeterCh = state.project.meterChanges.findActiveAt(time)
    const meter = cursorMeterCh ? cursorMeterCh.meter : Editor.defaultMeter()

	const meterDenominators = [1, 2, 4, 8, 16, 32, 64]
	
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

    return <Ribbon.Group label="Current Meter">
        <Ribbon.Slot>
            <Ribbon.SlotLayout
                label={ <>
                    <Ribbon.Input type="number"
                        value={ meter.numerator }
                        onChange={ ev => setNumerator(Math.max(1, Math.min(64, ev.target.value))) }
                        onKeyDown={ ev => ev.stopPropagation() }
                        min="1" max="64"
                        style={{ width:"3em" }}
                    />
                    <span>{ " / " }</span>
                    <Ribbon.Select
                        value={ meter.denominator }
                        onChange={ ev => setDenominator(parseInt(ev.target.value)) }
                        style={{ height:"2em" }}
                    >
                        { meterDenominators.map(d => <option key={ d } value={ d }>{ d.toString() }</option>) } 
                    </Ribbon.Select>
                </> }
            />
        </Ribbon.Slot>
    </Ribbon.Group>
}


export default function ToolboxMarkers(props)
{
    const state = props.state
    const dispatch = props.dispatch

    const time = Editor.insertionTime(props.state)
    const insertKeyChange = () => dispatch({ type: "insertKeyChange", time, key: Editor.defaultKey() })
    const insertMeterChange = () => dispatch({ type: "insertMeterChange", time, meter: Editor.defaultMeter() })

    const insertIconStyle =
    {
        fontWeight: "bold",
    }

    return <>
        <Ribbon.Group label="Insert">
            <Ribbon.SlotButton
                onClick={ insertKeyChange }
                icon={ <span style={{ color: state.prefs.keyChangeColor, ...insertIconStyle }}>+</span> }
                label="Key Change"
            />
            <Ribbon.SlotButton
                onClick={ insertMeterChange }
                icon={ <span style={{ color: state.prefs.meterChangeColor, ...insertIconStyle }}>+</span> }
                label="Meter Change"
            />
        </Ribbon.Group>

        { KeyChangeToolbox({ state, dispatch }) }
        { MeterChangeToolbox({ state, dispatch }) }
    </>
}