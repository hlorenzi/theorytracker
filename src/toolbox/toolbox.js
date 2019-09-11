import React from "react"
//import { Song, KeyChange, MeterChange } from "../song/song.js"
import { Key, scales, Chord, chords, Meter, drawChordOnCanvas, getScaleIndexFromPitches, getScaleDegreeForPitch, getPitchForScaleDegree, getNameForPitch, getColorForScaleDegree, getColorRotationForScale, getChordKindFromPitches, getRomanNumeralScaleDegreeStr, getFillStyleForScaleDegree } from "../util/theory.js"
import { Rational } from "../util/rational.js"
import { Rect } from "../util/rect.js"
import { mod } from "../util/math.js"


function TabButton(props)
{
	const selected = (props.current == props.value)
	const onClick = () => props.setCurrent(props.value)
	
	return (
		<div
			onClick={onClick}
			style={{
				display:"inline-block", paddingLeft:"0.5em", paddingRight:"0.5em", paddingBottom:"0.25em", borderBottom:"3px solid " + (selected ? "#28f" : "#fff"),
				minWidth:"2em", textAlign:"center",
				cursor:"pointer", userSelect:"none" }}>
			
			{ props.children }
		</div>
	)
}


function PlaybackToolbox(props)
{
	const inputFileRef = React.createRef()
	const performInputFileClick = () => inputFileRef.current.click()
	
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
	
	return <div style={{ height:"auto", display:"grid", gridTemplate:"auto auto auto auto auto 1fr / auto", gridGap:"0.25em 0.25em", gridAutoFlow:"row", justifyItems:"left", padding:"0.5em" }}>
		<div style={{ display:"grid", gridTemplate:"auto / auto auto auto", gridGap:"0.25em 0.25em", gridAutoFlow:"row", alignItems:"center", justifyItems:"center" }}>
			<button style={{ width:"4em", height:"4em" }} onClick={() => props.onPlaybackToggle()}>
				<span style={{ fontSize:"3em" }}>{ props.editor.playing ? "■" : "▶" }</span>
			</button>
			<button style={{ width:"4.5em", height:"3em" }} onClick={() => props.onRewind()}>
				<span style={{ fontSize:"2em" }}>◀◀</span>
			</button>
			<div>
				BPM:
				<br/>
				<input type="number" value={props.editor.song.baseBpm} onKeyDown={(ev) => ev.stopPropagation()} onChange={(ev) => props.onSetBpm(ev.target.value)} style={{ width:"5em" }}/>
			</div>
		</div>
		
		<div style={{ height:"1em" }}/>
		
		<div style={{ display:"grid", gridTemplate:"auto / auto", gridGap:"0.25em 0.25em", gridAutoFlow:"row", alignItems:"center" }}>

			<div style={{ justifySelf:"left" }}>
				<button style={{ fontSize:"18px" }} title="New" onClick={() => props.onNew()}>🗑️</button>
				<div style={{ display:"inline-block", width:"0.5em" }}/>
				<button style={{ fontSize:"18px" }} title="Load MIDI or JSON from file" onClick={performInputFileClick}>📂</button>
				<button style={{ fontSize:"18px" }} title="Paste JSON string" onClick={() => props.onLoadJSONString()}>📋</button>
				<div style={{ display:"inline-block", width:"0.5em" }}/>
				<button style={{ fontSize:"18px" }} title="Save JSON string" onClick={() => props.onSaveJSONString()}>💾</button>
				<button style={{ fontSize:"18px" }} title="Generate URL" onClick={() => props.onGenerateURL()}>🔗</button>
				
				<input ref={inputFileRef} type="file" accept=".mid,.json,.txt" style={{ display:"none", width:"1em" }} onChange={(ev) => props.onLoadFile(ev.target)}/>
			</div>
			
		</div>
		
		<div style={{ height:"1em" }}/>
		
		<div>
			<select value={0} onChange={ (ev) => props.onLoadExample(ev.target.value) }>
				<option value={""}>Load an example...</option>
				{ examples.map(ex => <option key={ex} value={ex}>{ex}</option>) }
			</select>
		</div>
	</div>
}


