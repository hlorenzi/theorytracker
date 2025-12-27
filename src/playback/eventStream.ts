import * as Playback from "./index"
import * as Project from "../project"
import * as Theory from "../theory"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"
import * as MathUtils from "../utils/mathUtils.ts"


export interface NoteEvent
{
    project: Project.ImmutableRoot,
    trackId: Project.ID
    
    startMs: number
    endMs: number

    midiPitchSeq: TimeVariableProperty[]
    volumeSeq: TimeVariableProperty[]
    velocitySeq: TimeVariableProperty[]
}


export interface TimeVariableProperty
{
    timeMs: number
    value: number
}


export function queryNoteEvents(
    project: Project.ImmutableRoot,
    range: Range,
    isStart: boolean)
    : NoteEvent[]
{
    const noteEvents: NoteEvent[] = []

    for (const [track, note] of iterNotesAtRange(project, range))
    {
        if (range.overlapsPoint(note.range.start) ||
            (isStart && note.range.overlapsPoint(range.start)))
        {
            noteEvents.push(makeNoteEvent(
                project,
                track.id,            
                note.range,
                note.midiPitch,
                0,//note.volumeDb,
                1))//note.velocity)
        }
    }

    const chordTrack = Project.getTrack(project, project.chordTrackId, "chords")
    const chordList = project.lists.get(project.chordTrackId)
    if (chordTrack && chordList)
    {
        for (const chord of chordList.iterAtRange(range))
        {
            if (range.overlapsPoint(chord.range.start) ||
                (isStart && chord.range.overlapsPoint(range.start)))
            {
                playChord(
                    project,
                    chordTrack,
                    noteEvents,
                    range,
                    chord as Project.Chord)
            }
        }
    }

    return noteEvents
}


function makeNoteEvent(
    project: Project.ImmutableRoot,
    trackId: Project.ID,
    noteRange: Range,
    midiPitch: number,
    volumeDb: number,
    velocity: number)
    : Playback.NoteEvent
{
    const startMs =
        Project.getMillisecondsAt(project, noteRange.start)
    
    const endMs =
        Project.getMillisecondsAt(project, noteRange.end)

    return {
        project,
        trackId,

        startMs: startMs,
        endMs: endMs,

        midiPitchSeq: [{ timeMs: startMs, value: midiPitch }],
        volumeSeq: [{ timeMs: startMs, value: volumeDb }],
        velocitySeq: [{ timeMs: startMs, value: velocity }],
    }
}


function *iterNotesAtRange(
    project: Project.ImmutableRoot,
    range: Range)
    : Generator<[Project.TrackNotes, Project.Note], void, void>
{
    for (const track of project.tracks)
    {
        if (track.trackType !== "notes")
            continue

        const noteList = project.lists.get(track.id)
        if (!noteList)
            continue
        
        for (const elem of noteList.iterAtRange(range))
        {
            if (elem.range.duration.isZero())
                continue

            if (!elem.range.overlapsRange(range))
                continue
            
            yield [track, elem as Project.Note]
        }
    }
}


