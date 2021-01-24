import * as Playback from "./index"
import * as Project from "../project"


export class SynthManager
{
    audioCtx: BaseAudioContext
	nodeGain: GainNode
	nodeCompressor: DynamicsCompressorNode

	trackInstruments: Map<Project.ID, Playback.Instrument>


	constructor(toBuffer?: boolean, bufferLen?: number, bufferSampleRate?: number)
	{
		this.trackInstruments = new Map<Project.ID, Playback.Instrument>()
		
		if (toBuffer)
		{
			this.audioCtx = new OfflineAudioContext(2, bufferLen!, bufferSampleRate!)
		}
		else
		{
			this.audioCtx = new AudioContext()
		}

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
			if (track.trackType != "notes" && track.trackType != "chords")
				continue

			let instrument = null
			switch (track.instrument.type)
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


	async destroy()
	{
		if (this.audioCtx instanceof AudioContext)
			await this.audioCtx.close()
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


	playNote(request: Playback.NoteRequest)
	{
		const instrument = this.trackInstruments.get(request.trackId)
		if (!instrument)
			return

		instrument.playNote(request)
	}
}