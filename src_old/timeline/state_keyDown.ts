import * as Timeline from "./index"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Theory from "../theory"
import * as Playback from "../playback"
import Range from "../util/range"
import Rational from "../util/rational"

	
export function keyDown(state: Timeline.State, activeWindow: boolean, key: string)
{
    state.keysDown.add(key)

    //console.log("keyDown", key, data.activeWindow)

    if (!activeWindow)
        return

    switch (key)
    {
        case "escape":
        {
            handleEscape(state)
            Project.splitUndoPoint()
            break
        }

        case "enter":
        {
            handleEnter(state)
            Project.splitUndoPoint()
            break
        }

        case "delete":
        {
            handleDelete(state)
            Project.splitUndoPoint()
            Project.addUndoPoint("keyDown_delete")
            break
        }

		case "backspace":
        {
            handleBackspace(state)
            Project.addUndoPoint("keyDown_backspace")
            break
        }

        case "c":
        {
            if (state.keysDown.has("control"))
                Timeline.selectionCopy(state)

            break
        }

        case "x":
        {
            if (state.keysDown.has("control"))
            {
                Timeline.selectionCopy(state)
                Timeline.deleteElems(state, state.selection)
                Project.splitUndoPoint()
                Project.addUndoPoint("cut")
            }

            break
        }

        case "v":
        {
            if (state.keysDown.has("control"))
            {
                Timeline.paste(state)
                Project.splitUndoPoint()
                Project.addUndoPoint("copy")
            }
                
            break
        }

        case "arrowright":
        case "arrowleft":
        {
            handleLeftRight(state, key === "arrowleft")
            Project.addUndoPoint("keyDown_move")
            break
        }

        case "arrowup":
        case "arrowdown":
        {
            handleUpDown(state, key === "arrowup", false)
            Project.addUndoPoint("keyDown_move")
            break
        }

        case ".":
        case ">":
        case ",":
        case "<":
        {
            handleUpDown(state, key === "." || key === ">", true)
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
            handleNumber(state, degree)

            Project.splitUndoPoint()
            Project.addUndoPoint("keyDown_insert")
            break
        }

        case "h":
        {
            handleLengthChange(state, 0)
            break
        }

        case "j":
        {
            handleLengthChange(state, 1)
            break
        }

        case "k":
        {
            handleLengthChange(state, 2)
            break
        }

        case "l":
        {
            handleLengthChange(state, 3)
            break
        }

        case ";":
        case ":":
        {
            handleLengthChange(state, 4)
            break
        }
    }
}


