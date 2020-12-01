import * as Playback from "./index"
import * as Project from "../project"
import Rational from "../util/rational"
import Range from "../util/range"
import * as MathUtils from "../util/mathUtils"


export function feedNotes(
    synth: Playback.SynthManager,
    project: Project.Root,
    isStart: boolean,
    startTime: Rational,
    range: Range)
{
    for (const [track, note] of iterNotesAtRange(project, range))
    {
        if (range.overlapsPoint(note.range.end))
        {
            synth.releaseNote(
                track.id,
                note.id)
        }
        else if (range.overlapsPoint(note.range.start) ||
            (isStart && range.overlapsPoint(startTime)))
        {
            synth.playNote(
                track.id,
                note.id,
                MathUtils.midiToHertz(note.midiPitch),
                midiVolumeToLinearGain(track.volume * note.velocity))
        }
    }
}


function midiVolumeToLinearGain(midiVol: number): number
{
    if (midiVol <= 0)
        return 0
    
    const minDbLevel = -15
    return MathUtils.dbToLinearGain(minDbLevel * (1 - midiVol))
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