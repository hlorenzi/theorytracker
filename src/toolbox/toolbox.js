import React from "react"
import { KeyChange } from "../song/song.js"
import { Key, scales, getScaleDegreeForPitch, getPitchForScaleDegree, getNameForPitch, getColorForScaleDegree, getColorRotationForScale, getChordRecordFromPitches, getRomanNumeralScaleDegreeStr } from "../util/theory.js"
import { Rational } from "../util/rational.js"


function NoteToolbox(props)
{
	return <div>
		<span>Key: { props.songKey.getName() }</span>
		<br/>
	
		{ [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(pitch =>
			{
				const degree = getScaleDegreeForPitch(props.songKey, pitch + props.songKey.tonicPitch + props.songKey.tonicAccidental)
				const inKey = Math.floor(degree) == degree
				const noteName = getNameForPitch(props.songKey, pitch + props.songKey.tonicPitch + props.songKey.tonicAccidental)
				const colorRotation = getColorRotationForScale(props.songKey.scalePitches)
				const color = getColorForScaleDegree(colorRotation + degree)
				return <button key={pitch} style={{ position:"relative", top:(inKey ? "1em" : "0"), width:"3em", height:"4em", backgroundColor: color, border:"0", borderRadius:"0.25em", margin:"0.1em" }}>
					<span style={{ fontWeight:"bold" }}>{ noteName }</span>					
				</button>
			}
		)}
	
	</div>
}


function ChordToolbox(props)
{
	return <div>
		<span>Key: { props.songKey.getName() }</span>
		<br/>
	
		{ [0, 1, 2, 3, 4, 5, 6].map(degree =>
			{
				const rootPitch = getPitchForScaleDegree(props.songKey, degree)
				const secondPitch = getPitchForScaleDegree(props.songKey, degree + 2)
				const thirdPitch = getPitchForScaleDegree(props.songKey, degree + 4)
				const chordKind = getChordRecordFromPitches([0, secondPitch - rootPitch, thirdPitch - rootPitch])
				const colorRotation = getColorRotationForScale(props.songKey.scalePitches)
				const color = getColorForScaleDegree(colorRotation + degree)
				
				let baseStr = getRomanNumeralScaleDegreeStr(degree, 0)
				if (chordKind.symbol[0])
					baseStr = baseStr.toLowerCase()
				
				baseStr += chordKind.symbol[1]
				
				return <button key={degree} style={{ width:"6em", height:"4em", backgroundColor:"#eee", border:"0", borderTop:"0.5em solid " + color, borderBottom:"0.5em solid " + color, borderRadius:"0.25em", margin:"0.1em" }}>
					<span style={{ fontWeight:"bold" }}>{ baseStr }<sup>{ chordKind.symbol[2] }</sup></span>					
				</button>
			}
		)}
	
	</div>
}


export default function Toolbox(props)
{
	const keyChange = props.editor.song.keyChanges.findActiveAt(props.editor.cursorTime.start) || new KeyChange(new Rational(0), new Key(0, 0, scales.major.pitches))
	
	return <div style={{ fontFamily:"Verdana", fontSize:"18px" }}>
		{ props.editor.cursorTrack.start != 1 ? null : <NoteToolbox songKey={ keyChange.key }/> }
		{ props.editor.cursorTrack.start != 2 ? null : <ChordToolbox songKey={ keyChange.key }/> }
	</div>
}