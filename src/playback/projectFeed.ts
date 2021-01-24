import * as Playback from "./index"
import * as Project from "../project"
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
    const anySolo = project.tracks.some(tr => tr.solo)

    const playbackStartMs = Project.getMillisecondsAt(project, playbackStart)
    const feedRangeStartMs = Project.getMillisecondsAt(project, feedRange.start)

    for (const [track, note] of iterNotesAtRange(project, feedRange))
    {
        if (anySolo && !track.solo)
            continue

        if (track.mute && !track.solo)
            continue

        if (feedRange.overlapsPoint(note.range.start) ||
            (isStart && feedRange.overlapsPoint(playbackStart)))
        {
            const startMs =
                Project.getMillisecondsAt(project, note.range.start.max(playbackStart)) +
                audioOffsetMs - feedRangeStartMs
            
            const endMs =
                Project.getMillisecondsAt(project, note.range.end) +
                audioOffsetMs - feedRangeStartMs

            const request: Playback.NoteRequest =
            {
                trackId: track.id,
                noteId: note.id,

                startMs,
                durationMs: endMs - startMs,

                midiPitchSeq: [{ timeMs: startMs, value: note.midiPitch }],
                volumeSeq: [{ timeMs: startMs, value: track.volumeDb + note.volumeDb }],
                velocitySeq: [{ timeMs: startMs, value: note.velocity }],
            }

            synth.playNote(request)
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