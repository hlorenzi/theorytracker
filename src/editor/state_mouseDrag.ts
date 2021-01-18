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

    data.state.drag.rowDelta =
        data.state.mouse.point.row - data.state.drag.origin.point.row

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

    function withTrackAtDragOrigin<T>(fn: (track: Editor.EditorTrack) => T)
    {
        return fn(data.state.tracks[data.state.drag.origin.point.trackIndex])
    }

    if (data.state.mouse.action == Editor.EditorAction.Pan)
    {
        data.state.timeScroll =
            data.state.drag.origin.timeScroll -
            (data.state.drag.posDelta.x / data.state.timeScale)

        if (!data.state.trackScrollLocked)
            data.state.trackScroll =
                data.state.drag.origin.trackScroll -
                data.state.drag.posDelta.y

        withTrackAtDragOrigin(tr =>
        {
            if (tr.scrollEnabled)
                tr.yScroll =
                    data.state.drag.origin.trackYScroll -
                    data.state.drag.posDelta.y
        })

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
    else if (data.state.mouse.action == Editor.EditorAction.DragTrackHeader)
    {
        return true
    }
    else if (data.state.mouse.action == Editor.EditorAction.Pencil)
    {
        withTrackAtDragOrigin(tr => tr.pencilDrag(data))
        return true
    }
    else if (data.state.mouse.action == Editor.EditorAction.DragTrackControl)
    {
        handleDragTrackControl(data)
        return true
    }
    else if (data.state.mouse.action == Editor.EditorAction.DragClone)
    {
        if (!data.state.drag.xLocked || !data.state.drag.yLocked)
        {
            handleDragClone(data)
            return true
        }

        return false
    }
    else
    {
        let mouseAction = data.state.mouse.action
        
		if (data.state.drag.xLocked)
        {
            if (mouseAction == Editor.EditorAction.DragTime ||
                mouseAction == Editor.EditorAction.StretchTimeStart ||
                mouseAction == Editor.EditorAction.StretchTimeEnd)
                mouseAction = Editor.EditorAction.None
            else if (mouseAction == Editor.EditorAction.DragTimeAndRow)
                mouseAction = Editor.EditorAction.DragRow
        }

		if (data.state.drag.yLocked)
        {
            if (mouseAction == Editor.EditorAction.DragTimeAndRow)
                mouseAction = Editor.EditorAction.DragTime
            else if (mouseAction == Editor.EditorAction.DragRow)
                mouseAction = Editor.EditorAction.None
        }

        let newProject = data.state.drag.origin.project

		for (const id of data.state.selection)
		{
			const elem = data.state.drag.origin.project.elems.get(id)
			if (!elem)
                continue

            if (elem.type == "track")
                continue
                
			let changes: any = {}

            if (mouseAction == Editor.EditorAction.DragTime ||
                mouseAction == Editor.EditorAction.DragTimeAndRow)
                changes.range = elem.range.displace(data.state.drag.timeDelta)
            
            if (mouseAction == Editor.EditorAction.StretchTimeStart &&
                data.state.drag.origin.range)
            {
                changes.range = Editor.getAbsoluteRange(data, elem.parentId, elem.range)
                changes.range = changes.range.stretch(
                    data.state.drag.timeDelta,
                    data.state.drag.origin.range.end,
                    data.state.drag.origin.range.start)

                if (elem.range.start.compare(data.state.drag.origin.range.start) == 0)
                    changes.range = new Range(
                        changes.range.start.snap(data.state.timeSnap),
                        changes.range.end)
                    
                changes.range = changes.range.sorted()
                changes.range = Editor.getRelativeRange(data, elem.parentId, changes.range)
            }

            if (mouseAction == Editor.EditorAction.StretchTimeEnd &&
                data.state.drag.origin.range)
            {
                changes.range = Editor.getAbsoluteRange(data, elem.parentId, elem.range)
                changes.range = changes.range.stretch(
                    data.state.drag.timeDelta,
                    data.state.drag.origin.range.start,
                    data.state.drag.origin.range.end)

                if (elem.range.end.compare(data.state.drag.origin.range.end) == 0)
                    changes.range = new Range(
                        changes.range.start,
                        changes.range.end.snap(data.state.timeSnap))

                changes.range = changes.range.sorted()
                changes.range = Editor.getRelativeRange(data, elem.parentId, changes.range)
            }
        
            if ((mouseAction == Editor.EditorAction.DragRow ||
                mouseAction == Editor.EditorAction.DragTimeAndRow) &&
                elem.type == "note")
            {
                const note = elem as Project.Note
                const trackId = data.state.tracks[data.state.drag.origin.point.trackIndex].projectTrackId
                const key = Editor.keyAt(data, trackId, note.range.start)
                const degree = key.octavedDegreeForMidi(note.midiPitch)
                const newPitch = key.midiForDegree(Math.floor(degree + data.state.drag.rowDelta))
                changes.midiPitch = newPitch

                if (elem.id == data.state.drag.elemId)
                {
                    if ((data.state.drag.notePreviewLast && newPitch != data.state.drag.notePreviewLast) ||
                        (!data.state.drag.notePreviewLast && newPitch != note.midiPitch))
                    {
                        data.state.drag.notePreviewLast = newPitch
                        data.playback.playNotePreview(trackId, newPitch, note.velocity)
                    }
                }
            }

            if ((mouseAction == Editor.EditorAction.DragTime ||
                mouseAction == Editor.EditorAction.DragTimeAndRow ||
                mouseAction == Editor.EditorAction.DragRow) &&
                data.state.drag.trackDelta != 0)
            {
                const origTrackIndex = data.state.tracks.findIndex(t => t.projectTrackId == elem.parentId)
                const newTrackIndex = Math.max(0, Math.min(data.state.tracks.length - 1, origTrackIndex + data.state.drag.trackDelta))
                const newTrack = data.state.tracks[newTrackIndex]

                if (newTrack.acceptedElemTypes.has(elem.type))
                    changes.parentId = newTrack.projectTrackId
            }
            
            newProject = Project.upsertElement(
                newProject,
                Project.elemModify(elem, changes))
        }

        data.project = newProject
        return true
    }
}


