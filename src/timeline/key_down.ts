import * as Project from "../project"
import * as Timeline from "./index.ts"
import * as Playback from "../playback"
import * as Prefs from "../prefs.ts"
import * as Theory from "../theory"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"


export function keyDown(
    timeline: Timeline.State,
    project: Project.Mutable,
    playback: Playback.Manager,
    prefs: Prefs.Prefs,
    key: string)
{
    timeline.keysDown.add(key)

    switch (key)
    {
        case "escape":
        {
            handleEscape(timeline, project.root)
            break
        }

        case "enter":
        {
            handleEnter(timeline, project)
            break
        }

        case "delete":
        {
            handleDelete(timeline, project)
            break
        }

		case "backspace":
        {
            handleBackspace(timeline, project)
            break
        }

        case "arrowright":
        case "arrowleft":
        {
            handleLeftRight(timeline, project, prefs, key === "arrowleft")
            break
        }

        case "arrowup":
        case "arrowdown":
        {
            handleUpDown(timeline, project, playback, prefs, key === "arrowup", false)
            break
        }

        case ".":
        case ">":
        case ",":
        case "<":
        {
            handleUpDown(timeline, project, playback, prefs, key === "." || key === ">", true)
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
            handleInsertByDegree(timeline, project, playback, prefs, degree)
            break
        }

        case "h":
        {
            handleLengthChange(timeline, project, prefs, 0)
            break
        }

        case "j":
        {
            handleLengthChange(timeline, project, prefs, 1)
            break
        }

        case "k":
        {
            handleLengthChange(timeline, project, prefs, 2)
            break
        }

        case "l":
        {
            handleLengthChange(timeline, project, prefs, 3)
            break
        }

        case ";":
        case ":":
        {
            handleLengthChange(timeline, project, prefs, 4)
            break
        }
    }
}


function modifySelectedElems(
    timeline: Timeline.State,
    project: Project.Mutable,
    func: (elem: Project.Element) => Project.Element)
{
    for (const id of timeline.selection)
    {
        const elem = project.root.elems.get(id)
        if (!elem)
            continue

        const newElem = func(elem)
        if (newElem === elem)
            continue
            
        project.root = Project.upsertElement(project.root, newElem)
    }

    project.root = Project.withRefreshedRange(project.root)
}


function handleEscape(
    timeline: Timeline.State,
    project: Project.ImmutableRoot)
{
    /*if (Playback.global.playing)
    {
        Playback.setStartTime(Project.global.project.range.start)
        Playback.setPlaying(true)
    }
    else*/
    {
        Timeline.rewind(timeline, project)
    }
}


function handleEnter(
    timeline: Timeline.State,
    project: Project.Mutable)
{
    if (timeline.cursor.visible &&
        timeline.selection.size !== 0)
    {
        timeline.cursor.visible = false
        return
    }

    timeline.cursor.visible = true

    const range = Timeline.selectionRange(timeline, project.root)
    if (range)
    {
        Timeline.cursorSetTime(timeline, range.end, range.end)
        //Timeline.cursorSetTrack(state, trackIndex, trackIndex)
        Timeline.scrollTimeIntoView(timeline, range.end)
    }
    else
    {
        const time = Rational.max(
            timeline.cursor.time1,
            timeline.cursor.time2)

        Timeline.cursorSetTime(timeline, time, time)
        Timeline.scrollTimeIntoView(timeline, time)
    }

    Timeline.keyHandlePendingFinish(timeline, project)
    Timeline.selectionClear(timeline)
}


function handleDelete(
    state: Timeline.State,
    project: Project.Mutable)
{
    Timeline.deleteElems(state, project, state.selection)
}


function handleBackspace(
    state: Timeline.State,
    project: Project.Mutable)
{
    if (!state.cursor.visible)
    {
        Timeline.deleteElems(state, project, state.selection)
        return
    }

    const lane1 = Math.min(state.cursor.laneIndex1, state.cursor.laneIndex2)
    const lane2 = Math.max(state.cursor.laneIndex1, state.cursor.laneIndex2)
    
    if (state.cursor.time1.compare(state.cursor.time2) === 0)
    {
        const time = state.cursor.time1.min(state.cursor.time2)
        const prevAnchor = Timeline.findPreviousAnchor(state, project.root, time, lane1, lane2)
        const range = new Range(prevAnchor, time, false, false)
        Timeline.deleteRange(state, project, range, lane1, lane2)

        state.cursor.visible = true
        Timeline.cursorSetTime(state, prevAnchor, prevAnchor)
        Timeline.scrollTimeIntoView(state, prevAnchor)
    }
    else
    {
        const time1 = state.cursor.time1.min(state.cursor.time2)
        const time2 = state.cursor.time1.max(state.cursor.time2)
        const range = new Range(time1, time2, false, false)
        Timeline.deleteRange(state, project, range, lane1, lane2)

        state.cursor.visible = true
        Timeline.cursorSetTime(state, time1, time1)
        Timeline.scrollTimeIntoView(state, time1)
    }
    
    project.root = Project.withRefreshedRange(project.root)
}