function modifySelectedElems(
    state: Timeline.State,
    func: (elem: Project.Element) => Project.Element)
{
    let newProject = Project.global.project

    for (const id of state.selection)
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


function handleEscape(state: Timeline.State)
{
    if (Playback.global.playing)
    {
        Playback.setStartTime(Project.global.project.range.start)
        Playback.setPlaying(true)
    }
    else
    {
        Timeline.rewind(state)
    }
}


function handleEnter(state: Timeline.State)
{
    if (state.cursor.visible && state.selection.size != 0)
    {
        state.cursor.visible = false
        return
    }

    state.cursor.visible = true

    const range = Timeline.selectionRange(state)
    if (range)
    {
        let trackId = state.tracks[0].projectTrackId
        for (const id of state.selection)
        {
            trackId = Project.parentTrackFor(Project.global.project, id).id
        }

        const trackIndex = state.tracks.findIndex(tr => tr.projectTrackId === trackId)

        Timeline.cursorSetTime(state, range.end, range.end)
        Timeline.cursorSetTrack(state, trackIndex, trackIndex)
        Timeline.scrollTimeIntoView(state, range.end)
    }

    Timeline.keyHandlePendingFinish(state)
    Timeline.selectionClear(state)
}


function handleDelete(state: Timeline.State)
{
    Timeline.deleteElems(state, state.selection)
}


function handleBackspace(state: Timeline.State)
{
    if (!state.cursor.visible)
    {
        Timeline.deleteElems(state, state.selection)
        return
    }

    const track1 = Math.min(state.cursor.trackIndex1, state.cursor.trackIndex2)
    const track2 = Math.max(state.cursor.trackIndex1, state.cursor.trackIndex2)
    
    if (state.cursor.time1.compare(state.cursor.time2) == 0)
    {
        const time = state.cursor.time1.min(state.cursor.time2)
        const prevAnchor = Timeline.findPreviousAnchor(state, time, track1, track2)
        const range = new Range(prevAnchor, time, false, false)
        Timeline.deleteRange(state, range, track1, track2)

        state.cursor.visible = true
        Timeline.cursorSetTime(state, prevAnchor, prevAnchor)
        Timeline.scrollTimeIntoView(state, prevAnchor)
    }
    else
    {
        const time1 = state.cursor.time1.min(state.cursor.time2)
        const time2 = state.cursor.time1.max(state.cursor.time2)
        const range = new Range(time1, time2, false, false)
        Timeline.deleteRange(state, range, track1, track2)

        state.cursor.visible = true
        Timeline.cursorSetTime(state, time1, time1)
        Timeline.scrollTimeIntoView(state, time1)
    }
    
    Project.global.project = Project.withRefreshedRange(Project.global.project)
}


function handleLeftRight(state: Timeline.State, isLeft: boolean)
{
    const keyFast = state.keysDown.has(Prefs.global.editor.keyDisplaceFast)
    const keyCursor2 = state.keysDown.has(Prefs.global.editor.keyDisplaceCursor2)
    const keyStretch = state.keysDown.has(Prefs.global.editor.keyDisplaceStretch)


    if (Playback.global.playing)
    {
        const timeDelta = state.timeSnap.multiplyByFloat(
            (keyFast ? 64 : 16) * (isLeft ? -1 : 1))

        Playback.setStartTime(Playback.global.playTime.add(timeDelta))
        Playback.setPlaying(true)
    }
    else if (state.cursor.visible && (state.selection.size == 0 || keyCursor2))
    {
        const timeDelta = state.timeSnap.multiplyByFloat(
            (keyFast ? 16 : 1) * (isLeft ? -1 : 1))

        Timeline.keyHandlePendingFinish(state)

        if (keyCursor2)
        {
            const newTime = state.cursor.time2.add(timeDelta)
            Timeline.cursorSetTime(state, null, newTime)
            Timeline.selectionClear(state)
            Timeline.selectionAddAtCursor(state)
            Timeline.scrollTimeIntoView(state, newTime)
            Playback.setStartTime(newTime)
        }
        else
        {
            const timeMin = state.cursor.time1.min(state.cursor.time2)
            const timeMax = state.cursor.time1.max(state.cursor.time2)

            const newTime = (isLeft ? timeMin : timeMax).add(timeDelta)

            Timeline.cursorSetTime(state, newTime, newTime)
            Timeline.scrollTimeIntoView(state, newTime)
            Playback.setStartTime(newTime)
        }
    }
    else
    {
        const timeDelta = state.timeSnap.multiplyByFloat(
            (keyFast ? 16 : 1) * (isLeft ? -1 : 1))
        
        const selectionRange = Timeline.selectionRange(state)
        
        let playedPreview = false
        modifySelectedElems(state, (elem) =>
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
                    state.insertion.nearMidiPitch = elem.midiPitch
                    state.insertion.duration = newRange.duration
                }
                else if (elem.type == "chord")
                {
                    playedPreview = true
                    state.insertion.duration = newRange.duration
                }
            }

            return Project.elemModify(elem, {
                range: newRange
            })
        })

        const range = Timeline.selectionRange(state) || new Range(new Rational(0), new Rational(0))
        const newTime = (isLeft && !keyStretch ? range.start : range.end)
        state.cursor.visible = false
        Timeline.cursorSetTime(state, newTime, newTime)
        Timeline.scrollTimeIntoView(state, newTime)

        state.needsKeyFinish = true
    }
}


