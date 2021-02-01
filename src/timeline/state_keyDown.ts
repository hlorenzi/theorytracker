import Range from "../util/range"
import Rational from "../util/rational"
import * as Editor from "./index"
import * as Project from "../project"
import * as Theory from "../theory"
	
	
export function keyDown(data: Editor.WorkData, key: string)
{
    data.state.keysDown.add(key)

    //console.log("keyDown", key, data.activeWindow)

    if (!data.activeWindow)
        return

    switch (key)
    {
        case "escape":
        {
            handleEscape(data)
            data.projectCtx.ref.current.splitUndoPoint()
            break
        }

        case "enter":
        {
            handleEnter(data)
            data.projectCtx.ref.current.splitUndoPoint()
            break
        }

        case "delete":
        {
            handleDelete(data)
            data.projectCtx.ref.current.project = data.project
            data.projectCtx.ref.current.splitUndoPoint()
            data.projectCtx.ref.current.addUndoPoint("keyDown_delete")
            break
        }

		case "backspace":
        {
            handleBackspace(data)
            data.projectCtx.ref.current.project = data.project
            data.projectCtx.ref.current.addUndoPoint("keyDown_backspace")
            break
        }

        case "arrowright":
        case "arrowleft":
        {
            handleLeftRight(data, key === "arrowleft")
            data.projectCtx.ref.current.project = data.project
            data.projectCtx.ref.current.addUndoPoint("keyDown_move")
            break
        }

        case "arrowup":
        case "arrowdown":
        {
            handleUpDown(data, key === "arrowup", false)
            data.projectCtx.ref.current.project = data.project
            data.projectCtx.ref.current.addUndoPoint("keyDown_move")
            break
        }

        case ".":
        case ">":
        case ",":
        case "<":
        {
            handleUpDown(data, key === "." || key === ">", true)
            data.projectCtx.ref.current.project = data.project
            data.projectCtx.ref.current.addUndoPoint("keyDown_move")
            break
        }

        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        {
            const degree = key.charCodeAt(0) - "1".charCodeAt(0)
            handleNumber(data, degree)

            data.projectCtx.ref.current.project = data.project
            data.projectCtx.ref.current.splitUndoPoint()
            data.projectCtx.ref.current.addUndoPoint("keyDown_insert")
            break
        }

        case "c":
        {
            if (data.state.keysDown.has("control"))
                Editor.selectionCopy(data)

            break
        }

        case "x":
        {
            if (data.state.keysDown.has("control"))
            {
                Editor.selectionCopy(data)
                Editor.selectionDelete(data)
                data.projectCtx.ref.current.splitUndoPoint()
                data.projectCtx.ref.current.addUndoPoint("cut")
            }

            break
        }

        case "v":
        {
            if (data.state.keysDown.has("control"))
            {
                Editor.paste(data)
                data.projectCtx.ref.current.splitUndoPoint()
                data.projectCtx.ref.current.addUndoPoint("copy")
            }
                
            break
        }
    }
}


function modifySelectedElems(
    data: Editor.WorkData,
    func: (elem: Project.Element) => Project.Element)
{
    let newProject = data.project

    for (const id of data.state.selection)
    {
        const elem = data.project.elems.get(id)
        if (!elem)
            continue

        const newElem = func(elem)
        if (newElem === elem)
            continue
            
        newProject = Project.upsertElement(newProject, newElem)
    }

    data.project = Project.withRefreshedRange(newProject)
}


function handleEscape(data: Editor.WorkData)
{
    if (data.playback.playing)
    {
        data.playback.setStartTime(data.project.range.start)
        data.playback.startPlaying()
    }
    else
    {
        Editor.rewind(data)
    }
}


function handleEnter(data: Editor.WorkData)
{
    if (data.state.cursor.visible && data.state.selection.size != 0)
    {
        data.state.cursor.visible = false
        return
    }

    data.state.cursor.visible = true

    const range = Editor.selectionRange(data)
    if (range)
    {
        let trackId = data.state.tracks[0].projectTrackId
        for (const id of data.state.selection)
        {
            trackId = Project.parentTrackFor(data.project, id).id
        }

        const trackIndex = data.state.tracks.findIndex(tr => tr.projectTrackId === trackId)

        Editor.cursorSetTime(data, range.end, range.end)
        Editor.cursorSetTrack(data, trackIndex, trackIndex)
        Editor.scrollTimeIntoView(data, range.end)
    }

    Editor.keyHandlePendingFinish(data)
    Editor.selectionClear(data)
}