function handleLeftRight(
    timeline: Timeline.State,
    project: Project.Mutable,
    prefs: Prefs.Prefs,
    isLeft: boolean)
{
    const keyFast = timeline.keysDown.has(prefs.timeline.keyDisplaceFast)
    const keyCursor2 = timeline.keysDown.has(prefs.timeline.keyDisplaceCursor2)
    const keyStretch = timeline.keysDown.has(prefs.timeline.keyDisplaceStretch)


    /*if (Playback.global.playing)
    {
        const timeDelta = state.timeSnap.multiplyByFloat(
            (keyFast ? 64 : 16) * (isLeft ? -1 : 1))

        Playback.setStartTime(Playback.global.playTime.add(timeDelta))
        Playback.setPlaying(true)
    }
    else*/
    if (timeline.cursor.visible &&
        (timeline.selection.size === 0 || keyCursor2))
    {
        const timeDelta = timeline.timeSnap.multiplyByFloat(
            (keyFast ? 16 : 1) * (isLeft ? -1 : 1))

        Timeline.keyHandlePendingFinish(timeline, project)

        if (keyCursor2)
        {
            const newTime = timeline.cursor.time2.add(timeDelta)
            Timeline.cursorSetTime(timeline, null, newTime)
            Timeline.selectionClear(timeline)
            Timeline.selectionAddAtCursor(timeline, project.root)
            Timeline.scrollTimeIntoView(timeline, newTime)
            //Playback.setStartTime(newTime)
        }
        else
        {
            const timeMin = timeline.cursor.time1.min(timeline.cursor.time2)
            const timeMax = timeline.cursor.time1.max(timeline.cursor.time2)

            const newTime = (isLeft ? timeMin : timeMax).add(timeDelta)

            Timeline.cursorSetTime(timeline, newTime, newTime)
            Timeline.scrollTimeIntoView(timeline, newTime)
            //Playback.setStartTime(newTime)
        }
    }
    else
    {
        const timeDelta = timeline.timeSnap.multiplyByFloat(
            (keyFast ? 16 : 1) * (isLeft ? -1 : 1))
        
        const selectionRange = Timeline.selectionRange(timeline, project.root)
        
        let playedPreview = false
        modifySelectedElems(timeline, project, (elem) => {
            if (elem.type == "track")
                return elem

            let newRange = elem.range
                
            if (keyStretch && selectionRange)
            {
                const absRange = Project.getAbsoluteRange(
                    project.root,
                    elem.parentId,
                    elem.range)
                
                newRange = Project.getRelativeRange(
                    project.root,
                    elem.parentId,
                    absRange.stretch(
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
                    timeline.insertion.nearMidiPitch = elem.midiPitch
                    timeline.insertion.duration = newRange.duration
                }
                else if (elem.type == "chord")
                {
                    playedPreview = true
                    timeline.insertion.duration = newRange.duration
                }
            }

            return Project.elemModify(elem, {
                range: newRange
            })
        })

        const range =
            Timeline.selectionRange(timeline, project.root) ||
            new Range(new Rational(0), new Rational(0))
        
        const newTime = (isLeft && !keyStretch ? range.start : range.end)
        timeline.cursor.visible = false
        Timeline.cursorSetTime(timeline, newTime, newTime)
        Timeline.scrollTimeIntoView(timeline, newTime)

        timeline.needsKeyFinish = true
    }
}


function handleUpDown(
    timeline: Timeline.State,
    project: Project.Mutable,
    playback: Playback.Manager,
    prefs: Prefs.Prefs,
    isUp: boolean,
    isChromatic: boolean)
{
    const keyFast = timeline.keysDown.has(prefs.timeline.keyDisplaceFast)
    const keyCursor2 = timeline.keysDown.has(prefs.timeline.keyDisplaceCursor2)
    const keyChromatic = timeline.keysDown.has(prefs.timeline.keyDisplaceChromatically)

    
    if (!isChromatic &&
        timeline.cursor.visible &&
        (timeline.selection.size === 0 || keyCursor2))
    {
        const trackDelta = (isUp ? -1 : 1)

        Timeline.keyHandlePendingFinish(timeline, project)
        
        if (keyCursor2)
        {
            const newTrack = timeline.cursor.laneIndex2 + trackDelta
            Timeline.cursorSetLaneIndex(timeline, null, newTrack)
            Timeline.selectionClear(timeline)
            Timeline.selectionAddAtCursor(timeline, project.root)
        }
        else
        {
            const trackMin = Math.min(timeline.cursor.laneIndex1, timeline.cursor.laneIndex2)
            const trackMax = Math.max(timeline.cursor.laneIndex1, timeline.cursor.laneIndex2)

            const newTrack = (isUp ? trackMin : trackMax) + trackDelta
            Timeline.cursorSetLaneIndex(timeline, newTrack, newTrack)
        }
    }
    else
    {
        const pitchDelta = (keyFast ? 12 : (keyChromatic || isChromatic ? 1 : 0)) * (isUp ? 1 : -1)
        const degreeDelta = (keyFast || isChromatic ? 0 : 1) * (isUp ? 1 : -1)

        let playedPreview = false
        modifySelectedElems(timeline, project, (elem) => {
            if (elem.type === "note")
            {
                const track = Project.parentTrackFor(project.root, elem.parentId)
                const key = Project.keyAt(project.root, elem.range.start)
                const degree = key.octavedDegreeForMidi(elem.midiPitch)
                const newDegree = degree + degreeDelta
                const newPitch = pitchDelta != 0 ?
                    elem.midiPitch + pitchDelta :
                    key.midiForDegree(degreeDelta >= 0 ? Math.floor(newDegree) : Math.ceil(newDegree))

                if (!playedPreview)
                {
                    playedPreview = true
                    playback.playNotePreview(project.root, track.id, newPitch)
                    timeline.insertion.nearMidiPitch = newPitch
                    timeline.insertion.duration = elem.range.duration
                }

                return Project.elemModify(elem, { midiPitch: newPitch })
            }
            else if (elem.type === "chord")
            {
                const track = Project.parentTrackFor(project.root, elem.parentId)
                const key = Project.keyAt(project.root, elem.range.start)
                const degree = key.octavedDegreeForMidi(elem.chord.rootChroma)
                /*const newDegree = degree + degreeDelta
                const newRoot = pitchDelta != 0 ?
                    elem.chord.rootChroma + pitchDelta :
                    key.midiForDegree(degreeDelta >= 0 ? Math.floor(newDegree) : Math.ceil(newDegree))*/
                const newDegree = degreeDelta >= 0 ?
                    Math.floor(degree + degreeDelta) :
                    Math.ceil(degree + degreeDelta)
                const newRoot =
                    key.chromaForDegree(newDegree)
                    
                const newChord = elem.chord.withRoot(newRoot, newDegree)
                console.log(newChord)

                if (!playedPreview)
                {
                    playedPreview = true
                    playback.playChordPreview(project.root, track.id, newChord)
                    timeline.insertion.duration = elem.range.duration
                }

                return Project.elemModify(elem, { chord: newChord })
            }
            else
            {
                return elem
            }
        })

        timeline.cursor.visible = false
        timeline.needsKeyFinish = true
    }
}


function handleInsertByDegree(
    timeline: Timeline.State,
    project: Project.Mutable,
    playback: Playback.Manager,
    prefs: Prefs.Prefs,
    degree: number)
{
    const time = timeline.cursor.time1.min(timeline.cursor.time2)
    const lane = timeline.layout.lanes[timeline.cursor.laneIndex1]
    lane.insertByDegree(timeline, project, playback, prefs, time, degree)
}


function handleLengthChange(
    timeline: Timeline.State,
    project: Project.Mutable,
    prefs: Prefs.Prefs,
    lengthIndex: number)
{
    const lengths = [
        new Rational(1, 16),
        new Rational(1, 8),
        new Rational(1, 4),
        new Rational(1, 2),
        new Rational(1, 1),
    ]

    if (lengthIndex < 0 ||
        lengthIndex >= lengths.length)
        return

    const length = lengths[lengthIndex]

    modifySelectedElems(timeline, project, (elem) => {
        if (elem.type === "note" ||
            elem.type === "chord")
        {
            timeline.insertion.duration = length

            const newRange = Range.fromStartDuration(elem.range.start, length)
            return Project.elemModify(elem, { range: newRange })
        }
        else
            return elem
    })

    const range =
        Timeline.selectionRange(timeline, project.root) ||
        new Range(new Rational(0), new Rational(0))
    
    const newTime = range.end
    timeline.cursor.visible = false
    Timeline.cursorSetTime(timeline, newTime, newTime)
    Timeline.scrollTimeIntoView(timeline, newTime)

    timeline.needsKeyFinish = true
}