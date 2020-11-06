import * as Playback from "./index"
import * as Project from "../project"
import Rational from "../util/rational"
import Range from "../util/range"
import MathUtils from "../util/mathUtils"


export function feedNotes(
    synth: Playback.SynthManager,
    project: Project.Root,
    isStart: boolean,
    startTime: Rational,
    range: Range)
{
    for (const [trackId, note] of iterNotesAtRange(project, range))
    {
        if (range.overlapsPoint(note.range.end))
        {
            synth.releaseNote(
                trackId,
                MathUtils.midiToHertz(note.midiPitch))
        }
        else if (range.overlapsPoint(note.range.start) ||
            (isStart && range.overlapsPoint(startTime)))
        {
            synth.playNote(
                trackId,
                MathUtils.midiToHertz(note.midiPitch),
                1)
        }
    }
}


function *iterNotesAtRange(
    project: Project.Root,
    range: Range)
    : Generator<[Project.ID, Project.Note], void, void>
{
    for (const track of project.tracks)
    {
        if (track.trackType != Project.TrackType.Notes)
            continue

        const trackElems = project.lists.get(track.id)
        if (!trackElems)
            continue
        
        for (const noteBlock of trackElems.iterAtRange(range))
        {
            if (noteBlock.type != Project.ElementType.NoteBlock)
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
                
                yield [track.id, newElem as Project.Note]
            }
        }
    }
}