function playChord(
    project: Project.ImmutableRoot,
    chordTrack: Project.TrackChords,
    noteEvents: NoteEvent[],
    range: Range,
    chord: Project.Chord)
{
    const addNoteEvent = (start: Rational, duration: Rational, midiPitch: number, volume: number) => {
        if (start.add(duration).compare(range.start) <= 0)
            return

        noteEvents.push(makeNoteEvent(
            project,
            chordTrack.id,
            Range.fromStartDuration(start, duration),
            midiPitch,
            MathUtils.linearGainToDb(volume),
            1))
    }

    /*if (chord.range.end.compare(startTick) <= 0)
        continue*/
    
    const pitches = chord.chord.strummingPitches
        
    /*if (!useChordPatterns)
    {
        for (let j = 0; j < pitches.length; j++)
            addNoteEvent(chord.range.start, chord.range.duration, pitches[j], chordVolumeMul)
        
        continue
    }*/

    const measures = Project.iterMeasuresAtRange(project, chord.range)
    for (const measure of measures)
    {        
        const meterBeatLength = new Rational(1, measure.denominator)
        const pattern = getChordStrummingPattern(measure.numerator, measure.denominator)
        
        let tick = measure.time1
        const endTime = chord.range.end.min(measure.time2)

        let mustPlayFirstBeat = false
        let skipTick = new Rational(0)
        let patternIndex = 0
        
        while (tick.compare(endTime) < 0)
        {
            const patternBeat = pattern[patternIndex]
            const patternBeatKind = patternBeat[0]
            let patternBeatLength = patternBeat[1].multiply(meterBeatLength)
            patternIndex = (patternIndex + 1) % pattern.length
            
            let nextTick = tick.add(patternBeatLength)
            if (nextTick.compare(endTime) > 0)
            {
                nextTick = endTime
                patternBeatLength = nextTick.subtract(tick)
            }
            
            // Handle beats after the first one.
            if (tick.compare(chord.range.start) > 0 &&
                skipTick.compare(new Rational(0)) <= 0)
            {
                if (mustPlayFirstBeat)
                {
                    mustPlayFirstBeat = false
                    for (let j = 0; j < pitches.length; j++)
                        addNoteEvent(chord.range.start, tick.subtract(chord.range.start), pitches[j], 1)
                }
                
                switch (patternBeatKind)
                {
                    case 0:
                    {
                        for (let j = 0; j < pitches.length; j++)
                            addNoteEvent(tick, patternBeatLength, pitches[j], 0.9)
                        break
                    }
                    case 1:
                    {
                        for (let j = 1; j < pitches.length; j++)
                            addNoteEvent(tick, patternBeatLength, pitches[j], 0.5)
                        break
                    }
                    case 2:
                    {
                        addNoteEvent(tick, patternBeatLength, pitches[0], 0.5)
                        break
                    }
                }
            }
            
            skipTick = skipTick.subtract(patternBeatLength)
            
            if (tick.compare(chord.range.start) <= 0 &&
                nextTick.compare(chord.range.start) > 0)
            {
                mustPlayFirstBeat = true
                
                if (tick.compare(chord.range.start) !== 0 ||
                    patternBeatKind !== 0)
                    skipTick = pattern[0][1].multiply(meterBeatLength)
            }
            
            tick = nextTick
        }

        if (mustPlayFirstBeat)
        {
            mustPlayFirstBeat = false
            for (let j = 0; j < pitches.length; j++)
                addNoteEvent(chord.range.start, tick.subtract(chord.range.start), pitches[j], 0.7)
        }
    }
}


function getChordStrummingPattern(numerator: number, denominator: number)
{
    // [[beat kind, duration], ...]
    // Beat kinds:
    //   0: Full chord
    //   1: Full chord minus bass
    //   2: Only bass
    const one: [number, Rational][] =
        [[0, new Rational(1)]]

    const two: [number, Rational][] =
        [[0, new Rational(1)], [1, new Rational(1, 2)], [2, new Rational(1, 2)]]

    const three: [number, Rational][] =
        [[0, new Rational(1)], [1, new Rational(1)   ], [1, new Rational(1)   ]]
    
    let pattern: [number, Rational][] = []
    let accumulated = 0
    while (accumulated < numerator)
    {
        if (numerator % 3 === 0 &&
            accumulated + 3 <= numerator)
        {
            pattern = pattern.concat(three)
            accumulated += 3
        }
        else if (accumulated + 3 === numerator)
        {
            pattern = pattern.concat(three)
            accumulated += 3
        }
        else if (accumulated + 2 <= numerator)
        {
            pattern = pattern.concat(two)
            accumulated += 2
        }
        else
        {
            pattern = pattern.concat(one)
            accumulated += 1
        }
    }
    return pattern
}