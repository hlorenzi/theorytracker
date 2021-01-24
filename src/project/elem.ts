import Range from "../util/range"
import * as Theory from "../theory"
import * as Playback from "../playback"
import Rational from "../util/rational"
import * as Misc from "../util/misc"


export type ID = number

export const MinVolumeDb = -30
export const DefaultVolumeDb = 0
export const MaxVolumeDb = 0


export interface ElementBase
{
    id: ID
    parentId: ID
    range: Range
}


export interface InstrumentBasic
{
    type: "basic"
}


export interface InstrumentSflib
{
    type: "sflib"
    collectionId: string
    instrumentId: string
}


export type Instrument =
    InstrumentBasic |
    InstrumentSflib


export interface TrackBase extends ElementBase
{
    type: "track"
    name: string
    mute: boolean
    solo: boolean
}


export interface TrackNotes extends TrackBase
{
    trackType: "notes"
    instrument: Instrument
    volumeDb: number
}


export interface TrackChords extends TrackBase
{
    trackType: "chords"
    instrument: Instrument
    volumeDb: number
}


export interface TrackKeyChanges extends TrackBase
{
    trackType: "keyChanges"
}


export interface TrackMeterChanges extends TrackBase
{
    trackType: "meterChanges"
}


export type Track = 
    TrackNotes |
    TrackChords |
    TrackKeyChanges |
    TrackMeterChanges


export interface KeyChange extends ElementBase
{
    type: "keyChange"
    key: Theory.Key
}


export interface MeterChange extends ElementBase
{
    type: "meterChange"
    meter: Theory.Meter
}


export interface NoteBlock extends ElementBase
{
    type: "noteBlock"
}


export interface Note extends ElementBase
{
    type: "note"
    midiPitch: number
    volumeDb: number
    velocity: number
}


export interface Chord extends ElementBase
{
    type: "chord"
    chord: Theory.Chord
}


export type Element =
    Track |
    KeyChange |
    MeterChange |
    NoteBlock |
    Note |
    Chord



export function elemModify<T>(original: T, changes: Partial<T>): T
{
    return { ...original, ...changes }
}


export function makeTrackNotes(): TrackNotes
{
    return {
        type: "track",
        trackType: "notes",
        id: -1,
        parentId: 0,
        range: Range.dummy(),
        name: "",
        volumeDb: DefaultVolumeDb,
        mute: false,
        solo: false,
        instrument: makeInstrument(),
    }
}


export function makeTrackChords(): TrackChords
{
    return {
        type: "track",
        trackType: "chords",
        id: -1,
        parentId: 0,
        range: Range.dummy(),
        name: "Chords",
        volumeDb: DefaultVolumeDb,
        mute: false,
        solo: false,
        instrument: makeInstrument(),
    }
}


export function makeInstrument(): Instrument
{
    return makeInstrumentOfKind("sflib")
}


export function makeInstrumentOfKind(kind: string): Instrument
{
    switch (kind)
    {
        case "basic":
        default:
        {
            return {
                type: "basic",
            }
        }
        case "sflib":
        {
            return {
                type: "sflib",
                collectionId: "gm",
                instrumentId: "piano_1",
            }
        }
    }
}


export function instrumentName(instrument: Instrument): string
{
    switch (instrument.type)
    {
        case "basic": return "Basic"
        case "sflib":
        {
            const sflibMeta = Playback.getSflibMeta()
            if (!sflibMeta)
                return instrument.collectionId + "/" + instrument.instrumentId

            const coll = sflibMeta.collectionsById.get(instrument.collectionId)!
            const instr = coll.instrumentsById.get(instrument.instrumentId)!
            const emoji = Misc.getMidiPresetEmoji(instr.midiBank, instr.midiPreset)

            return emoji + " " + coll.id + "/" + instr.name
        }

        default: return "???"
    }
}


export function instrumentEmoji(instrument: Instrument): string
{
    switch (instrument.type)
    {
        case "basic": return Misc.getMidiPresetEmoji(0, 0)
        case "sflib":
        {
            const sflibMeta = Playback.getSflibMeta()
            if (!sflibMeta)
                return Misc.getMidiPresetEmoji(0, 0)

            const coll = sflibMeta.collectionsById.get(instrument.collectionId)!
            const instr = coll.instrumentsById.get(instrument.instrumentId)!
            return Misc.getMidiPresetEmoji(instr.midiBank, instr.midiPreset)
        }

        default: return Misc.getMidiPresetEmoji(0, 0)
    }
}


export function trackDisplayName(track: Track): string
{
    if (track.trackType == "notes" || track.trackType == "chords")
    {
        if (track.name)
            return instrumentEmoji(track.instrument) + " " + track.name
    
        return instrumentName(track.instrument)
    }

    if (track.name)
        return track.name

    return "New Track"
}


export function trackHasInstrument(track: Track): boolean
{
    return track.trackType == "notes" || track.trackType == "chords"
}


export function trackGetInstrument(track: Track): Instrument | null
{
    if (track.trackType == "notes" || track.trackType == "chords")
        return track.instrument
    else
        return null
}


export function makeTrackKeyChanges(): TrackKeyChanges
{
    return {
        type: "track",
        trackType: "keyChanges",
        id: -1,
        parentId: 0,
        range: Range.dummy(),
        name: "Key Changes",
        mute: false,
        solo: false,
    }
}


export function makeTrackMeterChanges(): TrackMeterChanges
{
    return {
        type: "track",
        trackType: "meterChanges",
        id: -1,
        parentId: 0,
        range: Range.dummy(),
        name: "Meter Changes",
        mute: false,
        solo: false,
    }
}


export function makeMeterChange(parentId: ID, time: Rational, meter: Theory.Meter): MeterChange
{
    return {
        type: "meterChange",
        id: -1,
        parentId,
        range: Range.fromPoint(time),
        meter,
    }
}


export function makeKeyChange(parentId: ID, time: Rational, key: Theory.Key): KeyChange
{
    return {
        type: "keyChange",
        id: -1,
        parentId,
        range: Range.fromPoint(time),
        key,
    }
}


export function makeNoteBlock(parentId: ID, range: Range): NoteBlock
{
    return {
        type: "noteBlock",
        id: -1,
        parentId,
        range,
    }
}


export function makeNote(
    parentId: ID,
    range: Range,
    midiPitch: number,
    volumeDb: number,
    velocity: number)
    : Note
{
    return {
        type: "note",
        id: -1,
        parentId,
        range,
        midiPitch,
        volumeDb,
        velocity,
    }
}


export function makeChord(
    parentId: ID,
    range: Range,
    chord: Theory.Chord)
    : Chord
{
    return {
        type: "chord",
        id: -1,
        parentId,
        range,
        chord,
    }
}