import Range from "../util/range"
import * as Theory from "../theory"
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
}


export interface NoteBlock extends Element
{
    
}


export interface MeterChange extends Element
{
    meter: Theory.Meter
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