function handleUpDown(state: Timeline.State, isUp: boolean, isChromatic: boolean)
{
    const keyFast = state.keysDown.has(Prefs.global.editor.keyDisplaceFast)
    const keyCursor2 = state.keysDown.has(Prefs.global.editor.keyDisplaceCursor2)
    const keyChromatic = state.keysDown.has(Prefs.global.editor.keyDisplaceChromatically)

    
    if (!isChromatic && state.cursor.visible && (state.selection.size == 0 || keyCursor2))
    {
        const trackDelta = (isUp ? -1 : 1)

        Timeline.keyHandlePendingFinish(state)
        
        if (keyCursor2)
        {
            const newTrack = state.cursor.trackIndex2 + trackDelta
            Timeline.cursorSetTrack(state, null, newTrack)
            Timeline.selectionClear(state)
            Timeline.selectionAddAtCursor(state)
        }
        else
        {
            const trackMin = Math.min(state.cursor.trackIndex1, state.cursor.trackIndex2)
            const trackMax = Math.max(state.cursor.trackIndex1, state.cursor.trackIndex2)

            const newTrack = (isUp ? trackMin : trackMax) + trackDelta
            Timeline.cursorSetTrack(state, newTrack, newTrack)
        }
    }
    else
    {
        const pitchDelta = (keyFast ? 12 : (keyChromatic || isChromatic ? 1 : 0)) * (isUp ? 1 : -1)
        const degreeDelta = (keyFast || isChromatic ? 0 : 1) * (isUp ? 1 : -1)

        let playedPreview = false
        modifySelectedElems(state, (elem) =>
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
                    state.insertion.nearMidiPitch = newPitch
                    state.insertion.duration = elem.range.duration
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
                    state.insertion.duration = elem.range.duration
                }

                return Project.elemModify(elem, { chord: newChord })
            }
            else
            {
                return elem
            }
        })

        state.cursor.visible = false
        state.needsKeyFinish = true
    }
}


function handleNumber(state: Timeline.State, degree: number)
{
    const time = state.cursor.time1.min(state.cursor.time2)
    const track = state.tracks[state.cursor.trackIndex1]
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
        Timeline.insertChord(state, time, chord)
    }
    else if (track instanceof Timeline.TimelineTrackNoteBlocks)
    {
        const noteBlockId = Timeline.insertNoteBlock(state, time)
        if (!noteBlockId)
            return

        Timeline.modeStackPush(state)
        state.mode = Timeline.Mode.NoteBlock
        state.modeNoteBlockId = noteBlockId
        Timeline.refreshTracks(state)

        Timeline.cursorSetTrackByParentId(state, noteBlockId)

        const chroma = key.chromaForDegree(degree)
        Timeline.insertNote(state, time, chroma)
    }
    else
    {
        const chroma = key.chromaForDegree(degree)
        Timeline.insertNote(state, time, chroma)
    }
}


function handleLengthChange(state: Timeline.State, lengthIndex: number)
{
    const lengths = [
        new Rational(1, 16),
        new Rational(1, 8),
        new Rational(1, 4),
        new Rational(1, 2),
        new Rational(1, 1),
    ]

    const length = lengths[lengthIndex]

    modifySelectedElems(state, (elem) =>
    {
        if (elem.type == "note" || elem.type == "chord")
        {
            state.insertion.duration = length

            const newRange = Range.fromStartDuration(elem.range.start, length)
            return Project.elemModify(elem, { range: newRange })
        }
        else
            return elem
    })

    const range = Timeline.selectionRange(state) || new Range(new Rational(0), new Rational(0))
    const newTime = range.end
    state.cursor.visible = false
    Timeline.cursorSetTime(state, newTime, newTime)
    Timeline.scrollTimeIntoView(state, newTime)

    state.needsKeyFinish = true
}