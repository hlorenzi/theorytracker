import * as Global from "../state.ts"
import * as Playback from "./index"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import * as MathUtils from "../utils/mathUtils.ts"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"


export class Manager
{
    audioCtx?: BaseAudioContext
    nodeCompressor?: DynamicsCompressorNode
    nodeGlobalVolume?: GainNode
    nodeTrackVolumes: Map<Project.ID, GainNode>

    instruments: Playback.Instrument[]
    
    loading: number
    playing: boolean
    firstPlayingFrame: boolean
    startTime: Rational
    startTimeMs: number
    nextStartTime: Rational
    playTime: Rational
    preloadTime: Rational
    refreshTimeMs: number
    
    audioCtxTimestamp: number
    requestAnimationFrameId: number
    requestAnimationFrameTimestamp: number
    requestAnimationFrameDate: Date
    setIntervalId: number


    constructor()//toBuffer?: boolean, bufferLen?: number, bufferSampleRate?: number)
    {
        this.instruments = []
        this.nodeTrackVolumes = new Map<Project.ID, GainNode>()

        this.loading = 0
        this.playing = false
        this.firstPlayingFrame = false
        this.startTime = new Rational(0)
        this.startTimeMs = 0
        this.nextStartTime = new Rational(0)
        this.playTime = new Rational(0)
        this.preloadTime = new Rational(0)
        this.refreshTimeMs = 0
        
        this.requestAnimationFrameId = 0
        this.requestAnimationFrameTimestamp = 0
        this.requestAnimationFrameDate = new Date()
        this.setIntervalId = 0
        
        /*if (toBuffer)
        {
            this.audioCtx = new OfflineAudioContext(2, bufferLen!, bufferSampleRate!)
        }
        else
        {
            this.audioCtx = new AudioContext()
        }*/
    }


    async start()
    {
        this.loading += 1

        try
        {
            if (this.audioCtx)
                return

            this.audioCtx = new AudioContext()
            
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
        }
        finally
        {
            this.loading -= 1
        }
    }


    getTrackOutput(trackId: Project.ID): GainNode
    {
        let node = this.nodeTrackVolumes.get(trackId)
        if (node)
            return node

        node = this.audioCtx!.createGain()
        node.connect(this.nodeGlobalVolume!)
        this.nodeTrackVolumes.set(trackId, node)
        return node
    }


    async prepareRange(
        project: Project.ImmutableRoot,
        range: Range,
        isStart: boolean)
    {
        this.loading += 1

        try
        {
            const tasks: Promise<void>[] = []

            for (const noteEvent of Playback.queryNoteEvents(project, range, isStart))
            {
                const instrument = await this.getInstrument(noteEvent)
                tasks.push(instrument.prepare(noteEvent))
            }

            await Promise.all(tasks)
        }
        finally
        {
            this.loading -= 1
        }
    }


    async getInstrument(noteEvent: Playback.NoteEvent)
    {
        if (this.instruments.length > 0)
            return this.instruments[0]

        const instrument = new Playback.InstrumentBasic(this)

        this.instruments.push(instrument)
        return instrument
    }


    async destroy()
    {
        if (this.audioCtx instanceof AudioContext)
            await this.audioCtx.close()
    }
    
    
    isFinished()
    {
        for (const instrument of this.instruments)
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
        for (const instrument of this.instruments)
            instrument.stopAll()
    }


    process(
        audioCtxTimestampMs: number,
        deltaTimeMs: number)
    {
        for (const instrument of this.instruments)
            instrument.process(audioCtxTimestampMs, deltaTimeMs)
    }


    async playNote(
        noteEvent: Playback.NoteEvent,
        audioCtxOffsetMs: number)
    {
        const instrument = await this.getInstrument(noteEvent)
        if (!instrument)
            return

        await instrument.prepare(noteEvent)

        const output = this.getTrackOutput(noteEvent.trackId)
        instrument.playNote(noteEvent, audioCtxOffsetMs, output)
    }


    async playNotePreview(
        project: Project.ImmutableRoot,
        trackId: Project.ID,
        midiPitch: number)
    {
        await this.start()
        this.stopAll()
        
        const audioCtxOffsetMs = 15 + this.audioCtx!.currentTime * 1000
        this.updateTracks(project, audioCtxOffsetMs)

        const noteEvent: Playback.NoteEvent = {
            trackId,

            startMs: 0,
            endMs: 500,

            midiPitchSeq: [{ timeMs: 0, value: midiPitch }],
            volumeDbSeq: [{ timeMs: 0, value: 0 }],
            velocitySeq: [{ timeMs: 0, value: 1 }],
        }

        await this.playNote(noteEvent, audioCtxOffsetMs)
    }


    async playChordPreview(
        project: Project.ImmutableRoot,
        trackId: Project.ID,
        chord: Theory.Chord)
    {
        await this.start()
        this.stopAll()

        const audioCtxOffsetMs = 15 + this.audioCtx!.currentTime * 1000
        this.updateTracks(project, audioCtxOffsetMs)
        
        for (const midiPitch of chord.strummingPitches)
        {
            const noteEvent: Playback.NoteEvent = {
                trackId,

                startMs: 0,
                endMs: 750,

                midiPitchSeq: [{ timeMs: 0, value: midiPitch }],
                volumeDbSeq: [{ timeMs: 0, value: 0 }],
                velocitySeq: [{ timeMs: 0, value: 1 }],
            }

            await this.playNote(noteEvent, audioCtxOffsetMs)
        }
    }


