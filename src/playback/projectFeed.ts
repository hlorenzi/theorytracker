import * as Playback from "./index"
import * as Project from "../project"
import * as Theory from "../theory"
import Rational from "../util/rational"
import Range from "../util/range"
import * as MathUtils from "../util/mathUtils"


export function feedNotes(
    synth: Playback.SynthManager,
    project: Project.Root,
    isStart: boolean,
    audioOffsetMs: number,
    playbackStart: Rational,
    feedRange: Range)
{
    const feedRangeStartMs = Project.getMillisecondsAt(project, feedRange.start)

    const makeNoteRequest = (trackId: Project.ID, range: Range, midiPitch: number, volumeDb: number, velocity: number) =>
    {
        const startMs =
            Project.getMillisecondsAt(project, range.start.max(playbackStart)) +
            audioOffsetMs - feedRangeStartMs
        
        const endMs =
            Project.getMillisecondsAt(project, range.end) +
            audioOffsetMs - feedRangeStartMs

        const request: Playback.NoteRequest =
        {
            trackId: trackId,
            noteId: -1,

            startMs,
            durationMs: endMs - startMs,

            midiPitchSeq: [{ timeMs: startMs, value: midiPitch }],
            volumeSeq: [{ timeMs: startMs, value: volumeDb }],
            velocitySeq: [{ timeMs: startMs, value: velocity }],
        }

        return request
    }

    for (const [track, note] of iterNotesAtRange(project, feedRange))
    {
        if (feedRange.overlapsPoint(note.range.start) ||
            (isStart && feedRange.overlapsPoint(playbackStart)))
        {
            const request = makeNoteRequest(
                track.id, note.range,
                note.midiPitch,
                note.volumeDb,
                note.velocity)

            synth.playNote(request)
        }
    }

    const chordTrack = Project.getTrack(project, project.chordTrackId, "chords")
    const chordList = project.lists.get(project.chordTrackId)
    if (chordTrack && chordList)
    {
        for (const chord of chordList.iterAtRange(feedRange))
        {
            if (feedRange.overlapsPoint(chord.range.start) ||
                (isStart && feedRange.overlapsPoint(playbackStart)))
            {
                playChord(synth, project, chordTrack, chord as Project.Chord, makeNoteRequest)
            }
        }
    }
}


function *iterNotesAtRange(
    project: Project.Root,
    range: Range)
    : Generator<[Project.TrackNotes, Project.Note], void, void>
{
    for (const track of project.tracks)
    {
        if (track.trackType != "notes")
            continue

        const trackElems = project.lists.get(track.id)
        if (!trackElems)
            continue
        
        for (const noteBlock of trackElems.iterAtRange(range))
        {
            if (noteBlock.type != "noteBlock")
                continue
                
            const noteList = project.lists.get(noteBlock.id)
            if (!noteList)
                continue

            for (const elem of noteList.iterAtRange(range.displace(noteBlock.range.start.negate())))
            {
                const newElem =
                {
                    ...elem,
                    range: elem.range
                        .displace(noteBlock.range.start)
                        .intersect(noteBlock.range),
                }

                if (newElem.range.duration.isZero())
                    continue

                if (!newElem.range.overlapsRange(range))
                    continue
                
                yield [track, newElem as Project.Note]
            }
        }
    }
}


function playChord(
    synth: Playback.SynthManager,
    project: Project.Root,
    chordTrack: Project.TrackChords,
    chord: Project.Chord,
    makeNoteRequest: (trackId: Project.ID, range: Range, midiPitch: number, volumeDb: number, velocity: number) => Playback.NoteRequest)
{
    const addNoteEvent = (start: Rational, duration: Rational, midiPitch: number, volume: number) =>
    {
        const request = makeNoteRequest(
            chordTrack.id,
            Range.fromStartDuration(start, duration),
            midiPitch,
            MathUtils.linearGainToDb(volume),
            1)

        synth.playNote(request)
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
        
    const meterCh = Project.meterChangeAt(project, chordTrack.id, chord.range.start)
    const meter = meterCh ? meterCh.meter : Project.defaultMeter()
    const meterBeatLength = new Rational(1, meter.denominator)
    const measureBreak = null//that.forcedMeasures.findActiveAt(chord.range.start)
    const pattern = getChordStrummingPattern(meter)
    
    let tick = meterCh ? meterCh.range.start : chord.range.start
    //if (measureBreak != null)
    //	tick.max(measureBreak.tick)
    
    let skipTick = new Rational(0)
    let patternIndex = 0
    let mustPlayFirstBeat = false
    
    while (tick.compare(chord.range.end) < 0)
    {
        const patternBeat = pattern[patternIndex]
        const patternBeatKind = patternBeat[0]
        let patternBeatLength = patternBeat[1].multiply(meterBeatLength)
        patternIndex = (patternIndex + 1) % pattern.length
        
        let nextTick = tick.add(patternBeatLength)
        if (nextTick.compare(chord.range.end) > 0)
        {
            nextTick = chord.range.end
            patternBeatLength = nextTick.subtract(tick)
        }
        
        // Handle beats after the first one.
        if (tick.compare(chord.range.start) > 0 && skipTick.compare(new Rational(0)) <= 0)
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
        
        if (tick.compare(chord.range.start) <= 0 && nextTick.compare(chord.range.start) > 0)
        {
            mustPlayFirstBeat = true
            
            if (!(tick.compare(chord.range.start) == 0 && patternBeatKind == 0))
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


function getChordStrummingPattern(meter: Theory.Meter)
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
	
	switch (meter.numerator)
	{
		case 2: return two
		case 3: return three
		case 4: return two.concat(two)
		case 5: return three.concat(two)
		case 6: return three.concat(three)
		case 7: return three.concat(two).concat(two)
		case 8: return two.concat(two).concat(two).concat(two)
		case 9: return three.concat(three).concat(three)
		
		default:
		{
			let pattern: [number, Rational][] = []
			for (let i = 0; i < meter.numerator; i++)
				pattern = pattern.concat(one)
			return pattern
		}
	}
}