function MarkerToolbox(props)
{
	const tonicPitches = [0, 7, 2, 9, 4, 11, 5]
	const tonicPitchNames = ["C", "G", "D", "A", "E", "B", "F"]
	const accidentals = [-2, -1, 0, 1, 2]
	const accidentalNames = ["♭♭", "♭", "♮", "♯", "♯♯"]
	const songKeyScaleIndex = getScaleIndexFromPitches(props.songKey.scalePitches)
	
	const modifyKeyChange = (changes) => props.onModifyKeyChange(ch => ch.withChanges({ key: ch.key.withChanges(changes) }))
	
	return <div style={{ display:"grid", gridTemplate:"auto 1fr / auto auto 1fr", gridGap:"0.25em 0.25em", gridAutoFlow:"row", alignItems:"center", justifyItems:"left", padding:"0.5em" }}>
		<KeyChangeToolbox {...props}/>
		<MeterChangeToolbox {...props}/>
	</div>
}


function KeyChangeToolbox(props)
{
	const tonicPitches = [0, 7, 2, 9, 4, 11, 5]
	const tonicPitchNames = ["C", "G", "D", "A", "E", "B", "F"]
	const accidentals = [-2, -1, 0, 1, 2]
	const accidentalNames = ["♭♭", "♭", "♮", "♯", "♯♯"]
	const songKeyScaleIndex = getScaleIndexFromPitches(props.songKey.scalePitches)
	
	const modifyKeyChange = (changes) => props.onModifyKeyChange(ch => ch.withChanges({ key: ch.key.withChanges(changes) }))
	
	return <div style={{ display:"grid", gridTemplate:"auto auto 1fr / auto", gridGap:"0.25em 0.25em", gridAutoFlow:"row", alignItems:"center", justifyItems:"left" }}>
		
		<div>
			<div style={{ backgroundColor:"#fdf", padding:"0.5em" }}>
				<span>Key Change</span>
				<br/>
				<button onClick={props.onInsertKeyChange}>Insert New</button>
				<br/>
				<br/>
				<span>Current:</span>
				<br/>
				<select value={props.songKey.tonicPitch} style={{ height:"2em" }} onChange={(ev) => modifyKeyChange({ tonicPitch: parseInt(ev.target.value) })}>
					{ tonicPitches.map((tonicPitch, i) => <option key={i} value={tonicPitch}>{ tonicPitchNames[i] }</option>) } 
				</select>
				<select value={props.songKey.tonicAccidental} style={{ height:"2em" }} onChange={(ev) => modifyKeyChange({ tonicAccidental: parseInt(ev.target.value) })}>
					{ accidentals.map((accidental, i) => <option key={i} value={accidental}>{ accidentalNames[i] }</option>) } 
				</select>
				<select value={songKeyScaleIndex} style={{ height:"2em" }} onChange={(ev) => modifyKeyChange({ scalePitches: scales[ev.target.value].pitches })}>
					{ scales.map((scale, i) => <option key={i} value={i}>{ scale.name }</option>) } 
				</select>
			</div>
		</div>
		
	</div>
}


function MeterChangeToolbox(props)
{
	const meterDenominators = [1, 2, 4, 8, 16, 32, 64]
	
	const modify = (changes) => props.onModifyMeterChange(ch => ch.withChanges({ meter: ch.meter.withChanges(changes) }))
	
	return <div style={{ display:"grid", gridTemplate:"auto auto 1fr / auto", gridGap:"0.25em 0.25em", gridAutoFlow:"row", alignItems:"center", justifyItems:"left" }}>
		
		<div>
			<div style={{ backgroundColor:"#def", padding:"0.5em" }}>
				<span>Meter Change</span>
				<br/>
				<button onClick={props.onInsertMeterChange}>Insert New</button>
				<br/>
				<br/>
				<span>Current:</span>
				<br/>
				<input type="number" value={props.songMeter.numerator} onKeyDown={(ev) => ev.stopPropagation()} min="1" max="64" onChange={(ev) => modify({ numerator: Math.max(1, Math.min(64, ev.target.value)) })} style={{ width:"3em", height:"2em" }}/>
				<span>{ " / " }</span>
				<select value={props.songMeter.denominator} style={{ height:"2em" }} onChange={(ev) => modify({ denominator: parseInt(ev.target.value) })}>
					{ meterDenominators.map(denominator => <option key={denominator} value={denominator}>{ denominator.toString() }</option>) } 
				</select>
			</div>
		</div>
		
	</div>
}


