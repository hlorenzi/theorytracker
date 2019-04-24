import React from "react"
import ReactDOM from "react-dom"
import { Editor } from "./editor/editor.js"
import { Synth } from "./synth/synth.js"
import { MeterChange } from "./song/song.js"
import Toolbox from "./toolbox/toolbox.js"
import { Rational } from "./util/rational.js"
import { getChordStrummingPattern } from "./util/theory.js"


let gEditor = null
let gSynth = null
let gPlaybackInterval = null
let gPrevPlaybackTimestamp = -1


document.body.onload = function()
{
	gSynth = new Synth()
	gEditor = new Editor(document.getElementById("canvasMain"))
	
	gEditor.toolboxRefreshFn = () =>
	{
		ReactDOM.render(<Toolbox editor={ gEditor }/>, document.getElementById("divToolbox"))
	}
	
	gEditor.onPlaybackToggle = onPlaybackToggle
	
	gEditor.toolboxRefreshFn()
	onResize()
	
	document.body.onresize = (ev) => onResize()
}


function onResize()
{
	const rect = document.getElementById("canvasMain").getBoundingClientRect()
	gEditor.resize(rect.width, rect.height)
}


function onPlaybackToggle(playing)
{
	if (playing)
	{
		feedSongToSynth(gEditor.song, gSynth, Rational.fromFloat(gEditor.playbackTime, new Rational(1, 2048)))
		gSynth.play()
		
		gPrevPlaybackTimestamp = -1
		gPlaybackInterval = window.requestAnimationFrame(onPlaybackStep)
	}
	else
	{
		gSynth.stopAll()
	}
}


function onPlaybackStep(timestamp)
{
	const deltaTime = (gPrevPlaybackTimestamp < 0 ? 0 : timestamp - gPrevPlaybackTimestamp)
	gPrevPlaybackTimestamp = timestamp
	
	if (deltaTime > 0 && deltaTime < 250)
	{
		const measuresPerSecond = (gEditor.song.baseBpm / 4 / 60)
		
		gSynth.process(deltaTime / 1000)
		gEditor.playbackTime += deltaTime / 1000 * measuresPerSecond
		gEditor.scrollPlaybackIntoView(gEditor.playbackTimeRational)
		gEditor.draw()
	}
	
	if (gEditor.playing)
		window.requestAnimationFrame(onPlaybackStep)
}


function feedSongToSynth(song, synth, startTick, useChordPatterns = true)
{
	const chordVolumeMul = 0.5
	
	const midiPitchToHertz = (midiPitch) =>
	{
		return Math.pow(2, (midiPitch - 69) / 12) * 440
	}
	
	const addNoteEvent = (tickStart, duration, instrument, pitch, volume) =>
	{
		const offsetStart = tickStart.subtract(startTick)
		
		const measuresPerSecond = (song.baseBpm / 4 / 60)
		
		let timeStart = offsetStart.asFloat() / measuresPerSecond
		let timeDuration = duration.asFloat() / measuresPerSecond
		
		if (timeStart <= 0)
		{
			timeDuration += timeStart
			timeStart = 0
		}
		
		if (timeDuration <= 0)
			return
		
		//console.log("event note [" + pitch + "] at tick " + tickStart.toString() + " = " + timeStart + " s")
		synth.addNoteEvent(timeStart, instrument, midiPitchToHertz(pitch), volume, timeDuration)
	}
	
	// Register notes.
	for (const note of song.notes.enumerate())
	{
		if (note.range.end.compare(startTick) <= 0)
			continue
		
		addNoteEvent(note.range.start, note.range.duration, 0, note.pitch, 1)
	}
	
	// Register chords.
	for (const chord of song.chords.enumerate())
	{
		if (chord.range.end.compare(startTick) <= 0)
			continue
		
		const pitches = chord.chord.getPitches()
			
		if (!useChordPatterns)
		{
			for (let j = 0; j < pitches.length; j++)
				addNoteEvent(chord.range.start, chord.range.duration, 1, pitches[j], chordVolumeMul)
			
			continue
		}
			
		const meter = song.meterChanges.findActiveAt(chord.range.start) || new MeterChange(startTick, 4, 4)
		const meterBeatLength = meter.getSubmeasureDuration()
		const measureBreak = null//that.forcedMeasures.findActiveAt(chord.range.start)
		
		const pattern = getChordStrummingPattern(meter)
		
		let tick = meter.time
		//if (measureBreak != null)
		//	tick.max(measureBreak.tick)
		
		let skipTick = new Rational(0)
		let patternIndex = 0
		let mustPlayFirstBeat = false
		
		while (tick.compare(chord.range.end) < 0)
		{
			const patternBeat = pattern[patternIndex]
			const patternBeatKind = patternBeat[0]
			let patternBeatLength = patternBeat[1].multiply(meterBeatLength)
			patternIndex = (patternIndex + 1) % pattern.length
			
			let nextTick = tick.add(patternBeatLength)
			if (nextTick.compare(chord.range.end) > 0)
			{
				nextTick = chord.range.end
				patternBeatLength = nextTick.subtract(tick)
			}
			
			// Handle beats after the first one.
			if (tick.compare(chord.range.start) > 0 && skipTick.compare(new Rational(0)) <= 0)
			{
				if (mustPlayFirstBeat)
				{
					mustPlayFirstBeat = false
					for (let j = 0; j < pitches.length; j++)
						addNoteEvent(chord.range.start, tick.subtract(chord.range.start), 1, pitches[j], chordVolumeMul)
				}
				
				switch (patternBeatKind)
				{
					case 0:
					{
						for (let j = 0; j < pitches.length; j++)
							addNoteEvent(tick, patternBeatLength, 1, pitches[j], 0.9 * chordVolumeMul)
						break
					}
					case 1:
					{
						for (let j = 1; j < pitches.length; j++)
							addNoteEvent(tick, patternBeatLength, 1, pitches[j], 0.5 * chordVolumeMul)
						break
					}
					case 2:
					{
						addNoteEvent(tick, patternBeatLength, 1, pitches[0], 0.5 * chordVolumeMul)
						break
					}
				}
			}
			
			skipTick = skipTick.subtract(patternBeatLength)
			
			if (tick.compare(chord.range.start) <= 0 && nextTick.compare(chord.range.start) > 0)
			{
				mustPlayFirstBeat = true
				
				if (!(tick.compare(chord.range.start) == 0 && patternBeatKind == 0))
					skipTick = pattern[0][1].multiply(meterBeatLength)
			}
			
			tick = nextTick
		}
		
		if (mustPlayFirstBeat)
		{
			mustPlayFirstBeat = false
			for (let j = 0; j < pitches.length; j++)
				addNoteEvent(chord.range.start, tick.subtract(chord.range.start), 1, pitches[j], 0.7)
		}
	}
}