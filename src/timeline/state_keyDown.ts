import * as Timeline from "./index"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Theory from "../theory"
import * as Playback from "../playback"
import Range from "../util/range"
import Rational from "../util/rational"

	
export function keyDown(data: Timeline.WorkData, key: string)
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
            Project.splitUndoPoint()
            break
        }

        case "enter":
        {
            handleEnter(data)
            Project.splitUndoPoint()
            break
        }

        case "delete":
        {
            handleDelete(data)
            Project.global.project = Project.global.project
            Project.splitUndoPoint()
            Project.addUndoPoint("keyDown_delete")
            break
        }

		case "backspace":
        {
            handleBackspace(data)
            Project.global.project = Project.global.project
            Project.addUndoPoint("keyDown_backspace")
            break
        }

        case "c":
        {
            if (data.state.keysDown.has("control"))
                Timeline.selectionCopy(data)

            break
        }

        case "x":
        {
            if (data.state.keysDown.has("control"))
            {
                Timeline.selectionCopy(data)
                Timeline.deleteElems(data, data.state.selection)
                Project.splitUndoPoint()
                Project.addUndoPoint("cut")
            }

            break
        }

        case "v":
        {
            if (data.state.keysDown.has("control"))
            {
                Timeline.paste(data)
                Project.splitUndoPoint()
                Project.addUndoPoint("copy")
            }
                
            break
        }

        case "arrowright":
        case "arrowleft":
        {
            handleLeftRight(data, key === "arrowleft")
            Project.global.project = Project.global.project
            Project.addUndoPoint("keyDown_move")
            break
        }

        case "arrowup":
        case "arrowdown":
        {
            handleUpDown(data, key === "arrowup", false)
            Project.global.project = Project.global.project
            Project.addUndoPoint("keyDown_move")
            break
        }

        case ".":
        case ">":
        case ",":
        case "<":
        {
            handleUpDown(data, key === "." || key === ">", true)
            Project.global.project = Project.global.project
            Project.addUndoPoint("keyDown_move")
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

            Project.global.project = Project.global.project
            Project.splitUndoPoint()
            Project.addUndoPoint("keyDown_insert")
            break
        }

        case "h":
        {
            handleLengthChange(data, 0)
            break
        }

        case "j":
        {
            handleLengthChange(data, 1)
            break
        }

        case "k":
        {
            handleLengthChange(data, 2)
            break
        }

        case "l":
        {
            handleLengthChange(data, 3)
            break
        }

        case ";":
        case ":":
        {
            handleLengthChange(data, 4)
            break
        }
    }
}


function modifySelectedElems(
    data: Timeline.WorkData,
    func: (elem: Project.Element) => Project.Element)
{
    let newProject = Project.global.project

    for (const id of data.state.selection)
    {
        const elem = Project.global.project.elems.get(id)
        if (!elem)
            continue

        const newElem = func(elem)
        if (newElem === elem)
            continue
            
        newProject = Project.upsertElement(newProject, newElem)
    }

    Project.global.project = Project.withRefreshedRange(newProject)
}


function handleEscape(data: Timeline.WorkData)
{
    if (Playback.global.playing)
    {
        Playback.setStartTime(Project.global.project.range.start)
        Playback.setPlaying(true)
    }
    else
    {
        Timeline.rewind(data)
    }
}


function handleEnter(data: Timeline.WorkData)
{
    if (data.state.cursor.visible && data.state.selection.size != 0)
    {
        data.state.cursor.visible = false
        return
    }

    data.state.cursor.visible = true

    const range = Timeline.selectionRange(data)
    if (range)
    {
        let trackId = data.state.tracks[0].projectTrackId
        for (const id of data.state.selection)
        {
            trackId = Project.parentTrackFor(Project.global.project, id).id
        }

        const trackIndex = data.state.tracks.findIndex(tr => tr.projectTrackId === trackId)

        Timeline.cursorSetTime(data, range.end, range.end)
        Timeline.cursorSetTrack(data, trackIndex, trackIndex)
        Timeline.scrollTimeIntoView(data, range.end)
    }

    Timeline.keyHandlePendingFinish(data)
    Timeline.selectionClear(data)
}


function handleDelete(data: Timeline.WorkData)
{
    Timeline.deleteElems(data, data.state.selection)
}


