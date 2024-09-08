import * as Playback from "./index"
import * as Project from "../project"
import * as MathUtils from "../util/mathUtils"


export class SynthManager
{
    audioCtx: BaseAudioContext
	nodeCompressor: DynamicsCompressorNode
	nodeGlobalVolume: GainNode
	nodeTrackVolumes: GainNode[]

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

		this.nodeGlobalVolume = this.audioCtx.createGain()
		this.nodeGlobalVolume.gain.value = 0.1

		this.nodeCompressor = this.audioCtx.createDynamicsCompressor()
		this.nodeCompressor.threshold.value = -10
		this.nodeCompressor.knee.value = 12
		this.nodeCompressor.ratio.value = 12
		this.nodeCompressor.attack.value = 0
		this.nodeCompressor.release.value = 0.05
		
		this.nodeGlobalVolume.connect(this.nodeCompressor)
		this.nodeCompressor.connect(this.audioCtx.destination)

		this.nodeTrackVolumes = []
	}


	async prepare(project: Project.Root)
	{
		// TODO: Diff instruments and tracks, and only modify what's needed

		for (const [trackId, instrument] of this.trackInstruments)
		{
			instrument.stopAll()
			await instrument.destroy()
		}

		this.trackInstruments.clear()

		for (const nodeTrackVolume of this.nodeTrackVolumes)
			nodeTrackVolume.disconnect()

		this.nodeTrackVolumes = []


		const anySolo = project.tracks.some(tr => tr.solo)

		for (const track of project.tracks)
		{
			if (track.trackType != "notes" && track.trackType != "chords")
				continue

			const trackIsMuted = (anySolo && !track.solo) || (track.mute && !track.solo)

			const trackVolumeNode = this.audioCtx.createGain()
			trackVolumeNode.gain.value = trackIsMuted ? 0 : MathUtils.dbToLinearGain(track.volumeDb)
			trackVolumeNode.connect(this.nodeGlobalVolume)
			this.nodeTrackVolumes.push(trackVolumeNode)
		
			let instrument = null
			switch (track.instrument.type)
			{
				case "basic":
					instrument = new Playback.InstrumentBasic(
						this,
						trackVolumeNode)
					break
				case "sflib":
					instrument = new Playback.InstrumentSflib(
						this,
						trackVolumeNode,
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