import * as Project from "../project"
import * as Theory from "../theory"
import * as Timeline from "./index.ts"
import * as Prefs from "../prefs.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"
import Rational from "../utils/rational.ts"


export function layoutLaneMarkers(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    prefs: Prefs.Prefs,
    layout: Timeline.Layout,
    lane: Timeline.LayoutElementLaneNotes)
{
    lane.iterElementsAtRegion = (timeline, project, range, verticalRegion) =>
        iterMarkersForSelection(timeline, project, range)

    for (const elem of iterMarkersForLayout(timeline, project, layout.range))
    {
        const rect = rectForMarker(
            timeline,
            lane,
            elem.type === "keyChange" ? 0 :
                1,
            elem.range.start)
        
        layout.add(lane, {
            kind: "marker",
            id: elem.id,
            action: Timeline.MouseAction.DragTime,
            rect,
            priority: 1,
            zIndex: 1,
            keyCh: elem.type === "keyChange" ? elem : undefined,
            meterCh: elem.type === "meterChange" ? elem : undefined,
        })

        layout.markers.push({
            time: elem.range.start,
            keyCh: elem.type === "keyChange" ? elem : undefined,
            meterCh: elem.type === "meterChange" ? elem : undefined,
        })
    }
}


function *iterMarkersForLayout(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    range: Range)
    : Generator<Project.KeyChange | Project.MeterChange, void, void>
{
    const keyChTrackId = Project.keyChangeTrackId(project)
    const keyChTrackElems = project.lists.get(keyChTrackId)
    if (!keyChTrackElems)
        return

    for (const keyCh of keyChTrackElems.iterAtRange(range))
    {
        yield keyCh as Project.KeyChange
    }
    
    const meterChTrackId = Project.meterChangeTrackId(project)
    const meterChTrackElems = project.lists.get(meterChTrackId)
    if (!meterChTrackElems)
        return

    for (const meterCh of meterChTrackElems.iterAtRange(range))
    {
        yield meterCh as Project.MeterChange
    }
}


function rectForMarker(
    timeline: Timeline.State,
    lane: Timeline.LayoutLane,
    row: number,
    time: Rational)
    : Rect
{
    const x = Timeline.xAtTime(timeline, time)
    const w = 16
    const h = 24
    const y = lane.rect.y + h * row
    
    return new Rect(x - w / 2, y, w, h)
}


export function *iterMarkersForSelection(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    range: Range)
    : Generator<Project.ID, void, void>
{
    const keyChTrackId = Project.keyChangeTrackId(project)
    const keyChTrackElems = project.lists.get(keyChTrackId)
    if (!keyChTrackElems)
        return

    for (const keyCh of keyChTrackElems.iterAtRange(range))
    {
        yield keyCh.id
    }
    
    const meterChTrackId = Project.meterChangeTrackId(project)
    const meterChTrackElems = project.lists.get(meterChTrackId)
    if (!meterChTrackElems)
        return

    for (const meterCh of meterChTrackElems.iterAtRange(range))
    {
        yield meterCh.id
    }
}