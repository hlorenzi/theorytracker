import * as Global from "../state.ts"
import * as Playback from "./index"
import * as Project from "../project"
import * as MathUtils from "../utils/mathUtils.ts"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"


export const eventPlaybackRefresh = "playbackRefresh"


export class Manager
{
    audioCtx?: BaseAudioContext
    nodeCompressor?: DynamicsCompressorNode
    nodeGlobalVolume?: GainNode

    instruments: Playback.Instrument[]
    
    loading: number
    playing: boolean
    playingProject: Project.ImmutableRoot | undefined
    firstPlayingFrame: boolean
    startTime: Rational
    startTimeMs: number
    nextStartTime: Rational
    playTimeFloat: number
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

        this.loading = 0
        this.playing = false
        this.playingProject = undefined
        this.firstPlayingFrame = false
        this.startTime = new Rational(0)
        this.startTimeMs = 0
        this.nextStartTime = new Rational(0)
        this.playTimeFloat = 0
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
        this.nodeCompressor.connect(this.audioCtx.destination)*/
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


    async prepare(
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
                const instrument = await this.prepareInstrument(noteEvent)
                tasks.push(instrument.prepare(noteEvent))
            }

            await Promise.all(tasks)
        }
        finally
        {
            this.loading -= 1
        }
    }


    async prepareInstrument(noteEvent: Playback.NoteEvent)
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
        const instrument = await this.prepareInstrument(noteEvent)
        if (!instrument)
            return

        instrument.playNote(noteEvent, audioCtxOffsetMs)
    }


    preloadNextBlock(isStart: boolean)
    {
        const preloadTimeNext = this.preloadTime.add(new Rational(4, 4))

        const range = new Range(
            this.preloadTime,
            preloadTimeNext)
        
        this.prepare(
            this.playingProject!,
            range,
            isStart)

        this.preloadTime = preloadTimeNext
    }


    processFrame(canRedrawScreen: boolean)
    {
        if (!this.playingProject)
            return

        if (this.loading > 0)
            return

        const audioCtxTimestampPrev = this.audioCtxTimestamp
        this.audioCtxTimestamp = this.audioCtx?.currentTime ?? 0
        const deltaTimeMs = (this.audioCtxTimestamp - audioCtxTimestampPrev) * 1000

        if (deltaTimeMs > 100)
            return

        this.preloadNextBlock(false)

        const audioCtxOffsetMs = 15 + this.audioCtxTimestamp * 1000

        const measuresPerSecond = (this.playingProject.baseBpm / 4 / 60)
        
        const playTimeFloatNext = this.playTimeFloat + deltaTimeMs / 1000 * measuresPerSecond
        const playTimeNext = Rational.fromFloat(playTimeFloatNext, Project.MAX_RATIONAL_DENOMINATOR)

        this.process(audioCtxOffsetMs, deltaTimeMs)

        const range = new Range(
            this.playTime,
            playTimeNext,
            true,
            false)
        
        const noteEvents = Playback.queryNoteEvents(
            this.playingProject,
            range,
            this.firstPlayingFrame)

        this.firstPlayingFrame = false

        for (const noteEvent of noteEvents)
        {
            noteEvent.startMs = Math.max(0, noteEvent.startMs - this.startTimeMs)
            noteEvent.endMs = Math.max(0, noteEvent.endMs - this.startTimeMs)
            this.playNote(noteEvent, audioCtxOffsetMs)
        }

        //if (noteEvents.length > 0)
        //    console.log(noteEvents)

        this.playTimeFloat = playTimeFloatNext
        this.playTime = playTimeNext
        this.startTimeMs += deltaTimeMs

        this.refreshTimeMs += deltaTimeMs
        if (canRedrawScreen)
        {
            this.refreshTimeMs = 0
            window.dispatchEvent(new CustomEvent(eventPlaybackRefresh))
        }

        if (this.playTime.compare(this.playingProject.range.end) > 0 &&
            this.isFinished())
        {
            this.setPlaying(false, this.playingProject)
            window.dispatchEvent(new CustomEvent(eventPlaybackRefresh))
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

        this.processFrame(false)
        
        /*const msSinceLastRequestAnimationFrame = 
            (new Date().getTime()) -
            this.requestAnimationFrameDate.getTime()

        if (msSinceLastRequestAnimationFrame > 250 &&
            deltaTimeMs > 0 && deltaTimeMs < 250)
        {
            this.processFrame(false)
        }*/
    }

    
    setPlaying(
        playing: boolean,
        playingProject: Project.ImmutableRoot)
    {
        if (this.requestAnimationFrameId !== 0)
        {
            this.stopAll()

            cancelAnimationFrame(this.requestAnimationFrameId)
            this.requestAnimationFrameId = 0

            clearInterval(this.setIntervalId)
            this.setIntervalId = 0
        }

        this.playing = playing
        this.playingProject = playingProject
        this.firstPlayingFrame = true
        this.startTime = this.nextStartTime
        this.startTimeMs = Project.getMillisecondsAt(playingProject, this.startTime)
        this.playTime = this.nextStartTime
        this.playTimeFloat = this.nextStartTime.asFloat()
        this.preloadTime = this.nextStartTime
        this.refreshTimeMs = 0
        this.audioCtxTimestamp = this.audioCtx?.currentTime ?? 0

        if (playing)
        {
            this.start()
            this.preloadNextBlock(true)

            this.requestAnimationFrameId =
                requestAnimationFrame(timestamp => this.processAnimationFrame(timestamp))

            this.requestAnimationFrameTimestamp = 0
            this.requestAnimationFrameDate = new Date()
            
            this.setIntervalId =
                +setInterval(() => this.processInterval(1000 / 60), 1000 / 60)
        }
    }


    setStartTime(startTime: Rational)
    {
        this.nextStartTime = startTime
    }


    togglePlaying(
        playingProject: Project.ImmutableRoot)
    {
        this.setPlaying(
            !this.playing,
            playingProject)
    }
}