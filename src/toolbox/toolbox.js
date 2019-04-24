import React from "react"
import { Song, KeyChange } from "../song/song.js"
import { Key, scales, Chord, chords, getScaleDegreeForPitch, getPitchForScaleDegree, getNameForPitch, getColorForScaleDegree, getColorRotationForScale, getChordKindFromPitches, getRomanNumeralScaleDegreeStr } from "../util/theory.js"
import { Rational } from "../util/rational.js"


function PlaybackToolbox(props)
{
	return <div style={{ display:"grid", gridTemplate:"0fr 0fr / 0fr 0fr 0fr", gridGap:"0.25em 0.25em", gridAutoFlow:"row", alignItems:"center", justifyItems:"center" }}>
		<button style={{ width:"4em", height:"4em" }} onClick={() => props.onPlaybackToggle()}>
			<span style={{ fontSize:"3em" }}>{ props.editor.playing ? "■" : "▶" }</span>
		</button>
		<button style={{ width:"4.5em", height:"3em" }} onClick={() => props.onRewind()}>
			<span style={{ fontSize:"2em" }}>◀◀</span>
		</button>
		<div>
			BPM: <input type="number" value={props.editor.song.baseBpm} onChange={(ev) => props.onSetBpm(ev.target.value)} style={{ width:"5em" }}/>
		</div>
		
		<button onClick={() => props.onSaveJSON()}>
			[Debug] Save JSON
		</button>
		
		<button onClick={() => props.onLoadJSON()}>
			[Debug] Load JSON
		</button>
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
	return <div>
		<LengthToolbox/>
		<span style={{ fontWeight:"bold" }}>{ props.songKey.getName() }</span>
		<br/>
	
		{ [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(pitch =>
			{
				const finalPitch = pitch + props.songKey.tonicPitch + props.songKey.tonicAccidental
				const degree = getScaleDegreeForPitch(props.songKey, finalPitch)
				const inKey = Math.floor(degree) == degree
				const noteName = getNameForPitch(props.songKey, finalPitch)
				const colorRotation = getColorRotationForScale(props.songKey.scalePitches)
				const color = getColorForScaleDegree(colorRotation + degree)
				return <button key={pitch} onClick={ () => props.onSelectNote(finalPitch) } style={{ position:"relative", top:(inKey ? "1em" : "0"), width:"3em", height:"4em", backgroundColor: color, border:"0", borderRadius:"0.25em", margin:"0.1em" }}>
					<span style={{ fontWeight:"bold" }}>{ noteName }</span>					
				</button>
			}
		)}
	
	</div>
}


function ChordToolbox(props)
{
	const [allChordsKind, setAllChordsKind] = React.useState(-1)
	const [allChordsAccidental, setAllChordsAccidental] = React.useState(0)
	const [inKeyChordType, setInKeyChordType] = React.useState(0)
	const [sus2, setSus2] = React.useState(false)
	const [sus4, setSus4] = React.useState(false)
	const [add9, setAdd9] = React.useState(false)
	const [add11, setAdd11] = React.useState(false)
	const [add13, setAdd13] = React.useState(false)
	const [no3, setNo3] = React.useState(false)
	const [no5, setNo5] = React.useState(false)
	
	const ChordButton = (props2) =>
	{
		const color = props2.chord.getColor(props.songKey)
		const baseStr = props2.chord.getNameBase(props.songKey)
		const supStr = props2.chord.getNameSup(props.songKey)
		const subStr = props2.chord.getNameSub(props.songKey)
		
		return <button onClick={ () => props.onSelectChord(props2.chord) } style={{ width:"6em", height:"4em", backgroundColor:"#eee", border:"0", borderTop:"0.5em solid " + color, borderBottom:"0.5em solid " + color, borderRadius:"0.25em", margin:"0.1em" }}>
			<span style={{ fontFamily:"Verdana", fontSize:"20px" }}>{ baseStr }<sup>{ supStr }</sup><sub>{ subStr }</sub></span>					
		</button>
	}
	
	const TabButton = (props2) =>
	{
		return <span onClick={ () => props2.onClick(props2.value) } style={{ minWidth:"2em", display:"inline-block", fontFamily:"Verdana", fontSize:"15px", backgroundColor:(props2.value == props2.variable ? "#ddd" : "#fff"), padding:"0.25em", borderRadius:"0.25em", marginRight:"0.5em", cursor:"pointer" }}>
			{ props2.children }
		</span>
	}
	
	const AllChordsMenu = () =>
	{
		return <select value={allChordsKind} onChange={ (ev) => setAllChordsKind(parseInt(ev.target.value)) }>
			<option value={-1}>In Key</option>
			{
				chords.map((chord, index) =>
				{
					return <React.Fragment key={index}>
						{ chord.startGroup ? <optgroup label={chord.startGroup}/> : null }
						<option value={index}>
							{ (chord.symbol[0] ? "i" : "I") + chord.symbol[1] + (chord.symbol[2] || "") }
						</option>
					</React.Fragment>
				})
			}
		</select>
	}
	
	const AllChordsMatrix = () =>
	{
		let groupIndex = 0
		
		return <div>
		{
			chords.map((chord, index) =>
			{
				if (chord.startGroup)
					groupIndex = 1
				
				return <React.Fragment>
					{ (groupIndex++) % 9 == 0 || chord.startGroup ? <br/> : null }
					<TabButton key={index} value={index} variable={allChordsKind} onClick={setAllChordsKind}>
						{ (chord.symbol[0] ? "i" : "I") + chord.symbol[1] }<sup>{ chord.symbol[2] }</sup>
					</TabButton>
				</React.Fragment>
			})
		}
		</div>
	}
				
	let modifiers = {}
	if (sus2) modifiers.sus2 = true
	if (sus4) modifiers.sus4 = true
	if (add9) modifiers.add9 = true
	if (add11) modifiers.add11 = true
	if (add13) modifiers.add13 = true
	if (no3) modifiers.no3 = true
	if (no5) modifiers.no5 = true
	
	let chordButtons = null
	
	switch (allChordsKind)
	{
		case -1:
			chordButtons = [0, 1, 2, 3, 4, 5, 6].map(degree =>
			{
				const root = getPitchForScaleDegree(props.songKey, degree)
				
				let pitches = [0]
				pitches.push(getPitchForScaleDegree(props.songKey, degree + 2) - root)
				pitches.push(getPitchForScaleDegree(props.songKey, degree + 4) - root)
				
				if (inKeyChordType >= 1)
					pitches.push(getPitchForScaleDegree(props.songKey, degree + 6) - root)
				
				if (inKeyChordType >= 2)
					pitches.push(getPitchForScaleDegree(props.songKey, degree + 8) - root)
				
				if (inKeyChordType >= 3)
					pitches.push(getPitchForScaleDegree(props.songKey, degree + 10) - root)
				
				if (inKeyChordType >= 4)
					pitches.push(getPitchForScaleDegree(props.songKey, degree + 12) - root)
				
				const kind = getChordKindFromPitches(pitches)
				
				return <ChordButton key={degree} chord={ new Chord(root, 0, kind, modifiers) }/>
			})
			break
			
		default:
			chordButtons = <React.Fragment>
				<TabButton value={-1} variable={allChordsAccidental} onClick={setAllChordsAccidental}>♭</TabButton>
				<TabButton value={ 0} variable={allChordsAccidental} onClick={setAllChordsAccidental}>♮</TabButton>
				<TabButton value={ 1} variable={allChordsAccidental} onClick={setAllChordsAccidental}>♯</TabButton>
				<br/>
				{ [0, 1, 2, 3, 4, 5, 6].map(degree => {
					const kind = getChordKindFromPitches(chords[allChordsKind].pitches)
					const root = getPitchForScaleDegree(props.songKey, degree)
					
					return <ChordButton key={degree} chord={ new Chord(root, allChordsAccidental, kind, modifiers) }/>
				})}
			</React.Fragment>
			break
	}
	
	const Checkbox = (props2) =>
	{
		return <tr><td><input id={props2.label} type="checkbox" style={{ margin:"0", padding:"0" }} checked={ props2.variable } onChange={ (ev) => props2.onClick(ev.target.checked) }/></td><td><label htmlFor={props2.label}>{props2.label}</label></td></tr>
	}
	
	const RadioButton = (props2) =>
	{
		return <tr><td><input id={props2.label} type="radio" style={{ margin:"0", padding:"0" }} checked={ props2.value == props2.variable } onChange={ () => props2.onClick(props2.value) }/></td><td><label htmlFor={props2.label}>{props2.label}</label></td></tr>
	}
	
	return <div style={{ fontSize:"15px" }}>
		<LengthToolbox/>
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
	</div>
}


export default function Toolbox(props)
{
	const keyChange = props.editor.song.keyChanges.findActiveAt(props.editor.cursorTime.start) || new KeyChange(new Rational(0), new Key(0, 0, scales[0].pitches))
	
	const onSaveJSON = () => saveJSON(props.editor.song)
	const onLoadJSON = () => loadJSON(props.editor)
	const onPlaybackToggle = () => props.editor.setPlayback(!props.editor.playing)
	const onRewind = () => props.editor.rewind()
	const onSetBpm = (bpm) => props.editor.setSong(props.editor.song.withChanges({ baseBpm: bpm }))
	const onSelectNote = (pitch) => props.editor.insertNoteAtCursor(pitch)
	const onSelectChord = (chord) => props.editor.insertChordAtCursor(chord)
	
	const callbacks =
	{
		onSaveJSON,
		onLoadJSON,
		onPlaybackToggle,
		onRewind,
		onSetBpm,
		onSelectNote,
		onSelectChord,
	}
	
	return <div style={{ fontFamily:"Verdana", fontSize:"18px" }}>
		<div style={{ display:"grid", gridTemplate:"0fr / 0fr 1fr", gridGap:"0.25em 0.25em", gridAutoFlow:"row", alignItems:"top", justifyItems:"center" }}>
			<PlaybackToolbox editor={ props.editor } {...callbacks}/>
			{ props.editor.cursorTrack.start != 1 ? null : <NoteToolbox songKey={ keyChange.key } {...callbacks}/> }
			{ props.editor.cursorTrack.start != 2 ? null : <ChordToolbox songKey={ keyChange.key } {...callbacks}/> }
		</div>
	</div>
}


function saveJSON(song)
{
	const songData = song.getJSON()
	const newWindow = window.open()
	newWindow.document.write("<code style='white-space:pre'>")
	newWindow.document.write(songData)
	newWindow.document.write("</code>")
}


function loadJSON(editor)
{
	const str = window.prompt("Paste JSON song data:", "")
	if (str == null)
		return
	
	const json = JSON.parse(str)
	editor.setSong(Song.fromJSON(json))
	editor.rewind()
}