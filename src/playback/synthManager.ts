import * as Synth from "./index"
import { NotePlayback } from "./synthInstrument"


export interface NoteEvent
{
    frequency: number
    volume: number
	playback: NotePlayback
}


export class Manager
{
    audioCtx: AudioContext
	audioCtxOutput: GainNode

	instrument: Synth.Instrument

	noteEvents: NoteEvent[]


	constructor()
	{
		this.audioCtx = new AudioContext()
		this.noteEvents = []
		
		this.audioCtxOutput = this.audioCtx.createGain()
		this.audioCtxOutput.connect(this.audioCtx.destination)
		this.audioCtxOutput.gain.value = 0.5
		
		this.instrument = new Synth.Instrument(this,
		[
			[  55.0, "audio/piano/a1.mp3"],
			[ 110.0, "audio/piano/a2.mp3"],
			[ 220.0, "audio/piano/a3.mp3"],
			[ 440.0, "audio/piano/a4.mp3"],
			[ 880.0, "audio/piano/a5.mp3"],
			[1760.0, "audio/piano/a6.mp3"],
			//[3520.0, "audio/piano/a7.mp3"]
		])
	}
	
	
	isFinished()
	{
		return this.noteEvents.length == 0
	}


	play()
	{
		
	}


	stopAll()
	{
		
		for (let i = 0; i < this.noteEvents.length; i++)
			this.noteEvents[i].playback.stop()
		
		this.noteEvents = []
	}


	process(deltaTimeMs: number)
	{
		// Update audio output.
		for (let i = this.noteEvents.length - 1; i >= 0; i--)
		{
			if (this.noteEvents[i].playback.process(deltaTimeMs))
				this.noteEvents.splice(i, 1)
		}
	}


	playNote(frequency: number, volume: number)
	{
		if (!isFinite(frequency))
			return
		
		for (const noteEvent of this.noteEvents)
		{
			if (noteEvent.frequency == frequency)
				noteEvent.playback.stop()
		}
		
		this.noteEvents.push(
		{
			frequency,
			volume,
			playback: this.instrument.playNote(frequency, volume),
		})
	}


	releaseNote(frequency: number)
	{
		if (!isFinite(frequency))
			return

		for (const noteEvent of this.noteEvents)
		{
			if (noteEvent.frequency == frequency)
				noteEvent.playback.release()
		}
	}
}