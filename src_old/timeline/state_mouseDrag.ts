import * as Timeline from "./index"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Playback from "../playback"
import Range from "../util/range"


export function mouseDrag(
    state: Timeline.State,
    pos: { x: number, y: number },
    isClick: boolean): boolean
{
    if (!state.mouse.down)
        return false

    state.mouse.pointPrev = state.mouse.point
    state.mouse.point = Timeline.pointAt(state, pos)
    
    state.drag.posDelta =
    {
        x: state.mouse.point.pos.x - state.drag.origin.point.pos.x,
        y: state.mouse.point.pos.y - state.drag.origin.point.pos.y,
    }

    state.drag.timeDelta =
        state.mouse.point.time.subtract(state.drag.origin.point.time)

    state.drag.rowDelta =
        state.mouse.point.row - state.drag.origin.point.row

    state.drag.trackDelta =
        state.mouse.point.trackIndex - state.drag.origin.point.trackIndex

    state.drag.xLocked =
        state.drag.xLocked &&
        Math.abs(state.drag.posDelta.x) < Prefs.global.editor.mouseDragXLockedDistance

    state.drag.yLocked =
        state.drag.yLocked &&
        Math.abs(state.drag.posDelta.y) < Prefs.global.editor.mouseDragYLockedDistance
    
    if (!state.drag.yLocked)
    {
        state.drag.trackInsertionBefore =
            Timeline.trackInsertionAtY(state, state.mouse.point.pos.y)
    }

    function withTrackAtDragOrigin<T>(fn: (track: Timeline.TimelineTrack) => T)
    {
        return fn(state.tracks[state.drag.origin.point.trackIndex])
    }

    if (isClick && state.mouse.action != Timeline.MouseAction.DragTrackControl)
    {
        return false
    }

    if (state.mouse.action == Timeline.MouseAction.Pan)
    {
        state.timeScroll =
            state.drag.origin.timeScroll -
            (state.drag.posDelta.x / state.timeScale)

        if (!state.trackScrollLocked)
            state.trackScroll =
                state.drag.origin.trackScroll -
                state.drag.posDelta.y

        withTrackAtDragOrigin(tr =>
        {
            if (tr.scrollEnabled)
                tr.yScroll =
                    state.drag.origin.trackYScroll -
                    state.drag.posDelta.y
        })

        return true
    }
    else if (state.mouse.action == Timeline.MouseAction.SelectCursor)
    {
        state.cursor.time2 = state.mouse.point.time
        state.cursor.trackIndex2 = state.mouse.point.trackIndex

        Timeline.selectionClear(state)
        Timeline.selectionAddAtCursor(state)
        return true
    }
    else if (state.mouse.action == Timeline.MouseAction.SelectRect)
    {
        state.cursor.time2 = state.mouse.point.time
        state.cursor.rectY2 = state.mouse.point.trackPos.y

        const y1 = Math.min(state.cursor.rectY1, state.cursor.rectY2)
        const y2 = Math.max(state.cursor.rectY1, state.cursor.rectY2)

        Timeline.selectionClear(state)
        Timeline.selectionAddAtCursor(state, { y1, y2 })
        return true
    }
    else if (state.mouse.action == Timeline.MouseAction.DragTrackHeader)
    {
        return true
    }
    else if (state.mouse.action == Timeline.MouseAction.Pencil)
    {
        withTrackAtDragOrigin(tr => tr.pencilDrag(state))
        return true
    }
    else if (state.mouse.action == Timeline.MouseAction.DragTrackControl)
    {
        handleDragTrackControl(state)
        return true
    }
    else if (state.mouse.action == Timeline.MouseAction.DragClone)
    {
        if (!state.drag.xLocked || !state.drag.yLocked)
        {
            handleDragClone(state)
            return true
        }

        return false
    }
    else
    {
        let mouseAction = state.mouse.action
        
		if (state.drag.xLocked)
        {
            if (mouseAction == Timeline.MouseAction.DragTime ||
                mouseAction == Timeline.MouseAction.StretchTimeStart ||
                mouseAction == Timeline.MouseAction.StretchTimeEnd)
                mouseAction = Timeline.MouseAction.None
            else if (mouseAction == Timeline.MouseAction.DragTimeAndRow)
                mouseAction = Timeline.MouseAction.DragRow
        }

		if (state.drag.yLocked)
        {
            if (mouseAction == Timeline.MouseAction.DragTimeAndRow)
                mouseAction = Timeline.MouseAction.DragTime
            else if (mouseAction == Timeline.MouseAction.DragRow)
                mouseAction = Timeline.MouseAction.None
        }

        const origProject = state.drag.origin.project
        let newProject = state.drag.origin.project

		for (const id of state.selection)
		{
			const elem = origProject.elems.get(id)
			if (!elem)
                continue

            if (elem.type == "track")
                continue
                
			let changes: any = {}

            if (mouseAction == Timeline.MouseAction.DragTime ||
                mouseAction == Timeline.MouseAction.DragTimeAndRow)
                changes.range = elem.range
                    .displace(state.drag.timeDelta)
                    .quantize(Project.MAX_RATIONAL_DENOMINATOR)
            
            if (mouseAction == Timeline.MouseAction.StretchTimeStart &&
                state.drag.origin.range)
            {
                changes.range = Project.getAbsoluteRange(origProject, elem.parentId, elem.range)
                changes.range = changes.range.stretch(
                    state.drag.timeDelta,
                    state.drag.origin.range.end,
                    state.drag.origin.range.start)

                if (elem.range.start.compare(state.drag.origin.range.start) == 0)
                    changes.range = new Range(
                        changes.range.start.snap(state.timeSnap),
                        changes.range.end)
                            .quantize(Project.MAX_RATIONAL_DENOMINATOR)
                    
                changes.range = changes.range.sorted()
                changes.range = Project.getRelativeRange(origProject, elem.parentId, changes.range)
            }

            if (mouseAction == Timeline.MouseAction.StretchTimeEnd &&
                state.drag.origin.range)
            {
                changes.range = Project.getAbsoluteRange(origProject, elem.parentId, elem.range)
                changes.range = changes.range.stretch(
                    state.drag.timeDelta,
                    state.drag.origin.range.start,
                    state.drag.origin.range.end)

                if (elem.range.end.compare(state.drag.origin.range.end) == 0)
                    changes.range = new Range(
                        changes.range.start,
                        changes.range.end.snap(state.timeSnap))
                            .quantize(Project.MAX_RATIONAL_DENOMINATOR)

                changes.range = changes.range.sorted()
                changes.range = Project.getRelativeRange(origProject, elem.parentId, changes.range)
            }
        
            if ((mouseAction == Timeline.MouseAction.DragRow ||
                mouseAction == Timeline.MouseAction.DragTimeAndRow) &&
                elem.type == "note")
            {
                const note = elem as Project.Note
                const trackId = state.tracks[state.drag.origin.point.trackIndex].projectTrackId
                const key = Project.keyAt(Project.global.project, trackId, note.range.start)
                const degree = key.octavedDegreeForMidi(note.midiPitch)
                const newPitch = key.midiForDegree(Math.floor(degree + state.drag.rowDelta))
                changes.midiPitch = newPitch

                if (elem.id == state.drag.elemId)
                {
                    if ((state.drag.notePreviewLast && newPitch != state.drag.notePreviewLast) ||
                        (!state.drag.notePreviewLast && newPitch != note.midiPitch))
                    {
                        state.drag.notePreviewLast = newPitch
                        Playback.playNotePreview(trackId, newPitch, note.volumeDb, note.velocity)
                    }
                }
            }

            if ((mouseAction == Timeline.MouseAction.DragTime ||
                mouseAction == Timeline.MouseAction.DragTimeAndRow ||
                mouseAction == Timeline.MouseAction.DragRow) &&
                state.drag.trackDelta != 0)
            {
                const origTrackIndex = state.tracks.findIndex(t => t.projectTrackId == elem.parentId)
                const newTrackIndex = Math.max(0, Math.min(state.tracks.length - 1, origTrackIndex + state.drag.trackDelta))
                const newTrack = state.tracks[newTrackIndex]

                if (newTrack.acceptedElemTypes.has(elem.type))
                    changes.parentId = newTrack.projectTrackId
            }
            
            newProject = Project.upsertElement(
                newProject,
                Project.elemModify(elem, changes))
        }

        Project.global.project = newProject
        return true
    }
}


