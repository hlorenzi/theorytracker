import * as Timeline from "./index"
import * as Project from "../project"
import Range from "../util/range"


export function mouseDrag(
    data: Timeline.WorkData,
    pos: { x: number, y: number },
    isClick: boolean): boolean
{
    if (!data.state.mouse.down)
        return false

    data.state.mouse.pointPrev = data.state.mouse.point
    data.state.mouse.point = Timeline.pointAt(data, pos)
    
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
            Timeline.trackInsertionAtY(data, data.state.mouse.point.pos.y)
    }

    function withTrackAtDragOrigin<T>(fn: (track: Timeline.TimelineTrack) => T)
    {
        return fn(data.state.tracks[data.state.drag.origin.point.trackIndex])
    }

    if (isClick && data.state.mouse.action != Timeline.MouseAction.DragTrackControl)
    {
        return false
    }

    if (data.state.mouse.action == Timeline.MouseAction.Pan)
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
    else if (data.state.mouse.action == Timeline.MouseAction.SelectCursor)
    {
        data.state.cursor.time2 = data.state.mouse.point.time
        data.state.cursor.trackIndex2 = data.state.mouse.point.trackIndex

        Timeline.selectionClear(data)
        Timeline.selectionAddAtCursor(data)
        return true
    }
    else if (data.state.mouse.action == Timeline.MouseAction.DragTrackHeader)
    {
        return true
    }
    else if (data.state.mouse.action == Timeline.MouseAction.Pencil)
    {
        withTrackAtDragOrigin(tr => tr.pencilDrag(data))
        return true
    }
    else if (data.state.mouse.action == Timeline.MouseAction.DragTrackControl)
    {
        handleDragTrackControl(data)
        return true
    }
    else if (data.state.mouse.action == Timeline.MouseAction.DragClone)
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
            if (mouseAction == Timeline.MouseAction.DragTime ||
                mouseAction == Timeline.MouseAction.StretchTimeStart ||
                mouseAction == Timeline.MouseAction.StretchTimeEnd)
                mouseAction = Timeline.MouseAction.None
            else if (mouseAction == Timeline.MouseAction.DragTimeAndRow)
                mouseAction = Timeline.MouseAction.DragRow
        }

		if (data.state.drag.yLocked)
        {
            if (mouseAction == Timeline.MouseAction.DragTimeAndRow)
                mouseAction = Timeline.MouseAction.DragTime
            else if (mouseAction == Timeline.MouseAction.DragRow)
                mouseAction = Timeline.MouseAction.None
        }

        const origProject = data.state.drag.origin.project
        let newProject = data.state.drag.origin.project

		for (const id of data.state.selection)
		{
			const elem = origProject.elems.get(id)
			if (!elem)
                continue

            if (elem.type == "track")
                continue
                
			let changes: any = {}

            if (mouseAction == Timeline.MouseAction.DragTime ||
                mouseAction == Timeline.MouseAction.DragTimeAndRow)
                changes.range = elem.range.displace(data.state.drag.timeDelta)
            
            if (mouseAction == Timeline.MouseAction.StretchTimeStart &&
                data.state.drag.origin.range)
            {
                changes.range = Project.getAbsoluteRange(origProject, elem.parentId, elem.range)
                changes.range = changes.range.stretch(
                    data.state.drag.timeDelta,
                    data.state.drag.origin.range.end,
                    data.state.drag.origin.range.start)

                if (elem.range.start.compare(data.state.drag.origin.range.start) == 0)
                    changes.range = new Range(
                        changes.range.start.snap(data.state.timeSnap),
                        changes.range.end)
                    
                changes.range = changes.range.sorted()
                changes.range = Project.getRelativeRange(origProject, elem.parentId, changes.range)
            }

            if (mouseAction == Timeline.MouseAction.StretchTimeEnd &&
                data.state.drag.origin.range)
            {
                changes.range = Project.getAbsoluteRange(origProject, elem.parentId, elem.range)
                changes.range = changes.range.stretch(
                    data.state.drag.timeDelta,
                    data.state.drag.origin.range.start,
                    data.state.drag.origin.range.end)

                if (elem.range.end.compare(data.state.drag.origin.range.end) == 0)
                    changes.range = new Range(
                        changes.range.start,
                        changes.range.end.snap(data.state.timeSnap))

                changes.range = changes.range.sorted()
                changes.range = Project.getRelativeRange(origProject, elem.parentId, changes.range)
            }
        
            if ((mouseAction == Timeline.MouseAction.DragRow ||
                mouseAction == Timeline.MouseAction.DragTimeAndRow) &&
                elem.type == "note")
            {
                const note = elem as Project.Note
                const trackId = data.state.tracks[data.state.drag.origin.point.trackIndex].projectTrackId
                const key = Project.keyAt(data.project, trackId, note.range.start)
                const degree = key.octavedDegreeForMidi(note.midiPitch)
                const newPitch = key.midiForDegree(Math.floor(degree + data.state.drag.rowDelta))
                changes.midiPitch = newPitch

                if (elem.id == data.state.drag.elemId)
                {
                    if ((data.state.drag.notePreviewLast && newPitch != data.state.drag.notePreviewLast) ||
                        (!data.state.drag.notePreviewLast && newPitch != note.midiPitch))
                    {
                        data.state.drag.notePreviewLast = newPitch
                        data.playback.playNotePreview(trackId, newPitch, note.volumeDb, note.velocity)
                    }
                }
            }

            if ((mouseAction == Timeline.MouseAction.DragTime ||
                mouseAction == Timeline.MouseAction.DragTimeAndRow ||
                mouseAction == Timeline.MouseAction.DragRow) &&
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


function handleDragTrackControl(data: Timeline.WorkData)
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
        case Timeline.TrackControl.Volume:
        {
            const volumeDbDelta = -data.state.drag.posDelta.y / 10
            modifySelectedTracks((track) =>
            {
                if (track.trackType != "notes" && track.trackType != "chords")
                    return track
                
                const volumeDb = Math.max(Project.MinVolumeDb,
                    Math.min(Project.MaxVolumeDb,
                    track.volumeDb + volumeDbDelta))

                return Project.elemModify(track, { volumeDb })
            })
            break
        }

        case Timeline.TrackControl.Mute:
        {
            const mute = origTrack.trackType == "notes" || origTrack.trackType == "chords" ?
                !origTrack.mute : false

            modifyTrackAtMouseOrSelected((track) =>
            {
                return Project.elemModify(track, { mute })
            })
            break
        }

        case Timeline.TrackControl.Solo:
        {
            const solo = origTrack.trackType == "notes" || origTrack.trackType == "chords" ?
                !origTrack.solo : false

            modifyTrackAtMouseOrSelected((track) =>
            {
                return Project.elemModify(track, { solo })
            })
            break
        }
    }
}


function handleDragClone(data: Timeline.WorkData)
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

    Timeline.selectionClear(data)
    for (const id of newIds)
        Timeline.selectionAdd(data, id)

    data.state.mouse.action = Timeline.MouseAction.DragTimeAndRow

    data.project = newProject
    data.state.drag.origin.project = newProject
}