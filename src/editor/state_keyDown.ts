import Range from "../util/range"
import Rational from "../util/rational"
import * as Editor from "./index"
import * as Project from "../project"
	
	
export function keyDown(data: Editor.EditorUpdateData, key: string)
{
    data.state.keysDown.add(key)

    console.log("keyDown", key, data.activeWindow)

    if (!data.activeWindow)
        return

    switch (key)
    {
        case "escape":
        {
            handleEscape(data)
            break
        }

        case "enter":
        {
            handleEnter(data)
            break
        }

        case "arrowright":
        case "arrowleft":
        {
            handleLeftRight(data, key === "arrowleft")
            break
        }

        case "arrowup":
        case "arrowdown":
        {
            handleUpDown(data, key === "arrowup", false)
            break
        }

        case ".":
        case ">":
        case ",":
        case "<":
        {
            handleUpDown(data, key === "." || key === ">", true)
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
            const degree = (key.charCodeAt(0) - "1".charCodeAt(0))
            handleNumber(data, degree)
            break
        }
    }
}


function modifySelectedElems(
    data: Editor.EditorUpdateData,
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

    data.project = newProject
}


function handleEscape(data: Editor.EditorUpdateData)
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


function handleEnter(data: Editor.EditorUpdateData)
{
    data.state.cursor.visible = true

    const range = Editor.selectionRange(data)
    if (range)
    {
        let trackId = data.state.tracks[0].projectTrackId
        for (const id of data.state.selection)
        {
            trackId = Editor.parentTrackFor(data, id).id
        }

        const trackIndex = data.state.tracks.findIndex(tr => tr.projectTrackId === trackId)

        Editor.cursorSetTime(data, range.end, range.end)
        Editor.cursorSetTrack(data, trackIndex, trackIndex)
        Editor.scrollTimeIntoView(data, range.end)
    }

    Editor.keyHandlePendingFinish(data)
    Editor.selectionClear(data)
}


function handleLeftRight(data: Editor.EditorUpdateData, isLeft: boolean)
{
    const keyCtrl = data.state.keysDown.has(data.prefs.editor.keySelectMultiple)
    const keyShift = data.state.keysDown.has(data.prefs.editor.keySelectRect)


    if (data.playback.playing)
    {
        const timeDelta = data.state.timeSnap.multiplyByFloat(
            (keyCtrl ? 64 : 16) * (isLeft ? -1 : 1))

        data.playback.setStartTime(data.playback.playTime.add(timeDelta))
        data.playback.startPlaying()
    }
    else if (data.state.cursor.visible && (data.state.selection.size == 0 || keyShift))
    {
        const timeDelta = data.state.timeSnap.multiplyByFloat(
            (keyCtrl ? 16 : 1) * (isLeft ? -1 : 1))

        Editor.keyHandlePendingFinish(data)

        if (keyShift)
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
            (keyCtrl ? 16 : 1) * (isLeft ? -1 : 1))

        let playedPreview = false

        modifySelectedElems(data, (elem) =>
        {
            if (elem.type == "track")
                return elem
                
            if (!playedPreview && elem.type == "note")
            {
                data.state.insertion.nearMidiPitch = elem.midiPitch
                data.state.insertion.duration = elem.range.duration
            }

            return Project.elemModify(elem, {
                range: elem.range.displace(timeDelta)
            })
        })

        const range = Editor.selectionRange(data) || new Range(new Rational(0), new Rational(0))
        const newTime = (isLeft ? range.start : range.end)
        data.state.cursor.visible = false
        Editor.cursorSetTime(data, newTime, newTime)
        Editor.scrollTimeIntoView(data, newTime)

        data.state.needsKeyFinish = true
    }
}


function handleUpDown(data: Editor.EditorUpdateData, isUp: boolean, isChromatic: boolean)
{
    const keyCtrl = data.state.keysDown.has(data.prefs.editor.keySelectMultiple)
    const keyShift = data.state.keysDown.has(data.prefs.editor.keySelectRect)

    
    if (!isChromatic && data.state.cursor.visible && (data.state.selection.size == 0 || keyShift))
    {
        const trackDelta = (isUp ? -1 : 1)

        Editor.keyHandlePendingFinish(data)
        
        if (keyShift)
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
        const pitchDelta = (keyCtrl ? 12 : (keyShift || isChromatic ? 1 : 0)) * (isUp ? 1 : -1)
        const degreeDelta = (keyCtrl || isChromatic ? 0 : 1) * (isUp ? 1 : -1)

        let playedPreview = false

        modifySelectedElems(data, (elem) =>
        {
            if (elem.type != "note")
                return elem
                
            const track = Editor.parentTrackFor(data, elem.parentId)
            const key = Editor.keyAt(data, track.id, elem.range.start)
            const degree = key.octavedDegreeForMidi(elem.midiPitch)
            const newDegree = degree + degreeDelta
            const newPitch = pitchDelta != 0 ?
                elem.midiPitch + pitchDelta :
                key.midiForDegree(degreeDelta >= 0 ? Math.floor(newDegree) : Math.ceil(newDegree))

            if (!playedPreview)
            {
                playedPreview = true
                data.playback.playNotePreview(track.id, newPitch, elem.velocity)
                data.state.insertion.nearMidiPitch = elem.midiPitch
                data.state.insertion.duration = elem.range.duration
            }

            return Project.elemModify(elem, {
                midiPitch: newPitch
            })
        })

        data.state.cursor.visible = false
        data.state.needsKeyFinish = true
    }
}


function handleNumber(data: Editor.EditorUpdateData, degree: number)
{
    const time = data.state.cursor.time1.min(data.state.cursor.time2)
    const trackId = data.state.tracks[data.state.cursor.trackIndex1].projectTrackId
    const key = Editor.keyAt(data, trackId, time)
    
    /*if (state.tracks[state.cursor.track1].kind === "chords")
    {
        const root = key.midiForDegree(degree)
        
        let pitches = [0]
        pitches.push(key.midiForDegree(degree + 2) - root)
        pitches.push(key.midiForDegree(degree + 4) - root)
        
        const kind = Theory.Chord.kindFromPitches(pitches)
        const chord = new Theory.Chord(root, 0, kind, 0, [])
        state = Editor.reduce_insertChord(state, { time, chord })
    }
    else*/
    {
        const chroma = key.chromaForDegree(degree)
        Editor.insertNote(data, time, chroma)
    }
}