function handleDragTrackControl(data: Editor.EditorUpdateData)
{
    const origTrack = Project.getElem(data.state.drag.origin.project, data.state.drag.elemId, "track")
    if (!origTrack)
        return


	const modifySelectedTracks = (func: (tr: Project.Track) => Project.Track) =>
	{
        let project = data.project

        for (const elemId of data.state.selection)
        {
            const track = Project.getElem(data.state.drag.origin.project, elemId, "track")
            if (!track)
                continue

			const newTrack = func(track)
			project = Project.upsertTrack(project, newTrack)
		}

        data.project = project
	}


	const modifyTrackAtMouse = (func: (tr: Project.Track) => Project.Track) =>
	{
        if (!data.state.hover)
            return
        
        let project = data.project

        const trackIndex = data.state.mouse.point.trackIndex
        if (trackIndex < 0 || trackIndex >= data.state.tracks.length)
            return
        
        const track = data.state.tracks[trackIndex]
        const projTrack = Project.getElem(data.state.drag.origin.project, track.projectTrackId, "track")
        if (!projTrack)
            return

        const newTrack = func(projTrack)
        project = Project.upsertTrack(project, newTrack)

        data.project = project
	}


	const modifyTrackAtMouseOrSelected = (func: (tr: Project.Track) => Project.Track) =>
	{
        let numSelected = 0
        for (const elemId of data.state.selection)
        {
            const track = Project.getElem(data.state.drag.origin.project, elemId, "track")
            if (track)
                numSelected++
        }

        if (numSelected <= 1)
            modifyTrackAtMouse(func)
        else
            modifySelectedTracks(func)
    }


    switch (data.state.hoverControl)
    {
        case Editor.TrackControl.Volume:
        {
            const volumeDelta = -data.state.drag.posDelta.y / 50
            modifySelectedTracks((track) =>
            {
                if (track.trackType != "notes")
                    return track
                
                const volume = Math.max(0, Math.min(1, track.volume + volumeDelta))
                return Project.elemModify(track, { volume })
            })
            break
        }

        case Editor.TrackControl.Mute:
        {
            const mute = (origTrack.trackType == "notes" ? !origTrack.mute : false)

            modifyTrackAtMouseOrSelected((track) =>
            {
                return Project.elemModify(track, { mute })
            })
            break
        }

        case Editor.TrackControl.Solo:
        {
            const solo = (origTrack.trackType == "notes" ? !origTrack.solo : false)

            modifyTrackAtMouseOrSelected((track) =>
            {
                return Project.elemModify(track, { solo })
            })
            break
        }
    }
}


function handleDragClone(data: Editor.EditorUpdateData)
{
    const origProject = data.project

    let newProject = data.project
    const newIds = []

    for (const elemId of data.state.selection)
    {
        const elem = origProject.elems.get(elemId)
        if (!elem || elem.type == "track")
            continue

        const newId = newProject.nextId
        newIds.push(newId)

        newProject = Project.cloneElem(origProject, elem, newProject)

        if (elemId == data.state.drag.elemId)
            data.state.drag.elemId = newId
    }

    console.log(origProject, newProject)

    Editor.selectionClear(data)
    for (const id of newIds)
        Editor.selectionAdd(data, id)

    data.state.mouse.action = Editor.EditorAction.DragTimeAndRow

    data.project = newProject
    data.state.drag.origin.project = newProject
}