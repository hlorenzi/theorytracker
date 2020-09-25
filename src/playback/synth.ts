import Project from "../project/project2"
import { sflibGetInstrument } from "./libraryCache"
import { AppState } from "../AppState"
import { SflibMeta } from "./library"
import { InstrumentSflib } from "./instrumentSflib"


interface NoteEvent
{
    trackId: number
    time: number
    midiPitch: number
    volume: number
    duration: number
}


interface PlayingNote
{
    event: NoteEvent
    remainingDuration: number
}


export class Synth
{
    audioCtx: AudioContext
    audioCtxOutput: GainNode
    audioTracks: InstrumentSflib[]

    cachedTracks: Project.Track[] = []

	time: number
	noteEvents: NoteEvent[]
	playingNotes: PlayingNote[]


	constructor()
	{
        this.audioCtx = new AudioContext()
        this.audioTracks = []

		this.audioCtxOutput = this.audioCtx.createGain()
		this.audioCtxOutput.connect(this.audioCtx.destination)
		this.audioCtxOutput.gain.value = 0.25
		
		this.time = 0
		this.noteEvents = []
		this.playingNotes = []
    }


    destroy()
    {
        this.audioCtx.close()
    }


    reset()
    {
    }
    

    async prepare(sflibMeta: SflibMeta, project: Project)
    {
        await this.audioCtx.audioWorklet.addModule("/build/sflibWorklet.js")

        if (this.cachedTracks !== project.tracks)
        {
            for (const audioTrack of this.audioTracks)
                audioTrack.destroy()

            this.audioTracks = []
            
            for (const track of project.tracks)
            {
                if (track.trackType == Project.TrackType.Notes)
                {
                    const trackNotes = <Project.TrackNotes>track
                    if (trackNotes.instrument.instrumentType == Project.TrackInstrumentType.Sflib)
                    {
                        const audioTrack = new InstrumentSflib(this, track.id)
                        await audioTrack.prepare(sflibMeta, <Project.TrackInstrumentSflib>trackNotes.instrument)
                        this.audioTracks.push(audioTrack)
                    }
                }
            }
        }

        this.cachedTracks = project.tracks
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
		this.playingNotes = []
        
        for (const audioTrack of this.audioTracks)
            audioTrack.stop()
	}


	process(deltaTime: number)
	{
		this.time += deltaTime
		
		// Update audio output.
		for (let i = this.playingNotes.length - 1; i >= 0; i--)
		{
            const note = this.playingNotes[i]
            note.remainingDuration -= deltaTime
            if (note.remainingDuration <= 0)
            {
                this.audioTracks.find(t => t.trackId == note.event.trackId)!.noteOff(note.event.midiPitch)
                this.playingNotes.splice(i, 1)
            }
		}
		
		// Process pending note events up to the current time.
		let noteEventsProcessed = 0
		while (noteEventsProcessed < this.noteEvents.length &&
			this.noteEvents[noteEventsProcessed].time <= this.time)
		{
			const ev = this.noteEvents[noteEventsProcessed]
            noteEventsProcessed++
            
            this.audioTracks.find(t => t.trackId == ev.trackId)!.noteOn(ev.midiPitch)

            const playingNote =
            {
                event: ev,
                remainingDuration: ev.duration,
            }
				
			this.playingNotes.push(playingNote)
		}
		
		// Remove processed events.
		this.noteEvents.splice(0, noteEventsProcessed)
	}


	addNoteEvent(trackId: number, time: number, midiPitch: number, volume: number, duration: number)
	{
		this.noteEvents.push(
		{
            trackId,
			time: time + this.time,
			midiPitch,
			volume,
			duration
		})
	}
}