function handleBackspace(data: Timeline.WorkData)
{
    if (!data.state.cursor.visible)
    {
        Timeline.deleteElems(data, data.state.selection)
        return
    }

    const track1 = Math.min(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    const track2 = Math.max(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    
    if (data.state.cursor.time1.compare(data.state.cursor.time2) == 0)
    {
        const time = data.state.cursor.time1.min(data.state.cursor.time2)
        const prevAnchor = Timeline.findPreviousAnchor(data, time, track1, track2)
        const range = new Range(prevAnchor, time, false, false)
        Timeline.deleteRange(data, range, track1, track2)

        data.state.cursor.visible = true
        Timeline.cursorSetTime(data, prevAnchor, prevAnchor)
        Timeline.scrollTimeIntoView(data, prevAnchor)
    }
    else
    {
        const time1 = data.state.cursor.time1.min(data.state.cursor.time2)
        const time2 = data.state.cursor.time1.max(data.state.cursor.time2)
        const range = new Range(time1, time2, false, false)
        Timeline.deleteRange(data, range, track1, track2)

        data.state.cursor.visible = true
        Timeline.cursorSetTime(data, time1, time1)
        Timeline.scrollTimeIntoView(data, time1)
    }
    
    Project.global.project = Project.withRefreshedRange(Project.global.project)
}


function handleLeftRight(data: Timeline.WorkData, isLeft: boolean)
{
    const keyFast = data.state.keysDown.has(Prefs.global.editor.keyDisplaceFast)
    const keyCursor2 = data.state.keysDown.has(Prefs.global.editor.keyDisplaceCursor2)
    const keyStretch = data.state.keysDown.has(Prefs.global.editor.keyDisplaceStretch)


    if (Playback.global.playing)
    {
        const timeDelta = data.state.timeSnap.multiplyByFloat(
            (keyFast ? 64 : 16) * (isLeft ? -1 : 1))

        Playback.setStartTime(Playback.global.playTime.add(timeDelta))
        Playback.setPlaying(true)
    }
    else if (data.state.cursor.visible && (data.state.selection.size == 0 || keyCursor2))
    {
        const timeDelta = data.state.timeSnap.multiplyByFloat(
            (keyFast ? 16 : 1) * (isLeft ? -1 : 1))

        Timeline.keyHandlePendingFinish(data)

        if (keyCursor2)
        {
            const newTime = data.state.cursor.time2.add(timeDelta)
            Timeline.cursorSetTime(data, null, newTime)
            Timeline.selectionClear(data)
            Timeline.selectionAddAtCursor(data)
            Timeline.scrollTimeIntoView(data, newTime)
            Playback.setStartTime(newTime)
        }
        else
        {
            const timeMin = data.state.cursor.time1.min(data.state.cursor.time2)
            const timeMax = data.state.cursor.time1.max(data.state.cursor.time2)

            const newTime = (isLeft ? timeMin : timeMax).add(timeDelta)

            Timeline.cursorSetTime(data, newTime, newTime)
            Timeline.scrollTimeIntoView(data, newTime)
            Playback.setStartTime(newTime)
        }
    }
    else
    {
        const timeDelta = data.state.timeSnap.multiplyByFloat(
            (keyFast ? 16 : 1) * (isLeft ? -1 : 1))
        
        const selectionRange = Timeline.selectionRange(data)
        
        let playedPreview = false
        modifySelectedElems(data, (elem) =>
        {
            if (elem.type == "track")
                return elem

            let newRange = elem.range
                
            if (keyStretch && selectionRange)
            {
                const absRange = Project.getAbsoluteRange(Project.global.project, elem.parentId, elem.range)
                newRange = Project.getRelativeRange(Project.global.project, elem.parentId, absRange.stretch(
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

        const range = Timeline.selectionRange(data) || new Range(new Rational(0), new Rational(0))
        const newTime = (isLeft && !keyStretch ? range.start : range.end)
        data.state.cursor.visible = false
        Timeline.cursorSetTime(data, newTime, newTime)
        Timeline.scrollTimeIntoView(data, newTime)

        data.state.needsKeyFinish = true
    }
}


function handleUpDown(data: Timeline.WorkData, isUp: boolean, isChromatic: boolean)
{
    const keyFast = data.state.keysDown.has(Prefs.global.editor.keyDisplaceFast)
    const keyCursor2 = data.state.keysDown.has(Prefs.global.editor.keyDisplaceCursor2)
    const keyChromatic = data.state.keysDown.has(Prefs.global.editor.keyDisplaceChromatically)

    
    if (!isChromatic && data.state.cursor.visible && (data.state.selection.size == 0 || keyCursor2))
    {
        const trackDelta = (isUp ? -1 : 1)

        Timeline.keyHandlePendingFinish(data)
        
        if (keyCursor2)
        {
            const newTrack = data.state.cursor.trackIndex2 + trackDelta
            Timeline.cursorSetTrack(data, null, newTrack)
            Timeline.selectionClear(data)
            Timeline.selectionAddAtCursor(data)
        }
        else
        {
            const trackMin = Math.min(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
            const trackMax = Math.max(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)

            const newTrack = (isUp ? trackMin : trackMax) + trackDelta
            Timeline.cursorSetTrack(data, newTrack, newTrack)
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
                const track = Project.parentTrackFor(Project.global.project, elem.parentId)
                const key = Project.keyAt(Project.global.project, track.id, elem.range.start)
                const degree = key.octavedDegreeForMidi(elem.midiPitch)
                const newDegree = degree + degreeDelta
                const newPitch = pitchDelta != 0 ?
                    elem.midiPitch + pitchDelta :
                    key.midiForDegree(degreeDelta >= 0 ? Math.floor(newDegree) : Math.ceil(newDegree))

                if (!playedPreview)
                {
                    playedPreview = true
                    Playback.playNotePreview(track.id, newPitch, elem.volumeDb, elem.velocity)
                    data.state.insertion.nearMidiPitch = newPitch
                    data.state.insertion.duration = elem.range.duration
                }

                return Project.elemModify(elem, { midiPitch: newPitch })
            }
            else if (elem.type == "chord")
            {
                const track = Project.parentTrackFor(Project.global.project, elem.parentId)
                const key = Project.keyAt(Project.global.project, track.id, elem.range.start)
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
                    Playback.playChordPreview(track.id, newChord, 0, 1)
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


function handleNumber(data: Timeline.WorkData, degree: number)
{
    const time = data.state.cursor.time1.min(data.state.cursor.time2)
    const track = data.state.tracks[data.state.cursor.trackIndex1]
    const trackId = track.projectTrackId
    const key = Project.keyAt(Project.global.project, trackId, time)
    
    if (track instanceof Timeline.TimelineTrackChords)
    {
        const root = key.midiForDegree(degree)
        
        let pitches = [0]
        pitches.push(key.midiForDegree(degree + 2) - root)
        pitches.push(key.midiForDegree(degree + 4) - root)
        
        const kind = Theory.Chord.kindFromPitches(pitches)
        const chord = new Theory.Chord(root, kind, 0, [])
        Timeline.insertChord(data, time, chord)
    }
    else if (track instanceof Timeline.TimelineTrackNoteBlocks)
    {
        const noteBlockId = Timeline.insertNoteBlock(data, time)
        if (!noteBlockId)
            return

        Timeline.modeStackPush(data)
        data.state.mode = Timeline.Mode.NoteBlock
        data.state.modeNoteBlockId = noteBlockId
        Timeline.refreshTracks(data)

        Timeline.cursorSetTrackByParentId(data, noteBlockId)

        const chroma = key.chromaForDegree(degree)
        Timeline.insertNote(data, time, chroma)
    }
    else
    {
        const chroma = key.chromaForDegree(degree)
        Timeline.insertNote(data, time, chroma)
    }
}


function handleLengthChange(data: Timeline.WorkData, lengthIndex: number)
{
    const lengths = [
        new Rational(1, 16),
        new Rational(1, 8),
        new Rational(1, 4),
        new Rational(1, 2),
        new Rational(1, 1),
    ]

    const length = lengths[lengthIndex]

    modifySelectedElems(data, (elem) =>
    {
        if (elem.type == "note" || elem.type == "chord")
        {
            data.state.insertion.duration = length

            const newRange = Range.fromStartDuration(elem.range.start, length)
            return Project.elemModify(elem, { range: newRange })
        }
        else
            return elem
    })

    const range = Timeline.selectionRange(data) || new Range(new Rational(0), new Rational(0))
    const newTime = range.end
    data.state.cursor.visible = false
    Timeline.cursorSetTime(data, newTime, newTime)
    Timeline.scrollTimeIntoView(data, newTime)

    data.state.needsKeyFinish = true
}