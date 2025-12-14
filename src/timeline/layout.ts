import * as Project from "../project"
import * as Timeline from "./index.ts"
import * as Prefs from "../prefs.ts"
import * as Theory from "../theory/index.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"
import Rational from "utils/rational.ts"


export interface LayoutElementCommon
{
    id?: Project.ID
    action?: Timeline.MouseAction
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
    keyCh?: Project.KeyChange
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
    x1: number
    x2: number
}


export interface Marker
{
    time: Rational
    keyCh?: Project.KeyChange
    meterCh?: Project.MeterChange
}


export class Layout
{
    range: Range
    lanes: LayoutLane[] = []
    elements: LayoutElement[] = []
    elementCount: number = 0
    laneNotes?: LayoutElementLaneNotes
    laneChords?: LayoutElementLaneChords

    measures: Project.Measure[] = []
    keyRegions: KeyRegion[] = []
    markers: Marker[] = []


    constructor()
    {
        
    }


    add(parent: LayoutElement | undefined, elem: LayoutElement)
    {
        this.elementCount++

        if (parent !== undefined)
        {
            if (parent.subElements === undefined)
                parent.subElements = []
            
            parent.subElements.push(elem)
        }
        else
        {
            this.elements.push(elem)

            if (elem.kind === "laneMarkers" ||
                elem.kind === "laneNotes" ||
                elem.kind === "laneChords")
                this.lanes.push(elem)
        }
    }
}


export function layout(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    prefs: Prefs.Prefs)
{
    const layout = new Layout()
    layout.range = Timeline.visibleTimeRange(timeline)
    layout.measures = [...Project.iterMeasuresAtRange(project, layout.range)]
    layout.keyRegions = [...iterKeyChangePairsAtRange(timeline, project, layout.range)]
    layout.markers = []


    const laneChordH = 60
    const laneMarginY = 8

    const laneNotes: LayoutElementLaneNotes = {
        kind: "laneNotes",
        laneIndex: 0,
        rect: new Rect(
            0,
            0,
            timeline.renderRect.w,
            timeline.renderRect.h - laneChordH - laneMarginY),
    }

    const laneChords: LayoutElementLaneChords = {
        kind: "laneChords",
        laneIndex: 1,
        rect: new Rect(
            0,
            timeline.renderRect.h - laneChordH,
            timeline.renderRect.w,
            laneChordH - 1),
    }

    layout.add(undefined, laneNotes)
    layout.add(undefined, laneChords)
    layout.laneNotes = laneNotes

    Timeline.layoutLaneMarkers(timeline, project, prefs, layout, laneNotes)
    Timeline.layoutLaneNotes(timeline, project, prefs, layout, laneNotes)
    Timeline.layoutLaneChords(timeline, project, prefs, layout, laneChords)

    timeline.layout = layout
    console.log(layout.elementCount, layout)
}


function *iterKeyChangePairsAtRange(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    range: Range)
    : Generator<KeyRegion, void, void>
{
    const keyChangeTrackId = Project.keyChangeTrackId(project)
    const keyChangeTrackTimedElems = project.lists.get(keyChangeTrackId)
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
        
        const x1 = Timeline.xAtTime(timeline, keyCh1.range.start)
        const x2 = Timeline.xAtTime(timeline, keyCh2.range.start)
        
        yield {
            keyCh1,
            keyCh2,
            x1,
            x2,
        }
    }
}