import * as Project from "../project"
import * as Timeline from "./index.ts"
import * as Prefs from "../prefs.ts"
import * as Theory from "../theory/index.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"
import Rational from "../utils/rational.ts"


export interface LayoutElementCommon
{
    id?: Project.ID
    trackId?: Project.ID
    laneIndex?: number
    action?: Timeline.MouseAction
    ghost?: boolean
    rect: Rect
    zIndex?: number
    zIndexForHover?: number
    cutStart?: boolean
    cutEnd?: boolean
    priority?: number
    subElements?: LayoutElement[]
}


export interface LayoutElementHidden extends LayoutElementCommon
{
    kind: "hidden"
}


export interface LayoutElementLaneCommon extends LayoutElementCommon
{
    laneIndex: number
    iterElementsAtRegion?: (
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        => Generator<Project.ID, void, void>
}


export interface LayoutElementLaneMarkers extends LayoutElementLaneCommon
{
    kind: "laneMarkers"
}


export interface LayoutElementLaneNotes extends LayoutElementLaneCommon
{
    kind: "laneNotes"
}


export interface LayoutElementLaneChords extends LayoutElementLaneCommon
{
    kind: "laneChords"
}


export interface LayoutElementNote extends LayoutElementCommon
{
    kind: "note"
    note: Project.Note
    key: Theory.Key
}


export interface LayoutElementChord extends LayoutElementCommon
{
    kind: "chord"
    chord: Project.Chord
    key: Theory.Key
}


export interface LayoutElementMarker extends LayoutElementCommon
{
    kind: "marker"
    tempoCh?: Project.TempoChange
    keyCh?: Project.KeyChange
    keyChPrev?: Project.KeyChange
    meterCh?: Project.MeterChange
}


export type LayoutElement =
    LayoutElementHidden |
    LayoutElementLaneMarkers |
    LayoutElementLaneNotes |
    LayoutElementLaneChords |
    LayoutElementNote |
    LayoutElementChord |
    LayoutElementMarker


export type LayoutLane =
    LayoutElementLaneMarkers |
    LayoutElementLaneNotes |
    LayoutElementLaneChords


export interface KeyRegion
{
    keyCh1: Project.KeyChange
    keyCh2: Project.KeyChange
    range: Range
    x1: number
    x2: number
}


export interface ChordRegionTone
{
    row: number
    degree: number
}


export interface ChordRegion
{
    key: Theory.Key
    chord: Theory.Chord
    x1: number
    x2: number
    tones: ChordRegionTone[]
}


export interface Marker
{
    time: Rational
    tempoCh?: Project.TempoChange
    keyCh?: Project.KeyChange
    meterCh?: Project.MeterChange
}


export class Layout
{
    range: Range
    inBoundsRange: Range
    lanes: Timeline.Lane[] = []

    measures: Project.Measure[] = []
    keyRegions: KeyRegion[] = []
    chordRegions: ChordRegion[] = []
    chordTonesVisible: boolean = true
    markers: Marker[] = []


    constructor()
    {
        
    }


    addLane(lane: Timeline.Lane)
    {
        lane.laneIndex = this.lanes.length
        this.lanes.push(lane)
    }


    getElementCount()
    {
        let count = 0
        for (const lane of this.lanes)
            count += lane.elements.length

        return count
    }
}


export function layout(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    prefs: Prefs.Prefs)
{
    const layout = new Layout()
    timeline.layout = layout
    
    layout.range = Timeline.visibleTimeRange(timeline)
    layout.inBoundsRange = project.range
    layout.measures = [...Project.iterMeasuresAtRange(project, layout.range)]
    layout.keyRegions = [...iterKeyChangePairsAtRange(timeline, project, layout.range)]
    layout.chordRegions = [...iterChordRegions(timeline, project, layout.keyRegions)]
    layout.chordTonesVisible = !!Project.getTrack(project, project.chordTrackId, "chords")?.visible
    layout.markers = []


    const laneChordH = 60
    const laneMarginY = 8

    const laneNotes = new Timeline.LaneNotes()
    laneNotes.rect = new Rect(
        0,
        0,
        timeline.renderRect.w,
        timeline.renderRect.h - laneChordH - laneMarginY)

    const laneChords = new Timeline.LaneChords()
    laneChords.rect = new Rect(
        0,
        timeline.renderRect.h - laneChordH,
        timeline.renderRect.w,
        laneChordH - 1)

    layout.addLane(laneNotes)
    layout.addLane(laneChords)

    laneNotes.refreshLayout(timeline, project, prefs)
    laneChords.refreshLayout(timeline, project, prefs)

    //console.log(layout.getElementCount(), layout)
}


function *iterKeyChangePairsAtRange(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    range: Range)
    : Generator<KeyRegion, void, void>
{
    const keyChangeTrackTimedElems = project.lists.get(project.keyChangeTrackId)
    if (!keyChangeTrackTimedElems)
        return

    const firstKeyCh = keyChangeTrackTimedElems.findFirst() as (Project.KeyChange | null)
    const defaultKey = firstKeyCh?.key ?? Project.defaultKey()

    for (const pair of keyChangeTrackTimedElems.iterActiveAtRangePairwise(range))
    {
        const keyCh1 =
            pair[0] as Project.KeyChange ??
            Project.makeKeyChange(-1, range.start, defaultKey)

        const keyCh2 =
            pair[1] as Project.KeyChange ??
            Project.makeKeyChange(-1, range.end,   defaultKey)

        const regionRange = new Range(
            keyCh1.range.start.max(range.start),
            keyCh2.range.start.min(range.end))
        
        const x1 = Timeline.xAtTime(timeline, keyCh1.range.start)
        const x2 = Timeline.xAtTime(timeline, keyCh2.range.start)
        
        yield {
            keyCh1,
            keyCh2,
            range: regionRange,
            x1,
            x2,
        }
    }
}


function *iterChordRegions(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    keyRegions: KeyRegion[])
    : Generator<ChordRegion, void, void>
{
    const chordTrackElems = project.lists.get(project.chordTrackId)
    if (!chordTrackElems)
        return

    for (const keyRegion of keyRegions)
    {
        const key = keyRegion.keyCh1.key

        for (const elem of chordTrackElems.iterAtRange(keyRegion.range))
        {
            const chord = elem as Project.Chord
            const x1 = Timeline.xAtTime(timeline, chord.range.start.max(keyRegion.range.start))
            const x2 = Timeline.xAtTime(timeline, chord.range.end.min(keyRegion.range.end))

            const tones: ChordRegionTone[] = chord.chord.pitches.map(pitch => {
                const row = Timeline.rowForPitch(pitch, key)
                const degree = key.degreeForMidi(pitch)
                return {
                    row,
                    degree,
                }
            })
            
            yield {
                key: keyRegion.keyCh1.key,
                chord: chord.chord,
                x1,
                x2,
                tones,
            }
        }
    }
}