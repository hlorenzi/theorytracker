import Range from "../util/range"
import * as Theory from "../theory"
import * as Playback from "../playback"
import Rational from "../util/rational"


export type ID = number


export interface Element
{
    type: ElementType
    id: ID
    parentId: ID
    range: Range
}


export enum ElementType
{
    Track,
    Note,
    NoteBlock,
    KeyChange,
    MeterChange,
}


export enum TrackType
{
    Notes,
    KeyChanges,
    MeterChanges,
}


export interface Track extends Element
{
    trackType: TrackType
    name: string
    instruments: Instrument[]
    volume: number
}


export interface InstrumentBasic
{
    instrumentType: "basic"
}


export interface InstrumentSflib
{
    instrumentType: "sflib"
    collectionId: string
    instrumentId: string
}


export type Instrument =
    InstrumentBasic |
    InstrumentSflib


export interface KeyChange extends Element
{
    key: Theory.Key
}


export interface MeterChange extends Element
{
    meter: Theory.Meter
}


export interface NoteBlock extends Element
{
    
}


export interface Note extends Element
{
    midiPitch: number
    velocity: number
}


export function elemModify<T>(original: T, changes: Partial<T>): T
{
    return { ...original, ...changes }
}


export function makeTrackNotes(): Track
{
    return {
        type: ElementType.Track,
        id: -1,
        parentId: 0,
        trackType: TrackType.Notes,
        range: Range.dummy(),
        name: "New Track",
        instruments: [makeInstrument()],
        volume: 1,
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
                instrumentType: "basic",
            }
        }
        case "sflib":
        {
            return {
                instrumentType: "sflib",
                collectionId: "gm",
                instrumentId: "piano_1",
            }
        }
    }
}


export function instrumentName(instrument: Instrument): string
{
    switch (instrument.instrumentType)
    {
        case "basic": return "Basic"
        case "sflib":
        {
            const sflibMeta = Playback.getSflibMeta()
            if (!sflibMeta)
                return instrument.collectionId + "/" + instrument.instrumentId

            const coll = sflibMeta.collectionsById.get(instrument.collectionId)!
            const instr = coll.instrumentsById.get(instrument.instrumentId)!

            return coll.name + "/" + instr.name
        }

        default: return "???"
    }
}


export function makeTrackKeyChanges(): Track
{
    return {
        type: ElementType.Track,
        id: -1,
        parentId: 0,
        trackType: TrackType.KeyChanges,
        range: Range.dummy(),
        name: "Key Changes",
        instruments: [],
        volume: 1,
    }
}


export function makeTrackMeterChanges(): Track
{
    return {
        type: ElementType.Track,
        id: -1,
        parentId: 0,
        trackType: TrackType.MeterChanges,
        range: Range.dummy(),
        name: "Meter Changes",
        instruments: [],
        volume: 1,
    }
}


export function makeMeterChange(parentId: ID, time: Rational, meter: Theory.Meter): MeterChange
{
    return {
        type: ElementType.MeterChange,
        id: -1,
        parentId,
        range: Range.fromPoint(time),
        meter,
    }
}


export function makeKeyChange(parentId: ID, time: Rational, key: Theory.Key): KeyChange
{
    return {
        type: ElementType.KeyChange,
        id: -1,
        parentId,
        range: Range.fromPoint(time),
        key,
    }
}


export function makeNoteBlock(parentId: ID, range: Range): NoteBlock
{
    return {
        type: ElementType.NoteBlock,
        id: -1,
        parentId,
        range,
    }
}


export function makeNote(
    parentId: ID,
    range: Range,
    midiPitch: number,
    velocity: number)
    : Note
{
    return {
        type: ElementType.Note,
        id: -1,
        parentId,
        range,
        midiPitch,
        velocity,
    }
}