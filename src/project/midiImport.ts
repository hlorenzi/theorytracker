import * as Project from "./index"
import * as Theory from "../theory"
import * as Playback from "../playback"
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
    
    const findFirstEventOnChannel = (channel: number, kind: string) =>
    {
        for (const track of midi.tracks)
            for (const ev of track.events)
                if (ev.kind == kind && ev.channel == channel)
                    return ev
                
        return null
    }
    
    const findFirstEventOnTrack = (midiTrack: any, kind: string) =>
    {
        for (const ev of midiTrack.events)
            if (ev.kind == kind)
                return ev
                
        return null
    }

    let project = Project.makeEmpty()
    
    const tempoEv = findFirstEvent("setTempo")
    const msPerQuarterNote = (tempoEv ? tempoEv.msPerQuarterNote : 500000)
    project.baseBpm = Math.round(60 * 1000 * 1000 / msPerQuarterNote)
    
    const trackKeyChanges = project.nextId
    project = Project.upsertTrack(project, Project.makeTrackKeyChanges())
    
    const trackMeterChanges = project.nextId
    project = Project.upsertTrack(project, Project.makeTrackMeterChanges())

    for (const track of midi.tracks)
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
            project = Project.upsertElement(project, Project.makeKeyChange(
                trackKeyChanges,
                time,
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
            project = Project.upsertElement(project, Project.makeMeterChange(
                trackMeterChanges,
                time,
                new Theory.Meter(ev.numerator, ev.denominator)))
        }
    }

    const notes: MidiNote[] = []
    for (let tr = 0; tr < midi.tracks.length; tr++)
    {
        const midiTrack = midi.tracks[tr]
        for (const noteOn of midiTrack.events)
        {
            if (noteOn.kind != "noteOn" || noteOn.velocity == 0)
                continue

            let noteOff = null
            for (const ev of midiTrack.events)
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
            
            const onTick  = Rational.fromFloat(noteOn .time / midi.ticksPerQuarterNote / 4, 27720)
            const offTick = Rational.fromFloat(noteOff.time / midi.ticksPerQuarterNote / 4, 27720)
            
            notes.push({
                range: new Range(onTick, offTick),
                midiPitch: noteOn.key,
                velocity: noteOn.velocity / 127,
                channel: noteOn.channel,
                midiTrackIndex: tr,
            })
        }
    }

    const notesByTracks = midi.format == 0 ?
        splitNotesBy(notes, note => note.channel) :
        splitNotesBy(notes, note => note.midiTrackIndex)

    
    for (const notesForTrack of notesByTracks)
    {
        const midiTrack = midi.tracks[notesForTrack[0].midiTrackIndex]

        const findFirstEventOnChannelOrTrack = (ev: string) =>
        {
            if (midi.format == 0)
                return findFirstEventOnChannel(notesForTrack[0].channel, ev)
            else
                return findFirstEventOnTrack(midiTrack, ev)
        }

        const trackId = project.nextId
        const track = Project.makeTrackNotes()

        const trackName = findFirstEventOnChannelOrTrack("trackName")
        if (trackName)
            track.name = trackName.text
        
        const isDrumkit = notesForTrack.some((n: any) => n.channel == 9)

        const programChange = findFirstEventOnChannelOrTrack("programChange")
        if (programChange)
        {
            const gmSflib = Playback.getSflibMeta()!.collections.find(c => c.id == "gm")!
            
            let instrument = null
            if (!isDrumkit)
                instrument = gmSflib.instruments.find(i =>
                    i.midiBank != 128 &&
                    i.midiPreset == programChange.program)
            else
            {
                instrument = gmSflib.instruments.find(i =>
                    i.midiBank == 128 &&
                    i.midiPreset == programChange.program)

                if (!instrument)
                    instrument = gmSflib.instruments.find(i => i.midiBank == 128)
            }

            track.instruments = [{
                instrumentType: "sflib",
                collectionId: "gm",
                instrumentId: instrument?.id ?? "piano_1",
            }]
        }

        project = Project.upsertTrack(project, track)

        const splitNotes = splitNotesIntoBlocks(notesForTrack)
        for (const split of splitNotes)
        {
            const blockId = project.nextId
            project = Project.upsertElement(project,
                Project.makeNoteBlock(trackId, split.range))

            for (const note of split.notes)
                project = Project.upsertElement(project,
                    Project.makeNote(
                        blockId,
                        note.range.subtract(split.range.start),
                        note.midiPitch,
                        note.velocity))
        }
    }

    const keyChangeList = project.lists.get(trackKeyChanges)
    if (!keyChangeList || !keyChangeList.findActiveAt(new Rational(0)))
        project = Project.upsertElement(project,
            Project.makeKeyChange(trackKeyChanges, new Rational(0), Theory.Key.parse("C Major")))

    const meterChangeList = project.lists.get(trackMeterChanges)
    if (!meterChangeList || !meterChangeList.findActiveAt(new Rational(0)))
        project = Project.upsertElement(project,
            Project.makeMeterChange(trackMeterChanges, new Rational(0), new Theory.Meter(4, 4)))
    
    return project//.withRefreshedRange()
}


interface MidiNote
{
    range: Range
    midiPitch: number
    velocity: number
    channel: number
    midiTrackIndex: number
}


function splitNotesBy(notes: MidiNote[], fn: (note: MidiNote) => number): MidiNote[][]
{
    const map = new Map<number, MidiNote[]>()

    for (const note of notes)
    {
        const key = fn(note)
        
        let bucket = map.get(key)
        if (bucket)
        {
            bucket.push(note)
        }
        else
        {
            bucket = [note]
            map.set(key, bucket)
        }
    }

    return [...map.values()]
}


interface SplitNotes
{
    notes: MidiNote[]
    range: Range
}


function splitNotesIntoBlocks(notes: MidiNote[]): SplitNotes[]
{
    const result: SplitNotes[] = []
    const margin = new Rational(1)

    while (notes.length > 0)
    {
        const firstNote = notes.pop()!
        let blockRange = firstNote.range

        const blockNotes: Set<MidiNote> = new Set()
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