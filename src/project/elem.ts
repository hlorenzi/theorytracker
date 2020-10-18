import Range from "../util/range"
import * as Theory from "../theory"


export type ID = number


export enum ElementType
{
    Track,
    Note,
    NoteBlock,
    KeyChange,
    MeterChange,
}


export class Element
{
    type: ElementType = -1
    id: ID = 0
    parentId: ID = 0


    constructor(type: ElementType, parentId: ID)
    {
        this.type = type
        this.parentId = parentId
    }


    static withChanges<T>(original: T, changes: any): T
    {
        return Object.assign({}, original, changes)
    }
}


export enum TrackType
{
    Notes,
    KeyChanges,
    MeterChanges,
}


export class Track extends Element
{
    trackType: TrackType = 0


    constructor(trackType: TrackType)
    {
        super(ElementType.Track, 0)
        this.trackType = trackType
    }


    withChanges(changes: any): this
    {
        return Object.assign({}, this, changes)
    }
}


export enum TrackInstrumentType
{
    Sflib,
}


export interface TrackInstrument
{
    instrumentType: TrackInstrumentType
}


export interface TrackInstrumentSflib extends TrackInstrument
{
    collectionId: string
    instrumentId: string
}


export class TrackNotes extends Track
{
    instrument: TrackInstrument


    constructor()
    {
        super(TrackType.Notes)
        this.instrument = <TrackInstrumentSflib>{
            instrumentType: TrackInstrumentType.Sflib,
            collectionId: "arachno",
            instrumentId: "grand_piano",
        }
    }
}


export class RangedElement extends Element
{
    range: Range


    constructor(type: ElementType, parentId: ID, range: Range)
    {
        super(type, parentId)
        this.range = range
    }
}


export class NoteBlock extends RangedElement
{
    constructor(parentId: ID, range: Range)
    {
        super(ElementType.NoteBlock, parentId, range)
    }
}


export class Note extends RangedElement
{
    pitch: number


    constructor(parentId: ID, range: Range, pitch: number)
    {
        super(ElementType.Note, parentId, range)
        this.pitch = pitch
    }
}


export class KeyChange extends RangedElement
{
    key: Theory.Key


    constructor(parentId: ID, range: Range, key: Theory.Key)
    {
        super(ElementType.KeyChange, parentId, range)
        this.key = key
    }
}


export class MeterChange extends RangedElement
{
    meter: Theory.Meter


    constructor(parentId: ID, range: Range, meter: Theory.Meter)
    {
        super(ElementType.MeterChange, parentId, range)
        this.meter = meter
    }
}