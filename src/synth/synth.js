import { Instrument } from "./instrument.js"


export class Synth
{
	constructor()
	{
		this.audioCtx     = new AudioContext()
		this.time         = 0
		this.noteEvents   = []
		this.playingNotes = []
		
		this.audioCtxOutput = this.audioCtx.createGain()
		this.audioCtxOutput.connect(this.audioCtx.destination)
		this.audioCtxOutput.gain.value = 0.5
		
		const piano = new Instrument(this,
		[
			[  55.0, "audio/piano/a1.mp3"],
			[ 110.0, "audio/piano/a2.mp3"],
			[ 220.0, "audio/piano/a3.mp3"],
			[ 440.0, "audio/piano/a4.mp3"],
			[ 880.0, "audio/piano/a5.mp3"],
			[1760.0, "audio/piano/a6.mp3"],
			//[3520.0, "audio/piano/a7.mp3"]
		])
		
		this.instruments = [piano, piano]
	}
	
	
	isFinished()
	{
		return this.noteEvents.length == 0 && this.playingNotes.length == 0
	}


	play()
	{
		this.noteEvents.sort(function (a, b) { return a.time - b.time })
	}


	stopAll()
	{
		this.time = 0
		this.noteEvents = []
		
		for (let i = 0; i < this.playingNotes.length; i++)
			this.playingNotes[i].stop()
		
		this.playingNotes = []
	}


	process(deltaTime)
	{
		this.time += deltaTime
		
		// Process pending note events up to the current time.
		let noteEventsProcessed = 0
		while (noteEventsProcessed < this.noteEvents.length &&
			this.noteEvents[noteEventsProcessed].time <= this.time)
		{
			const ev = this.noteEvents[noteEventsProcessed]
			noteEventsProcessed++
			
			let noteData =
				this.instruments[ev.instrumentIndex].playNote(ev.frequency, ev.volume, ev.duration)
				
			noteData.process = (deltaTime) =>
			{
				return this.instruments[ev.instrumentIndex].processNote(noteData, deltaTime)
			}
			
			noteData.stop = () =>
			{
				this.instruments[ev.instrumentIndex].stopNote(noteData)
			}
				
			this.playingNotes.push(noteData)
			//console.log("play note " + ev.frequency)
		}
		
		// Remove processed events.
		this.noteEvents.splice(0, noteEventsProcessed)
		
		// Update audio output.
		for (let i = this.playingNotes.length - 1; i >= 0; i--)
		{
			if (this.playingNotes[i].process(deltaTime))
				this.playingNotes.splice(i, 1)
		}
	}


	addNoteEvent(time, instrumentIndex, frequency, volume, duration)
	{
		if (!isFinite(frequency))
			return
		
		this.noteEvents.push(
		{
			time: time + this.time,
			instrumentIndex,
			frequency,
			volume,
			duration
		})
	}
}