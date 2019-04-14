import React from "react"
import { KeyChange } from "../song/song.js"
import { Key, scales, getScaleDegreeForPitch, getNameForPitch, getColorForScaleDegree, getColorRotationForScale } from "../util/theory.js"
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


export default function Toolbox(props)
{
	const keyChange = props.editor.song.keyChanges.findActiveAt(props.editor.cursorTime.start) || new KeyChange(new Rational(0), new Key(0, 0, scales.major.pitches))
	
	return <div style={{ fontFamily:"Verdana", fontSize:"18px" }}><NoteToolbox songKey={ keyChange.key }/></div>
}