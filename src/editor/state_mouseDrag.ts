import * as Editor from "./index"
import * as Project from "../project"
import Range from "../util/range"


export function mouseDrag(data: Editor.EditorUpdateData, pos: { x: number, y: number }): boolean
{
    if (!data.state.mouse.down)
        return false

    data.state.mouse.pointPrev = data.state.mouse.point
    data.state.mouse.point = Editor.pointAt(data, pos)
    
    data.state.drag.posDelta =
    {
        x: data.state.mouse.point.pos.x - data.state.drag.origin.point.pos.x,
        y: data.state.mouse.point.pos.y - data.state.drag.origin.point.pos.y,
    }

    data.state.drag.timeDelta =
        data.state.mouse.point.time.subtract(data.state.drag.origin.point.time)

    data.state.drag.trackDelta =
        data.state.mouse.point.trackIndex - data.state.drag.origin.point.trackIndex

    data.state.drag.xLocked =
        data.state.drag.xLocked &&
        Math.abs(data.state.drag.posDelta.x) < data.prefs.editor.mouseDragXLockedDistance

    data.state.drag.yLocked =
        data.state.drag.yLocked &&
        Math.abs(data.state.drag.posDelta.y) < data.prefs.editor.mouseDragYLockedDistance
    
    if (!data.state.drag.yLocked)
    {
        data.state.drag.trackInsertionBefore =
            Editor.trackInsertionAtY(data, data.state.mouse.point.pos.y)
    }

    if (data.state.mouse.action == Editor.EditorAction.Pan)
    {
        data.state.timeScroll =
            data.state.drag.origin.timeScroll -
            (data.state.drag.posDelta.x / data.state.timeScale)

        data.state.trackScroll =
            data.state.drag.origin.trackScroll -
            data.state.drag.posDelta.y

        return true
    }
    else if (data.state.mouse.action == Editor.EditorAction.SelectCursor)
    {
        data.state.cursor.time2 = data.state.mouse.point.time
        data.state.cursor.trackIndex2 = data.state.mouse.point.trackIndex

        Editor.selectionClear(data)
        Editor.selectionAddAtCursor(data)
        return true
    }
    else if (data.state.mouse.action == Editor.EditorAction.DragTrack)
    {
        return true
    }
    else if (data.state.mouse.action == Editor.EditorAction.Pencil)
    {
        for (let t = 0; t < data.state.tracks.length; t++)
            data.state.tracks[t].pencilDrag(data)
        
        return true
    }
    else
    {
        let blockedActions = Editor.EditorAction.None
        
		if (data.state.drag.xLocked)
            blockedActions |=
                Editor.EditorAction.DragTime |
                Editor.EditorAction.StretchTimeEnd |
                Editor.EditorAction.StretchTimeStart

		if (data.state.drag.yLocked)
            blockedActions |= Editor.EditorAction.DragRow

        const mouseAction = data.state.mouse.action & ~blockedActions
        
        let newProject = data.state.drag.origin.project

		for (const id of data.state.selection)
		{
			const elem = data.state.drag.origin.project.elems.get(id)
			if (!elem)
                continue

            if (elem.type == Project.ElementType.Track)
                continue
                
			let changes: any = {}

            if (mouseAction & Editor.EditorAction.DragTime)
                changes.range = elem.range.displace(data.state.drag.timeDelta)
            
            if (mouseAction & Editor.EditorAction.StretchTimeStart &&
                data.state.drag.origin.range)
            {
                changes.range = elem.range.stretch(
                    data.state.drag.timeDelta,
                    data.state.drag.origin.range.end,
                    data.state.drag.origin.range.start)

                if (elem.range.start.compare(data.state.drag.origin.range.start) == 0)
                    changes.range = new Range(
                        changes.range.start.snap(data.state.timeSnap),
                        changes.range.end)
                    
                changes.range = changes.range.sorted()
            }

            if (mouseAction & Editor.EditorAction.StretchTimeEnd &&
                data.state.drag.origin.range)
            {
                changes.range = elem.range.stretch(
                    data.state.drag.timeDelta,
                    data.state.drag.origin.range.start,
                    data.state.drag.origin.range.end)

                if (elem.range.end.compare(data.state.drag.origin.range.end) == 0)
                    changes.range = new Range(
                        changes.range.start,
                        changes.range.end.snap(data.state.timeSnap))

                changes.range = changes.range.sorted()
            }
        
            /*if (mouseAction & Editor.EditorAction.DragRow)
            {
                const note = rangedElem as Project.Note
                const key = Editor.keyAt(state, state.contentState.tracks[state.contentState.drag.trackOrigin].trackId, rangedElem.range.start)
                const degree = key.octavedDegreeForMidi(note.pitch)
                const newPitch = key.midiForDegree(Math.floor(degree + mouseDrag.rowDelta))
                changes.pitch = newPitch
            }*/

            if (data.state.drag.trackDelta != 0)
            {
                const origTrackIndex = data.state.tracks.findIndex(t => t.projectTrackId == elem.parentId)
                const newTrackIndex = Math.max(0, Math.min(data.state.tracks.length - 1, origTrackIndex + data.state.drag.trackDelta))
                changes.parentId = data.state.tracks[newTrackIndex].projectTrackId
            }
            
            newProject = Project.Root.upsertElement(
                newProject,
                Project.elemModify(elem, changes))
        }

        data.project = newProject
        return true
    }

    return false
}