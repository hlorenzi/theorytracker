import * as Theory from "../theory"
import Range from "../utils/range.ts"
import Rational from "../utils/rational.ts"


export type ID = number


export const MinVolumeDb = -30
export const MaxVolumeDb = 0
export const DefaultVolumeDb = 0
export const DefaultChordVolumeDb = -4


export interface ElementBase
{
    id: ID
    parentId: ID
    range: Range
}


export interface TrackBase extends ElementBase
{
    type: "track"
    name: string
}


export interface TrackKeyChanges extends TrackBase
{
    trackType: "keyChanges"
}


export interface TrackMeterChanges extends TrackBase
{
    trackType: "meterChanges"
}


export interface TrackChords extends TrackBase
{
    trackType: "chords"
    mute: boolean
    solo: boolean
}


export interface TrackNotes extends TrackBase
{
    trackType: "notes"
    mute: boolean
    solo: boolean
}


export type Track = 
    TrackKeyChanges |
    TrackMeterChanges |
    TrackChords |
    TrackNotes


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


export interface Note extends ElementBase
{
    type: "note"
    midiPitch: number
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
        mute: false,
        solo: false,
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
        mute: false,
        solo: false,
    }
}


export function trackDisplayName(track: Track): string
{
    if (track.name)
        return track.name

    return "New Track"
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


export function makeNote(
    parentId: ID,
    range: Range,
    midiPitch: number)
    : Note
{
    return {
        type: "note",
        id: -1,
        parentId,
        range,
        midiPitch,
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