function handleDelete(data: Editor.WorkData)
{
    Editor.selectionDelete(data)
}


function handleBackspace(data: Editor.WorkData)
{
    if (!data.state.cursor.visible)
    {
        Editor.selectionDelete(data)
        return
    }

    const track1 = Math.min(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    const track2 = Math.max(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    
    if (data.state.cursor.time1.compare(data.state.cursor.time2) == 0)
    {
        const time = data.state.cursor.time1.min(data.state.cursor.time2)
        const prevAnchor = Editor.findPreviousAnchor(data, time, track1, track2)
        const range = new Range(prevAnchor, time, false, false)
        Editor.deleteRange(data, range, track1, track2)

        data.state.cursor.visible = true
        Editor.cursorSetTime(data, prevAnchor, prevAnchor)
        Editor.scrollTimeIntoView(data, prevAnchor)
    }
    else
    {
        const time1 = data.state.cursor.time1.min(data.state.cursor.time2)
        const time2 = data.state.cursor.time1.max(data.state.cursor.time2)
        const range = new Range(time1, time2, false, false)
        Editor.deleteRange(data, range, track1, track2)

        data.state.cursor.visible = true
        Editor.cursorSetTime(data, time1, time1)
        Editor.scrollTimeIntoView(data, time1)
    }
    
    data.project = Project.withRefreshedRange(data.project)
}


function handleLeftRight(data: Editor.WorkData, isLeft: boolean)
{
    const keyFast = data.state.keysDown.has(data.prefs.editor.keyDisplaceFast)
    const keyCursor2 = data.state.keysDown.has(data.prefs.editor.keyDisplaceCursor2)
    const keyStretch = data.state.keysDown.has(data.prefs.editor.keyDisplaceStretch)


    if (data.playback.playing)
    {
        const timeDelta = data.state.timeSnap.multiplyByFloat(
            (keyFast ? 64 : 16) * (isLeft ? -1 : 1))

        data.playback.setStartTime(data.playback.playTime.add(timeDelta))
        data.playback.startPlaying()
    }
    else if (data.state.cursor.visible && (data.state.selection.size == 0 || keyCursor2))
    {
        const timeDelta = data.state.timeSnap.multiplyByFloat(
            (keyFast ? 16 : 1) * (isLeft ? -1 : 1))

        Editor.keyHandlePendingFinish(data)

        if (keyCursor2)
        {
            const newTime = data.state.cursor.time2.add(timeDelta)
            Editor.cursorSetTime(data, null, newTime)
            Editor.selectionClear(data)
            Editor.selectionAddAtCursor(data)
            Editor.scrollTimeIntoView(data, newTime)
            data.playback.setStartTime(newTime)
        }
        else
        {
            const timeMin = data.state.cursor.time1.min(data.state.cursor.time2)
            const timeMax = data.state.cursor.time1.max(data.state.cursor.time2)

            const newTime = (isLeft ? timeMin : timeMax).add(timeDelta)

            Editor.cursorSetTime(data, newTime, newTime)
            Editor.scrollTimeIntoView(data, newTime)
            data.playback.setStartTime(newTime)
        }
    }
    else
    {
        const timeDelta = data.state.timeSnap.multiplyByFloat(
            (keyFast ? 16 : 1) * (isLeft ? -1 : 1))
        
        const selectionRange = Editor.selectionRange(data)
        
        let playedPreview = false
        modifySelectedElems(data, (elem) =>
        {
            if (elem.type == "track")
                return elem

            let newRange = elem.range
                
            if (keyStretch && selectionRange)
            {
                const absRange = Project.getAbsoluteRange(data.project, elem.parentId, elem.range)
                newRange = Project.getRelativeRange(data.project, elem.parentId, absRange.stretch(
                    timeDelta,
                    selectionRange.start,
                    selectionRange.end))
            }
            else
            {
                newRange = elem.range.displace(timeDelta)
            }

            if (!elem.range.duration.isZero() && newRange.duration.isZero())
                return elem

            if (!playedPreview)
            {
                if (elem.type == "note")
                {
                    playedPreview = true
                    data.state.insertion.nearMidiPitch = elem.midiPitch
                    data.state.insertion.duration = newRange.duration
                }
                else if (elem.type == "chord")
                {
                    playedPreview = true
                    data.state.insertion.duration = newRange.duration
                }
            }

            return Project.elemModify(elem, {
                range: newRange
            })
        })

        const range = Editor.selectionRange(data) || new Range(new Rational(0), new Rational(0))
        const newTime = (isLeft && !keyStretch ? range.start : range.end)
        data.state.cursor.visible = false
        Editor.cursorSetTime(data, newTime, newTime)
        Editor.scrollTimeIntoView(data, newTime)

        data.state.needsKeyFinish = true
    }
}


function handleUpDown(data: Editor.WorkData, isUp: boolean, isChromatic: boolean)
{
    const keyFast = data.state.keysDown.has(data.prefs.editor.keyDisplaceFast)
    const keyCursor2 = data.state.keysDown.has(data.prefs.editor.keyDisplaceCursor2)
    const keyChromatic = data.state.keysDown.has(data.prefs.editor.keyDisplaceChromatically)

    
    if (!isChromatic && data.state.cursor.visible && (data.state.selection.size == 0 || keyCursor2))
    {
        const trackDelta = (isUp ? -1 : 1)

        Editor.keyHandlePendingFinish(data)
        
        if (keyCursor2)
        {
            const newTrack = data.state.cursor.trackIndex2 + trackDelta
            Editor.cursorSetTrack(data, null, newTrack)
            Editor.selectionClear(data)
            Editor.selectionAddAtCursor(data)
        }
        else
        {
            const trackMin = Math.min(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
            const trackMax = Math.max(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)

            const newTrack = (isUp ? trackMin : trackMax) + trackDelta
            Editor.cursorSetTrack(data, newTrack, newTrack)
        }
    }
    else
    {
        const pitchDelta = (keyFast ? 12 : (keyChromatic || isChromatic ? 1 : 0)) * (isUp ? 1 : -1)
        const degreeDelta = (keyFast || isChromatic ? 0 : 1) * (isUp ? 1 : -1)

        let playedPreview = false
        modifySelectedElems(data, (elem) =>
        {
            if (elem.type == "note")
            {
                const track = Project.parentTrackFor(data.project, elem.parentId)
                const key = Project.keyAt(data.project, track.id, elem.range.start)
                const degree = key.octavedDegreeForMidi(elem.midiPitch)
                const newDegree = degree + degreeDelta
                const newPitch = pitchDelta != 0 ?
                    elem.midiPitch + pitchDelta :
                    key.midiForDegree(degreeDelta >= 0 ? Math.floor(newDegree) : Math.ceil(newDegree))

                if (!playedPreview)
                {
                    playedPreview = true
                    data.playback.playNotePreview(track.id, newPitch, elem.volumeDb, elem.velocity)
                    data.state.insertion.nearMidiPitch = newPitch
                    data.state.insertion.duration = elem.range.duration
                }

                return Project.elemModify(elem, { midiPitch: newPitch })
            }
            else if (elem.type == "chord")
            {
                const track = Project.parentTrackFor(data.project, elem.parentId)
                const key = Project.keyAt(data.project, track.id, elem.range.start)
                const degree = key.octavedDegreeForMidi(elem.chord.rootChroma)
                const newDegree = degree + degreeDelta
                const newRoot = pitchDelta != 0 ?
                    elem.chord.rootChroma + pitchDelta :
                    key.midiForDegree(degreeDelta >= 0 ? Math.floor(newDegree) : Math.ceil(newDegree))

                const newChord = new Theory.Chord(
                    newRoot,
                    elem.chord.kind, elem.chord.inversion, elem.chord.modifiers)

                if (!playedPreview)
                {
                    playedPreview = true
                    data.playback.playChordPreview(track.id, newChord, 0, 1)
                    data.state.insertion.duration = elem.range.duration
                }

                return Project.elemModify(elem, { chord: newChord })
            }
            else
            {
                return elem
            }
        })

        data.state.cursor.visible = false
        data.state.needsKeyFinish = true
    }
}


function handleNumber(data: Editor.WorkData, degree: number)
{
    const time = data.state.cursor.time1.min(data.state.cursor.time2)
    const track = data.state.tracks[data.state.cursor.trackIndex1]
    const trackId = track.projectTrackId
    const key = Project.keyAt(data.project, trackId, time)
    
    if (track instanceof Editor.TimelineTrackChords)
    {
        const root = key.midiForDegree(degree)
        
        let pitches = [0]
        pitches.push(key.midiForDegree(degree + 2) - root)
        pitches.push(key.midiForDegree(degree + 4) - root)
        
        const kind = Theory.Chord.kindFromPitches(pitches)
        const chord = new Theory.Chord(root, kind, 0, [])
        Editor.insertChord(data, time, chord)
    }
    else
    {
        const chroma = key.chromaForDegree(degree)
        Editor.insertNote(data, time, chroma)
    }
}