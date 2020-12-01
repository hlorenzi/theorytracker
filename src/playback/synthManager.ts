import * as Playback from "./index"
import * as Project from "../project"
import { Instrument } from "../project"


export class SynthManager
{
    audioCtx: AudioContext
	nodeGain: GainNode
	nodeCompressor: DynamicsCompressorNode

	trackInstruments: Map<Project.ID, Playback.Instrument>


	constructor()
	{
		this.trackInstruments = new Map<Project.ID, Playback.Instrument>()
		
		this.audioCtx = new AudioContext()
		this.nodeGain = this.audioCtx.createGain()
		this.nodeGain.gain.value = 0.1

		this.nodeCompressor = this.audioCtx.createDynamicsCompressor()
		this.nodeCompressor.threshold.value = -10
		this.nodeCompressor.knee.value = 12
		this.nodeCompressor.ratio.value = 12
		this.nodeCompressor.attack.value = 0
		this.nodeCompressor.release.value = 0.05
		
		this.nodeGain.connect(this.nodeCompressor)
		this.nodeCompressor.connect(this.audioCtx.destination)
	}


	async prepare(project: Project.Root)
	{
		// TODO: Diff instruments and only modify what's needed

		for (const [trackId, instrument] of this.trackInstruments)
		{
			instrument.stopAll()
			await instrument.destroy()
		}

		this.trackInstruments.clear()

		for (const track of project.tracks)
		{
			if (track.trackType != "notes")
				continue

			let instrument = null
			switch (track.instrument.instrumentType)
			{
				case "basic":
					instrument = new Playback.InstrumentBasic(this)
					break
				case "sflib":
					instrument = new Playback.InstrumentSflib(
						this,
						track.instrument.collectionId,
						track.instrument.instrumentId)
					break
			}

			await instrument.prepare()
			this.trackInstruments.set(track.id, instrument)
		}
	}
	
	
	isFinished()
	{
		for (const [trackId, instrument] of this.trackInstruments)
		{
			if (!instrument.isFinished())
				return false
		}

		return true
	}


	play()
	{
		
	}


	stopAll()
	{
		for (const [trackId, instrument] of this.trackInstruments)
			instrument.stopAll()
	}


	process(deltaTimeMs: number)
	{
		for (const [trackId, instrument] of this.trackInstruments)
			instrument.process(deltaTimeMs)
	}


	playNote(trackId: Project.ID, noteId: Project.ID, frequency: number, volume: number)
	{
		const instrument = this.trackInstruments.get(trackId)
		if (!instrument)
			return

		instrument.playNote(noteId, frequency, volume)
	}


	releaseNote(trackId: Project.ID, noteId: Project.ID)
	{
		const instrument = this.trackInstruments.get(trackId)
		if (!instrument)
			return

		instrument.releaseNote(noteId)
	}
}