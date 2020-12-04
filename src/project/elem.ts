import Range from "../util/range"
import * as Theory from "../theory"
import * as Playback from "../playback"
import Rational from "../util/rational"
import { IntersectionType } from "typescript"


export type ID = number


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
}


export interface TrackNotes extends TrackBase
{
    trackType: "notes"
    instrument: Instrument
    volume: number
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
    velocity: number
}


export type Element =
    Track |
    KeyChange |
    MeterChange |
    NoteBlock |
    Note



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
        name: "New Track",
        volume: 1,
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

            return coll.name + "/" + instr.name
        }

        default: return "???"
    }
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
    velocity: number)
    : Note
{
    return {
        type: "note",
        id: -1,
        parentId,
        range,
        midiPitch,
        velocity,
    }
}