    prepareNextRange(isStart: boolean)
    {
        const preloadTimeNext = this.preloadTime.add(new Rational(4, 4))

        const range = new Range(
            this.preloadTime,
            preloadTimeNext)
        
        this.prepareRange(
            Global.getStatic().project.root,
            range,
            isStart)

        this.preloadTime = preloadTimeNext
    }


    updateTracks(
        project: Project.ImmutableRoot,
        audioCtxOffsetMs: number)
    {
        const hasSoloTrack = project.tracks.some(tr =>
            tr.trackType === "notes" || tr.trackType === "chords" ? tr.solo : false)

        for (const track of project.tracks)
        {
            const trackWithAttrbs =
                track.trackType === "notes" || track.trackType === "chords" ?
                    track :
                    undefined
            
            const trackOutput = this.getTrackOutput(track.id)
            const trackVolume =
                !trackWithAttrbs?.solo &&
                    (hasSoloTrack || trackWithAttrbs?.mute) ? 0 :
                MathUtils.dbToLinearGain(0)
            
            trackOutput.gain.linearRampToValueAtTime(trackVolume, (audioCtxOffsetMs + 50) / 1000)
        }
    }


    processFrame(canRedrawScreen: boolean)
    {
        if (this.loading > 0)
            return

        const audioCtxTimestampPrev = this.audioCtxTimestamp
        this.audioCtxTimestamp = this.audioCtx?.currentTime ?? 0
        const deltaTimeMs = (this.audioCtxTimestamp - audioCtxTimestampPrev) * 1000

        if (deltaTimeMs > 100)
            return

        this.prepareNextRange(false)

        const audioCtxOffsetMs = 15 + this.audioCtxTimestamp * 1000

        const startTimeNext = this.startTimeMs + deltaTimeMs

        const project = Global.getStatic().project.root

        const playTimeNext =
            Project.getTimeAtMilliseconds(project, startTimeNext)
        
        this.process(audioCtxOffsetMs, deltaTimeMs)

        const range = new Range(
            this.playTime,
            playTimeNext,
            true,
            false)
        
        const noteEvents = Playback.queryNoteEvents(
            project,
            range,
            this.firstPlayingFrame)

        this.updateTracks(project, audioCtxOffsetMs)

        this.firstPlayingFrame = false

        for (const noteEvent of noteEvents)
        {
            noteEvent.startMs = Math.max(0, noteEvent.startMs - this.startTimeMs)
            noteEvent.endMs = Math.max(0, noteEvent.endMs - this.startTimeMs)
            this.playNote(noteEvent, audioCtxOffsetMs)
        }

        //if (noteEvents.length > 0) console.log(noteEvents)

        this.playTime = playTimeNext
        this.startTimeMs = startTimeNext

        this.refreshTimeMs += deltaTimeMs
        if (canRedrawScreen)
        {
            this.refreshTimeMs = 0
            if (Timeline.scrollPlayTimeIntoView(Global.getStatic().timeline, this.playTime))
                window.dispatchEvent(new CustomEvent(Timeline.eventTimelineRelayout))
            else
                window.dispatchEvent(new CustomEvent(Timeline.eventTimelineRedraw))
        }

        if (this.playTime.compare(project.range.end) > 0 &&
            this.isFinished())
        {
            this.setPlaying(false)
        }
    }

    
    processAnimationFrame(timestamp: number)
    {
        const prevTimestamp = this.requestAnimationFrameTimestamp
        this.requestAnimationFrameTimestamp = timestamp

        this.requestAnimationFrameDate = new Date()

        //const deltaTimeMs = (prevTimestamp < 0 ? 0 : timestamp - prevTimestamp)
        
        this.processFrame(true)

        if (this.playing)
        {
            this.requestAnimationFrameId =
                requestAnimationFrame(timestamp => this.processAnimationFrame(timestamp))
        }
    }

    
    processInterval(deltaTimeMs: number)
    {
        // Take over from requestAnimationFrame and
        // process playback on the setInterval callback only if
        // requestAnimationFrame was blocked (by e.g. being in the background)

        const msSinceLastRequestAnimationFrame = 
            (new Date().getTime()) -
            this.requestAnimationFrameDate.getTime()

        if (msSinceLastRequestAnimationFrame > 250 &&
            deltaTimeMs > 0 && deltaTimeMs < 250)
        {
            this.processFrame(false)
        }
    }

    
    setPlaying(
        playing: boolean)
    {
        if (this.requestAnimationFrameId !== 0)
        {
            this.stopAll()

            cancelAnimationFrame(this.requestAnimationFrameId)
            this.requestAnimationFrameId = 0

            clearInterval(this.setIntervalId)
            this.setIntervalId = 0
        }

        const project = Global.getStatic().project.root

        this.playing = playing
        this.firstPlayingFrame = true
        this.startTime = this.nextStartTime
        this.startTimeMs = Project.getMillisecondsAt(project, this.startTime)
        this.playTime = this.nextStartTime
        this.preloadTime = this.nextStartTime
        this.refreshTimeMs = 0
        this.audioCtxTimestamp = this.audioCtx?.currentTime ?? 0

        if (playing)
        {
            this.start()
            this.prepareNextRange(true)

            this.requestAnimationFrameId =
                requestAnimationFrame(timestamp => this.processAnimationFrame(timestamp))

            this.requestAnimationFrameTimestamp = 0
            this.requestAnimationFrameDate = new Date()
            
            this.setIntervalId =
                +setInterval(() => this.processInterval(1000 / 60), 1000 / 60)
        }
        
        window.dispatchEvent(new CustomEvent(Timeline.eventTimelineRedraw))
    }


    setStartTime(startTime: Rational)
    {
        this.nextStartTime = startTime
    }


    togglePlaying()
    {
        this.setPlaying(!this.playing)
    }
}