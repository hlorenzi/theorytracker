import * as Playback from "./index"
import * as Project from "../project"
import { Instrument } from "../project"


export class SynthManager
{
    audioCtx: AudioContext
	nodeGain: GainNode
	nodeCompressor: DynamicsCompressorNode

	trackInstruments: Map<Project.ID, Playback.Instrument[]>


	constructor()
	{
		this.trackInstruments = new Map<Project.ID, Playback.Instrument[]>()
		
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
		for (const [trackId, instruments] of this.trackInstruments)
			await Promise.all(instruments.map(instr => instr.destroy()))

		this.trackInstruments.clear()

		for (const track of project.tracks)
		{
			if (track.trackType != Project.TrackType.Notes)
				continue

			const newInstruments: Playback.Instrument[] = []
			for (const instrData of track.instruments)
			{
				switch (instrData.instrumentType)
				{
					case "basic":
						newInstruments.push(new Playback.InstrumentBasic(this))
						break
					case "sflib":
						newInstruments.push(new Playback.InstrumentSflib(
							this, instrData.collectionId, instrData.instrumentId))
						break
				}
			}

			await Promise.all(newInstruments.map(instr => instr.prepare()))
			this.trackInstruments.set(track.id, newInstruments)
		}
	}
	
	
	isFinished()
	{
		return false
	}


	play()
	{
		
	}


	stopAll()
	{
		for (const [trackId, instruments] of this.trackInstruments)
			for (const instrument of instruments)
				instrument.stopAll()
	}


	process(deltaTimeMs: number)
	{
		for (const [trackId, instruments] of this.trackInstruments)
			for (const instrument of instruments)
				instrument.process(deltaTimeMs)
	}


	playNote(trackId: Project.ID, noteId: Project.ID, frequency: number, volume: number)
	{
		const instruments = this.trackInstruments.get(trackId)
		if (!instruments)
			return

		for (const instrument of instruments)
			instrument.playNote(noteId, frequency, volume)
	}


	releaseNote(trackId: Project.ID, noteId: Project.ID)
	{
		const instruments = this.trackInstruments.get(trackId)
		if (!instruments)
			return

		for (const instrument of instruments)
			instrument.releaseNote(noteId)
	}
}