function LengthToolbox(props)
{
	const LengthButton = (props) =>
	{
		return <span style={{ display:"inline-block", width:"60px", height:"20px", marginRight:"2px", backgroundColor:"black", borderRadius:"3px" }}>
		
		</span>
	}
	
	return null
	
	return <div>
		Length: <LengthButton/>
		<LengthButton/>
		<LengthButton/>
		<LengthButton/>
	</div>
}


function NoteToolbox(props)
{
	const NoteButton = (props2) =>
	{
		const finalPitch = props2.pitch + props.songKey.tonicPitch + props.songKey.tonicAccidental
		const degree = getScaleDegreeForPitch(props.songKey, finalPitch)
		const inKey = Math.floor(degree) == degree
		const noteName = getNameForPitch(props.songKey, finalPitch)
		const colorRotation = getColorRotationForScale(props.songKey.scalePitches)
		
		const ref = React.createRef()
		
		const w = 42
		const h = 58
		const m = 4
		
		React.useEffect(() =>
		{
			const ctx = ref.current.getContext("2d")
			ctx.fillStyle = getFillStyleForScaleDegree(ctx, degree + colorRotation)
			ctx.fillRect(0, 0, w, h)
		})
		
		return (
			<div style={{ display:"inline-block", top:(!inKey ? "0" : "20px"), opacity:(!inKey ? "0.5" : "1"), position:"relative", width:(w + "px"), height:(h + "px"), margin:"0.1em" }}>
				<canvas ref={ref} width={w.toString()} height={h.toString()} style={{ position:"absolute", top:"0", left:"0", width:(w + "px"), height:(h + "px") }}/>
				<button
					style={{ position:"absolute", top:(m + "px"), left:(m + "px"), width:((w - m - m) + "px"), height:((h - m - m) + "px"), opacity:"0.9" }}
					onClick={ () => props.onSelectNote(finalPitch) }>
			
					<span>{ noteName }</span>
					{ !inKey ? null : <br/> }				
					{ !inKey ? null : <span>{ "(" + (mod(degree, 7) + 1) + ")" }</span> }				
				</button>
			</div>
		)
	}
	
	return <div style={{ display:"grid", gridTemplate:"auto auto 1fr / auto", gridGap:"0.25em 0.25em", gridAutoFlow:"row", alignItems:"center", justifyItems:"left", padding:"0.5em" }}>
		<span>{ "Notes in " + props.songKey.getName() }</span>
		<div>{ [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(pitch => <NoteButton key={pitch} pitch={pitch}/>) }</div>
	</div>
}


function ChordToolbox(props)
{
	const state = props.state[0]
	const setState = (newState) => props.state[1]({ ...state, ...newState })
	
	if (state == null)
	{
		setState({
			kindDropdown: -1,
			mainTab: 0,
			accidentalTab: 0,
			inKeyType: 0,
			embelishments: {}
		})
		return null
	}
	
	const ChordButton = (props2) =>
	{
		const refChord = React.createRef()
		const refPitches = []
		for (let i = 0; i < 10; i++)
			refPitches.push(React.createRef())
		
		const pitches = props2.chord.getPitches().map(p => mod(p - props2.chord.rootPitch - props2.chord.rootAccidental, 12))
		pitches.sort((a, b) => b - a)
		
		const pitchW = 35
		const pitchH = 20
		
		React.useEffect(() =>
		{
			const ctxChord = refChord.current.getContext("2d")
			drawChordOnCanvas(ctxChord, new Rect(0, 0, 80, 58), props2.chord, props.songKey, false, false)
			
			for (let i = 0; i < pitches.length; i++)
			{
				const pitch = pitches[i] + props2.chord.rootPitch + props2.chord.rootAccidental
				const degree = getScaleDegreeForPitch(props.songKey, pitch)
				const noteName = getNameForPitch(props.songKey, pitch)
				const colorRotation = getColorRotationForScale(props.songKey.scalePitches)
				
				const ctxPitch = refPitches[i].current.getContext("2d")
				ctxPitch.fillStyle = getFillStyleForScaleDegree(ctxPitch, degree + colorRotation)
				ctxPitch.fillRect(0, 0, pitchW, pitchH)
				
				ctxPitch.fillStyle = "#fff"
				ctxPitch.globalAlpha = 0.6
				ctxPitch.fillRect(3, 3, pitchW - 6, pitchH - 6)
				
				ctxPitch.globalAlpha = 1
				ctxPitch.font = "14px Verdana"
				ctxPitch.fillStyle = "#000"
				ctxPitch.textAlign = "center"
				ctxPitch.textBaseline = "middle"
				ctxPitch.fillText(noteName, pitchW / 2, pitchH / 2 + 1)
			}
		})
		
		return <div style={{ display:"inline-block", textAlign:"center" }}>
			<canvas ref={refChord} width="80" height="58" onClick={ () => props.onSelectChord(props2.chord) } style={{ width:"80px", height:"58px", margin:"0.1em" }}/>
			{ pitches.map((pitch, i) =>
				<React.Fragment key={i}>
					<br/>
					<canvas ref={refPitches[i]} width={pitchW} height={pitchH} style={{ width:(pitchW + "px"), height:(pitchH + "px"), margin:"0.05em" }}/>
				</React.Fragment>
			)}
		</div>
	}
	
	const KindDropdown = () =>
	{
		return <select value={state.kindDropdown} style={{ height:"2em" }} onChange={ (ev) => setState({ kindDropdown: parseInt(ev.target.value) }) }>
		
			<option value={-1}>In Key</option>
			
			{ chords.map((chord, index) =>
				<React.Fragment key={index}>
					{ chord.startGroup ? <optgroup label={chord.startGroup}/> : null }
					<option value={index}>
						{ (chord.symbol[0] ? "i" : "I") + chord.symbol[1] + (chord.symbol[2] || "") }
					</option>
				</React.Fragment>
			)}
			
		</select>
	}
	
	let chordButtons = null
	let title = null
	switch (state.kindDropdown)
	{
		case -1:
			title = "Chords in " + props.songKey.getName()
			chordButtons = [0, 1, 2, 3, 4, 5, 6].map(degree =>
			{
				const root = getPitchForScaleDegree(props.songKey, degree)
				
				let pitches = [0]
				pitches.push(getPitchForScaleDegree(props.songKey, degree + 2) - root)
				pitches.push(getPitchForScaleDegree(props.songKey, degree + 4) - root)
				
				if (state.inKeyType >= 1)
					pitches.push(getPitchForScaleDegree(props.songKey, degree + 6) - root)
				
				if (state.inKeyType >= 2)
					pitches.push(getPitchForScaleDegree(props.songKey, degree + 8) - root)
				
				if (state.inKeyType >= 3)
					pitches.push(getPitchForScaleDegree(props.songKey, degree + 10) - root)
				
				if (state.inKeyType >= 4)
					pitches.push(getPitchForScaleDegree(props.songKey, degree + 12) - root)
				
				const kind = getChordKindFromPitches(pitches)
				
				return <ChordButton key={degree} chord={ new Chord(root, 0, kind, state.embelishments) }/>
			})
			break
			
		default:
			title = chords[state.kindDropdown].name + " chords"
			chordButtons = <React.Fragment>
				{ [0, 1, 2, 3, 4, 5, 6].map(degree => {
					const kind = getChordKindFromPitches(chords[state.kindDropdown].pitches)
					const root = getPitchForScaleDegree(props.songKey, degree)
					
					return <ChordButton key={degree} chord={ new Chord(root, state.accidentalTab, kind, state.embelishments) }/>
				})}
			</React.Fragment>
			break
	}
	
	const EmbelishmentCheckbox = (props2) =>
	{
		const fieldName = props2.value || props2.label
		
		const setField = (checked) =>
		{
			let embelishments = { ...state.embelishments }
			if (checked)
				embelishments[fieldName] = true
			else
				delete embelishments[fieldName]
			
			setState({ embelishments })
		}
		
		return <React.Fragment>
			<input id={props2.label} type="checkbox" style={{ margin:"0.25em", padding:"0" }} checked={ state.embelishments[fieldName] } onChange={ (ev) => setField(ev.target.checked) }/>
			<label htmlFor={props2.label}>{props2.label}</label>
		</React.Fragment>
	}
	
	const RadioButton = (props2) =>
	{
		return <React.Fragment>
			<input id={props2.label} type="radio" style={{ margin:"0.25em", padding:"0" }} disabled={ props2.disabled } checked={ props2.current == props2.value } onChange={ (ev) => props2.setCurrent(props2.value) }/>
			<label htmlFor={props2.label}>{props2.label}</label>
		</React.Fragment>
	}
	
	return <div style={{ height:"auto", display:"grid", gridTemplate:"auto auto auto 1fr / auto auto", gridGap:"0.25em 0.25em", gridAutoFlow:"row", justifyItems:"left", padding:"0.5em" }}>
		
		<div>
			<TabButton value={0} current={state.mainTab} setCurrent={(i) => setState({ mainTab: i })}>{ title }</TabButton>
			<TabButton value={1} current={state.mainTab} setCurrent={(i) => setState({ mainTab: i })}>Search</TabButton>
		</div>
		
		<div/>
		
		{ state.mainTab != 0 ? null :
			<div>{ chordButtons }</div>
		}
		
		{ state.mainTab != 0 ? null :
			<div>
				<div style={{ display:"grid", gridTemplate:"auto 1fr / auto auto auto 1fr", gridGap:"0.25em 0.25em", gridAutoFlow:"row", justifyItems:"left", textAlign:"left" }}>
					<div>
						<KindDropdown/>
						<br/>
						<RadioButton label="♭" value={-1} current={state.accidentalTab} setCurrent={(i) => setState({ accidentalTab: i })} disabled={state.kindDropdown < 0}/><br/>
						<RadioButton label="♮" value={0} current={state.accidentalTab} setCurrent={(i) => setState({ accidentalTab: i })} disabled={state.kindDropdown < 0}/><br/>
						<RadioButton label="♯" value={1} current={state.accidentalTab} setCurrent={(i) => setState({ accidentalTab: i })} disabled={state.kindDropdown < 0}/><br/>
					</div>
					
					<div style={{ paddingLeft:"0.5em" }}>
						<RadioButton label="5"  value={0} current={state.inKeyType} setCurrent={(i) => setState({ inKeyType: i })} disabled={state.kindDropdown >= 0}/><br/>
						<RadioButton label="7"  value={1} current={state.inKeyType} setCurrent={(i) => setState({ inKeyType: i })} disabled={state.kindDropdown >= 0}/><br/>
						<RadioButton label="9"  value={2} current={state.inKeyType} setCurrent={(i) => setState({ inKeyType: i })} disabled={state.kindDropdown >= 0}/><br/>
						<RadioButton label="11" value={3} current={state.inKeyType} setCurrent={(i) => setState({ inKeyType: i })} disabled={state.kindDropdown >= 0}/><br/>
						<RadioButton label="13" value={4} current={state.inKeyType} setCurrent={(i) => setState({ inKeyType: i })} disabled={state.kindDropdown >= 0}/><br/>
					</div>
					
					<div style={{ paddingLeft:"0.5em" }}>
						<EmbelishmentCheckbox label="sus2"/><br/>
						<EmbelishmentCheckbox label="sus4"/><br/>
						<EmbelishmentCheckbox label="add9"/><br/>
						<EmbelishmentCheckbox label="add11"/><br/>
						<EmbelishmentCheckbox label="add13"/><br/>
						<EmbelishmentCheckbox label="no3"/><br/>
						<EmbelishmentCheckbox label="no5"/><br/>
					</div>
				</div>
			</div>
		}
		
	</div>
		
	/*
		<table style={{ margin:"auto" }}><tbody>
			<tr>
				<td>
				</td>
				<td>
				</td>
				<td>
					<span style={{ fontWeight:"bold" }}>{ props.songKey.getName() }</span>
				</td>
			</tr>
			<tr>
				<td>
					<AllChordsMenu/>
				</td>
				<td>
					<table><tbody><tr>
						{ allChordsKind >= 0 ? null : 
							<td><table style={{ textAlign:"left" }}><tbody>
								<RadioButton label="5"  value={0} variable={inKeyChordType} onClick={setInKeyChordType}/>
								<RadioButton label="7"  value={1} variable={inKeyChordType} onClick={setInKeyChordType}/>
								<RadioButton label="9"  value={2} variable={inKeyChordType} onClick={setInKeyChordType}/>
								<RadioButton label="11" value={3} variable={inKeyChordType} onClick={setInKeyChordType}/>
								<RadioButton label="13" value={4} variable={inKeyChordType} onClick={setInKeyChordType}/>
							</tbody></table></td>
						}
						<td><table style={{ textAlign:"left" }}><tbody>
							<Checkbox label="sus2"  value={0} variable={sus2}  onClick={setSus2}/>
							<Checkbox label="sus4"  value={0} variable={sus4}  onClick={setSus4}/>
							<Checkbox label="add9"  value={0} variable={add9}  onClick={setAdd9}/>
							<Checkbox label="add11" value={1} variable={add11} onClick={setAdd11}/>
							<Checkbox label="add13" value={2} variable={add13} onClick={setAdd13}/>
							<Checkbox label="no3"   value={3} variable={no3}   onClick={setNo3}/>
							<Checkbox label="no5"   value={4} variable={no5}   onClick={setNo5}/>
						</tbody></table></td>
					</tr></tbody></table>
				</td>
				<td>
					{ chordButtons }
				</td>
			</tr>
		</tbody></table>
	</div>*/
}


export function Toolbox(props)
{
	const realKeyChange = props.editor.song.keyChanges.findActiveAt(props.editor.cursorTime.start)
	const keyChange = realKeyChange || new KeyChange(new Rational(0), new Key(0, 0, scales[0].pitches))
	
	const realMeterChange = props.editor.song.meterChanges.findActiveAt(props.editor.cursorTime.start)
	const meterChange = realMeterChange || new MeterChange(new Rational(0), new Meter(4, 4))
	
	const onNew = () => generateBlankURL()
	const onGenerateURL = () => generateURL(props.editor.song)
	const onSaveJSONString = () => saveJSONString(props.editor.song)
	const onLoadJSONString = () => loadJSONString(props.editor)
	const onLoadFile = (elem) => loadFile(props.editor, elem)
	const onLoadExample = (name) => loadExample(props.editor, name)
	const onPlaybackToggle = () => props.editor.setPlayback(!props.editor.playing)
	const onRewind = () => props.editor.rewind()
	const onSetBpm = (bpm) => props.editor.setSong(props.editor.song.withChanges({ baseBpm: bpm }))
	const onSelectNote = (pitch) => props.editor.insertNoteAtCursor(pitch)
	const onSelectChord = (chord) => props.editor.insertChordAtCursor(chord)
	const onInsertKeyChange = () => props.editor.insertKeyChangeAtCursor(new Key(0, 0, scales[0].pitches))
	const onModifyKeyChange = (modifyFn) => { if (realKeyChange) props.editor.setSong(props.editor.song.upsertKeyChange(modifyFn(realKeyChange))) }
	const onInsertMeterChange = () => props.editor.insertMeterChangeAtCursor(new Meter(4, 4))
	const onModifyMeterChange = (modifyFn) => { if (realMeterChange) props.editor.setSong(props.editor.song.upsertMeterChange(modifyFn(realMeterChange))) }
	
	const [mainTabCurrent, setMainTabCurrent] = React.useState(0)
	const [chordToolboxState, setChordToolboxState] = React.useState(null)
	
	const callbacks =
	{
		onNew,
		onGenerateURL,
		onSaveJSONString,
		onLoadJSONString,
		onLoadFile, onLoadExample,
		onPlaybackToggle,
		onRewind,
		onSetBpm,
		onSelectNote,
		onSelectChord,
		onInsertKeyChange, onModifyKeyChange,
		onInsertMeterChange, onModifyMeterChange,
	}
	
	return <div style={{ fontFamily:"Verdana", fontSize:"12px", textAlign:"left" }}>
		<div style={{ display:"grid", gridTemplate:"auto 1fr / auto 1fr", gridAutoFlow:"row", alignItems:"top", justifyItems:"left" }}>
			
			<div/>
			
			<div style={{ borderLeft:"1px solid gray", padding:"0.5em" }}>
				<TabButton current={mainTabCurrent} setCurrent={setMainTabCurrent} value={0}>Editor</TabButton>
				<TabButton current={mainTabCurrent} setCurrent={setMainTabCurrent} value={1}>Tools</TabButton>
				<TabButton current={mainTabCurrent} setCurrent={setMainTabCurrent} value={2}>Options</TabButton>
			</div>
			
			<PlaybackToolbox editor={ props.editor } {...callbacks}/>
			
			<div style={{ borderLeft:"1px solid gray" }}>
				{ mainTabCurrent != 0 ? null :
					<div>
						{ props.editor.cursorTrack.start != 0 ? null : <MarkerToolbox songKey={ keyChange.key } songMeter={ meterChange.meter } {...callbacks}/> }
						{ props.editor.cursorTrack.start != 1 ? null : <NoteToolbox songKey={ keyChange.key } {...callbacks}/> }
						{ props.editor.cursorTrack.start != 2 ? null : <ChordToolbox songKey={ keyChange.key } state={[chordToolboxState, setChordToolboxState]} {...callbacks}/> }
					</div>
				}
			</div>
		</div>
	</div>
}


export let askBeforeUnload = true


function generateBlankURL()
{
	askBeforeUnload = true
	window.location = location.protocol + "//" + location.host + location.pathname
}


function generateURL(song)
{
	askBeforeUnload = false
	const songData = song.toCompressedURLSafe()
	window.location = location.protocol + "//" + location.host + location.pathname + "?song=" + songData
}


function saveJSONString(song)
{
	const songData = song.getJSON()
	const newWindow = window.open()
	newWindow.document.write("<code style='white-space:pre'>")
	newWindow.document.write(songData)
	newWindow.document.write("</code>")
}


function loadJSONString(editor)
{
	const str = window.prompt("Paste JSON song data:", "")
	if (str == null)
		return
	
	const json = JSON.parse(str)
	editor.setSong(Song.fromJSON(json))
	editor.rewind()
}


function loadFile(editor, elem)
{
	if (elem.files.length != 1)
		return
	
	let reader = new FileReader()
	reader.readAsArrayBuffer(elem.files[0])
	reader.onload = () => 
	{
		const bytes = new Uint8Array(reader.result)
		if (bytes[0] == "M".charCodeAt(0) &&
			bytes[1] == "T".charCodeAt(0) &&
			bytes[2] == "h".charCodeAt(0) &&
			bytes[3] == "d".charCodeAt(0))
			loadMIDI(editor, elem)
		else
			loadJSON(editor, elem)
	}
}


function loadJSON(editor, elem)
{
	if (elem.files.length != 1)
		return
	
	let reader = new FileReader()
	reader.readAsText(elem.files[0])
	reader.onload = () => 
	{
		const json = JSON.parse(reader.result)
		editor.setSong(Song.fromJSON(json))
		editor.rewind()
	}
}


function loadMIDI(editor, elem)
{
	if (elem.files.length != 1)
		return
	
	let reader = new FileReader()
	reader.readAsArrayBuffer(elem.files[0])
	reader.onload = () => 
	{
		const bytes = new Uint8Array(reader.result)
		editor.setSong(Song.fromMIDI(bytes))
		editor.rewind()
	}
}


function loadExample(editor, name)
{
	if (name == "")
		return
	
	fetch("examples/" + name + ".json")
		.then(res => res.json())
		.then(json =>
		{
			editor.setSong(Song.fromJSON(json))
			editor.rewind()
		})
}