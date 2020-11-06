import * as Project from "./index"
import * as Theory from "../theory"
import { MidiFileReader } from "../util/midi"
import Rational from "../util/rational"
import Range from "../util/range"


export function midiImport(bytes: number[] | Buffer | Uint8Array): Project.Root
{
    const midi = MidiFileReader.fromBytes(bytes)
    console.log(midi)
    
    const findFirstEvent = (kind: string) =>
    {
        for (const track of midi.tracks)
            for (const ev of track.events)
                if (ev.kind == kind)
                    return ev
                
        return null
    }
    
    let project = new Project.Root()
    
    const tempoEv = findFirstEvent("setTempo")
    const msPerQuarterNote = (tempoEv ? tempoEv.msPerQuarterNote : 500000)
    project.baseBpm = Math.round(60 * 1000 * 1000 / msPerQuarterNote)
    
    const track1Id = project.nextId
    project = Project.Root.upsertTrack(project, Project.makeTrackKeyChanges())
    
    const track2Id = project.nextId
    project = Project.Root.upsertTrack(project, Project.makeTrackMeterChanges())

    project = Project.Root.upsertElement(project,
        Project.makeKeyChange(track1Id, new Rational(0), Theory.Key.parse("C Major")))

    project = Project.Root.upsertElement(project,
        Project.makeMeterChange(track2Id, new Rational(0), new Theory.Meter(4, 4)))

    /*for (const track of midi.tracks)
    {
        for (const ev of track.events)
        {
            if (ev.kind != "setKeySignature")
                continue
            
            const tonicPitches     = [ 0,  7,  2,  9,  4, 11, 5, 0, 7, 2, 9, 4, 11, 5, 0, 7, 2, 9, 4, 11]
            const tonicLetters     = [ 0,  4,  1,  5,  2,  6, 3, 0, 4, 1, 5, 2,  6, 3, 0, 4, 1, 5, 2,  6]
            const tonicAccidentals = [-1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0,  0, 1, 1, 1, 1, 1, 1,  1]
            const index = ev.accidentals + 7 + (ev.scale == 0 ? 0 : 2)
            
            if (index < 0 || index >= tonicPitches.length)
                continue
            
            const time = Rational.fromFloat(ev.time / midi.ticksPerQuarterNote / 4, 27720)
            song = song.upsertKeyChange(new Project.KeyChange(time,
                new Theory.Key(
                    new Theory.PitchName(tonicLetters[index], tonicAccidentals[index]),
                    Theory.Scale.parse(ev.scale == 0 ? "Major" : "Minor"))))
        }
    }
    
    for (const track of midi.tracks)
    {
        for (const ev of track.events)
        {
            if (ev.kind != "setTimeSignature")
                continue
            
            const time = Rational.fromFloat(ev.time / midi.ticksPerQuarterNote / 4, 27720)
            song = song.upsertMeterChange(new Project.MeterChange(time, new Theory.Meter(ev.numerator, ev.denominator)))
        }
    }*/
    
    for (const track of midi.tracks)
    {
        const trackId = project.nextId
        project = Project.Root.upsertTrack(project, Project.makeTrackNotes())

        const notes = []

        for (const noteOn of track.events)
        {
            if (noteOn.kind != "noteOn" || noteOn.channel == 9 || noteOn.velocity == 0)
                continue

            let noteOff = null
            for (const ev of track.events)
            {
                if (ev.kind != "noteOn" && ev.kind != "noteOff")
                    continue
                
                if (ev.time <= noteOn.time || ev.channel != noteOn.channel || ev.key != noteOn.key)
                    continue
                
                if (noteOff == null || ev.time < noteOff.time)
                {
                    noteOff = ev
                    break
                }
            }
            
            if (!noteOff)
                continue
            
            const onTick  = Rational.fromFloat(noteOn.time  / midi.ticksPerQuarterNote / 4, 27720)
            const offTick = Rational.fromFloat(noteOff.time / midi.ticksPerQuarterNote / 4, 27720)
            
            notes.push(Project.makeNote(trackId, new Range(onTick, offTick), noteOn.key))
        }

        const splitNotes = splitNotesIntoBlocks(notes)
        for (const split of splitNotes)
        {
            const blockId = project.nextId
            project = Project.Root.upsertElement(project,
                Project.makeNoteBlock(trackId, split.range))

            for (const note of split.notes)
                project = Project.Root.upsertElement(project,
                    Project.makeNote(blockId, note.range.subtract(split.range.start), note.midiPitch))
        }
    }
    
    /*if (!song.keyChanges.findActiveAt(new Rational(0)))
        song = song.upsertKeyChange(new Project.KeyChange(new Rational(0), Theory.Key.parse("C Major")))

    if (!song.meterChanges.findActiveAt(new Rational(0)))
        song = song.upsertMeterChange(new Project.MeterChange(new Rational(0), new Theory.Meter(4, 4)))
    */
    return project//.withRefreshedRange()
}


interface SplitNotes
{
    notes: Project.Note[]
    range: Range
}


function splitNotesIntoBlocks(notes: Project.Note[]): SplitNotes[]
{
    const result: SplitNotes[] = []
    const margin = new Rational(1)

    while (notes.length > 0)
    {
        const firstNote = notes.pop()!
        let blockRange = firstNote.range

        const blockNotes: Set<Project.Note> = new Set()
        blockNotes.add(firstNote)

        while (true)
        {
            const overlappingNoteIndex = notes.findIndex(n => n.range.grow(margin).overlapsRange(blockRange))
            if (overlappingNoteIndex < 0)
                break

            const overlappingNote = notes[overlappingNoteIndex]
            blockNotes.add(overlappingNote)
            blockRange = blockRange.merge(overlappingNote.range)
            notes.splice(overlappingNoteIndex, 1)
        }

        result.push({ notes: [...blockNotes], range: blockRange })
    }

    return result
}