function handleDragTrackControl(state: Timeline.State)
{
    const origTrack = Project.getElem(state.drag.origin.project, state.drag.elemId, "track")
    if (!origTrack)
        return


	const modifySelectedTracks = (func: (tr: Project.Track) => Project.Track) =>
	{
        let project = Project.global.project

        for (const elemId of state.selection)
        {
            const track = Project.getElem(state.drag.origin.project, elemId, "track")
            if (!track)
                continue

			const newTrack = func(track)
			project = Project.upsertTrack(project, newTrack)
		}

        Project.global.project = project
	}


	const modifyTrackAtMouse = (func: (tr: Project.Track) => Project.Track) =>
	{
        let project = Project.global.project

        const trackIndex = state.mouse.point.trackIndex
        if (trackIndex < 0 || trackIndex >= state.tracks.length)
            return
        
        const track = state.tracks[trackIndex]
        const projTrack = Project.getElem(state.drag.origin.project, track.projectTrackId, "track")
        if (!projTrack)
            return

        const newTrack = func(projTrack)
        project = Project.upsertTrack(project, newTrack)

        Project.global.project = project
	}


	const modifyTrackAtMouseOrSelected = (func: (tr: Project.Track) => Project.Track) =>
	{
        let numSelected = 0
        for (const elemId of state.selection)
        {
            const track = Project.getElem(state.drag.origin.project, elemId, "track")
            if (track)
                numSelected++
        }

        if (numSelected <= 1)
            modifyTrackAtMouse(func)
        else
            modifySelectedTracks(func)
    }


    switch (state.hoverControl)
    {
        case Timeline.TrackControl.Volume:
        {
            const volumeDbDelta = -state.drag.posDelta.y / 10
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


function handleDragClone(state: Timeline.State)
{
    const origProject = Project.global.project

    let newProject = Project.global.project
    const newIds = []

    for (const elemId of state.selection)
    {
        const elem = origProject.elems.get(elemId)
        if (!elem || elem.type == "track")
            continue

        const newId = newProject.nextId
        newIds.push(newId)

        newProject = Project.cloneElem(origProject, elem, newProject)

        if (elemId == state.drag.elemId)
            state.drag.elemId = newId
    }

    Timeline.selectionClear(state)
    for (const id of newIds)
        Timeline.selectionAdd(state, id)

    state.mouse.action = Timeline.MouseAction.DragTimeAndRow

    Project.global.project = newProject
    state.drag.origin.project = newProject
}