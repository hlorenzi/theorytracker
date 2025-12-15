import * as Project from "../project"
import * as Timeline from "./index.ts"
import * as Prefs from "../prefs.ts"
import * as Theory from "../theory"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"


export function keyDown(
    timeline: Timeline.State,
    project: Project.Mutable,
    prefs: Prefs.Prefs,
    key: string)
{
    timeline.keysDown.add(key)

    switch (key)
    {
        case "arrowright":
        case "arrowleft":
        {
            handleLeftRight(timeline, project, prefs, key === "arrowleft")
            break
        }

        case "arrowup":
        case "arrowdown":
        {
            handleUpDown(timeline, project, prefs, key === "arrowup", false)
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
            Timeline.cursorSetTrack(timeline, null, newTrack)
            Timeline.selectionClear(timeline)
            Timeline.selectionAddAtCursor(timeline, project.root)
        }
        else
        {
            const trackMin = Math.min(timeline.cursor.laneIndex1, timeline.cursor.laneIndex2)
            const trackMax = Math.max(timeline.cursor.laneIndex1, timeline.cursor.laneIndex2)

            const newTrack = (isUp ? trackMin : trackMax) + trackDelta
            Timeline.cursorSetTrack(timeline, newTrack, newTrack)
        }
    }
    else
    {
        const pitchDelta = (keyFast ? 12 : (keyChromatic || isChromatic ? 1 : 0)) * (isUp ? 1 : -1)
        const degreeDelta = (keyFast || isChromatic ? 0 : 1) * (isUp ? 1 : -1)

        let playedPreview = false
        modifySelectedElems(timeline, project, (elem) => {
            if (elem.type == "note")
            {
                const track = Project.parentTrackFor(project.root, elem.parentId)
                const key = Project.keyAt(project.root, track.id, elem.range.start)
                const degree = key.octavedDegreeForMidi(elem.midiPitch)
                const newDegree = degree + degreeDelta
                const newPitch = pitchDelta != 0 ?
                    elem.midiPitch + pitchDelta :
                    key.midiForDegree(degreeDelta >= 0 ? Math.floor(newDegree) : Math.ceil(newDegree))

                if (!playedPreview)
                {
                    playedPreview = true
                    //Playback.playNotePreview(track.id, newPitch, elem.volumeDb, elem.velocity)
                    timeline.insertion.nearMidiPitch = newPitch
                    timeline.insertion.duration = elem.range.duration
                }

                return Project.elemModify(elem, { midiPitch: newPitch })
            }
            else if (elem.type == "chord")
            {
                const track = Project.parentTrackFor(project.root, elem.parentId)
                const key = Project.keyAt(project.root, track.id, elem.range.start)
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
                    //Playback.playChordPreview(track.id, newChord, 0, 1)
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