import * as Project from "./index"
import * as Playback from "../playback"
import * as Midi from "../util/midi"
import Rational from "../util/rational"
import * as MathUtils from "../util/mathUtils"


export function midiExport(project: Project.Root): Uint8Array
{
    let midi = {
        ticksPerQuarterNote: 128,
        tracks: [],
    } as unknown as Midi.Root

        

    const midiMetaTrack: Midi.Track = {
        length: 0,
        events: [],
    }

    midiMetaTrack.events.push({
        kind: "setTempo",
        tick: new Rational(0),
        bpm: project.baseBpm,
    })

    midiMetaTrack.events.push({
        kind: "endOfTrack",
        tick: new Rational(0),
    })

    midi.tracks.push(midiMetaTrack)



    let channelIndex = 0

    for (const track of project.tracks)
    {
        if (track.trackType !== "notes")
            continue
        
        const midiTrack: Midi.Track = {
            length: 0,
            events: [],
        }

        let channel = channelIndex
        channelIndex = (channelIndex + 1) % 16
        if (channelIndex == 9)
            channelIndex += 1

        const trackInstr = Project.trackGetInstrument(track)
        const sflibMeta = Playback.getSflibMeta()
        if (trackInstr &&
            trackInstr.type === "sflib" &&
            sflibMeta)
        {
            const coll = sflibMeta.collections.find(c => c.id == trackInstr.collectionId)!
            const instr = coll.instruments.find(instr => instr.id === trackInstr.instrumentId)
            
            if (instr)
            {
                if (instr.midiBank === 128)
                    channel = 9

                midiTrack.events.push({
                    kind: "programChange",
                    channel,
                    tick: new Rational(0),
                    program: instr.midiPreset,
                })
            }
        }

        midiTrack.events.push({
            kind: "controller",
            channel,
            tick: new Rational(0),
            controllerName: "channelVolumeCoarse",
            controllerNumber: 7,
            controllerValue: track.mute ?
                0 :
                MathUtils.dbToMidiVolume(track.volumeDb) * 0x7f,
        })


        const listNoteBlocks = project.lists.get(track.id)
        if (!listNoteBlocks)
            continue

        for (const elemNoteBlock of listNoteBlocks.iterAll())
        {
            if (elemNoteBlock.type !== "noteBlock")
                continue

            const listNotes = project.lists.get(elemNoteBlock.id)
            if (!listNotes)
                continue

            for (const elemNote of listNotes.iterAll())
            {
                if (elemNote.type !== "note")
                    continue

                const absRange = elemNote.range
                    .displace(elemNoteBlock.range.start)
                    .subtract(project.range.start)

                midiTrack.events.push({
                    kind: "noteOn",
                    tick: absRange.start,
                    channel,
                    key: elemNote.midiPitch,
                    velocity: MathUtils.dbToMidiVolume(elemNote.velocity) * 0x7f,
                })
    
                midiTrack.events.push({
                    kind: "noteOff",
                    tick: absRange.end,
                    channel,
                    key: elemNote.midiPitch,
                    velocity: 0x7f,
                })
            }
        }


        midiTrack.events.push({
            kind: "endOfTrack",
            tick: midiTrack.events.length == 0 ?
                new Rational(0) :
                midiTrack.events[midiTrack.events.length - 1].tick,
        })


        midi.tracks.push(midiTrack)
    }

    return Midi.Encoder.encode(midi)
}