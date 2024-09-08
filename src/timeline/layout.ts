import * as Project from "../project"
import * as Timeline from "./index.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"


export interface LayoutElementCommon
{
    id?: Project.ID
    action?: Timeline.MouseAction
    rect: Rect
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
    kind: "lane"
}


export interface LayoutElementLaneNotes extends LayoutElementLaneCommon
{
    kind: "laneNotes"
}


export interface LayoutElementNote extends LayoutElementCommon
{
    kind: "note"
}


export type LayoutElement =
    LayoutElementHidden |
    LayoutElementLaneMarkers |
    LayoutElementLaneNotes |
    LayoutElementNote


export type LayoutLane =
    LayoutElementLaneMarkers |
    LayoutElementLaneNotes


export interface KeyRegion
{
    keyCh1: Project.KeyChange
    keyCh2: Project.KeyChange
    x1: number
    x2: number
}


export class Layout
{
    range: Range
    lanes: LayoutLane[] = []
    elements: LayoutElement[] = []
    elementCount: number = 0
    laneNotes?: LayoutElementLaneNotes

    measures: Project.Measure[] = []
    keyRegions: KeyRegion[] = []


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

            if (elem.kind === "lane" ||
                elem.kind === "laneNotes")
                this.lanes.push(elem)
        }
    }
}


export function layout(
    timeline: Timeline.State,
    project: Project.ImmutableRoot)
{
    const layout = new Layout()
    layout.range = Timeline.visibleTimeRange(timeline)
    layout.measures = [...Project.iterMeasuresAtRange(project, layout.range)]
    layout.keyRegions = [...iterKeyChangePairsAtRange(timeline, project, layout.range)]


    const laneMarkerH = 32
    const laneChordH = 60
    const laneMarginH = 8

    const laneKeyChanges: LayoutElementLaneMarkers = {
        kind: "lane",
        laneIndex: 0,
        rect: new Rect(
            0,
            0,
            timeline.renderRect.w,
            laneMarkerH),
    }

    const laneMeterChanges: LayoutElementLaneMarkers = {
        kind: "lane",
        laneIndex: 1,
        rect: new Rect(
            0,
            laneMarkerH + laneMarginH,
            timeline.renderRect.w,
            laneMarkerH),
    }

    const laneChords: LayoutElementLaneMarkers = {
        kind: "lane",
        laneIndex: 2,
        rect: new Rect(
            0,
            laneMarkerH + laneMarginH +
                laneMarkerH + laneMarginH,
            timeline.renderRect.w,
            laneChordH),
    }

    const laneNotesY =
        laneMarkerH + laneMarginH +
        laneMarkerH + laneMarginH +
        laneChordH + laneMarginH
    
    const laneNotes: LayoutElementLaneNotes = {
        kind: "laneNotes",
        laneIndex: 3,
        rect: new Rect(
            0,
            laneNotesY,
            timeline.renderRect.w,
            timeline.renderRect.h - laneNotesY),
    }

    layout.add(undefined, laneKeyChanges)
    layout.add(undefined, laneMeterChanges)
    layout.add(undefined, laneChords)
    layout.add(undefined, laneNotes)
    layout.laneNotes = laneNotes

    Timeline.layoutLaneNotes(timeline, project, layout, laneNotes)

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