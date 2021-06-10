import * as Command from "../command"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import * as Dockable from "../dockable"
import * as Windows from "../windows"
import Rational from "../util/rational"
import Range from "../util/range"
import { RefState } from "../util/refState"


export const convertNotesToChords: Command.Command =
{
    name: "Convert Notes to Chords",
    func: async () =>
    {
        const timelineState = Dockable.getMostRecentContentData(Windows.Timeline, (data) =>
        {
            return data.timelineState as RefState<Timeline.State>
        })

        if (!timelineState)
            return

        const data: Timeline.WorkData =
        {
            state: timelineState.ref.current,
            ctx: null!,
            activeWindow: true,
        }

        const elemIds = timelineState.ref.current.selection

        const elems: Project.Note[] = []
        for (const elemId of elemIds)
        {
            const note = Project.getElem(Project.global.project, elemId, "note")
            if (note)
                elems.push(note)

            const noteBlock = Project.getElem(Project.global.project, elemId, "noteBlock")
            if (noteBlock)
            {
                const list = Project.global.project.lists.get(noteBlock.id)
                if (list)
                {
                    for (const elem of list.iterAll())
                    {
                        if (elem.type == "note")
                            elems.push(elem)
                    }
                }
            }
        }

        if (elems.length == 0)
            return

        const trackId = Project.global.project.chordTrackId
        
        Timeline.selectionClear(data)

        const groups = calculateGroups(data, elems)
        let chordsToAdd: ChordToAdd[] = []
        for (const group of groups)
        {
            const midiPitches = group.elems.map(elem => elem.midiPitch)
            const chordSuggestions = Theory.Chord.suggestChordsForPitches(midiPitches)

            if (chordSuggestions.length >= 1)
            {
                chordsToAdd.push({
                    chord: chordSuggestions[0].chord,
                    range: group.range,
                })
            }
        }

        chordsToAdd = coallesceNeighboringChordsToAdd(chordsToAdd)

        for (const chordToAdd of chordsToAdd)
        {
            const projChord = Project.makeChord(
                trackId,
                chordToAdd.range,
                chordToAdd.chord)

            const id = Project.global.project.nextId
            Project.global.project = Project.upsertElement(Project.global.project, projChord)

            Timeline.selectionAdd(data, id)
        }

        Project.global.project = Project.withRefreshedRange(Project.global.project)

        data.state.cursor.visible = false
        Timeline.selectionRemoveConflictingBehind(data)
        Timeline.sendEventRefresh()
        Project.splitUndoPoint()
        Project.addUndoPoint("menuConvertNotesToChords")
    }
}


interface ChordToAdd
{
    chord: Theory.Chord
    range: Range
}


function coallesceNeighboringChordsToAdd(chordsToAdd: ChordToAdd[]): ChordToAdd[]
{
    const newChordsToAdd: ChordToAdd[] = []

    let prev = -1
    for (let i = 0; i < chordsToAdd.length; i++)
    {
        if (prev < 0)
        {
            prev = newChordsToAdd.length
            newChordsToAdd.push({ ...chordsToAdd[i] })
        }
        else
        {
            const prevChord = newChordsToAdd[prev].chord
            const nextChord = chordsToAdd[i].chord

            if (prevChord.rootChroma == nextChord.rootChroma &&
                prevChord.kind == nextChord.kind)
            {
                newChordsToAdd[prev].range = newChordsToAdd[prev].range.merge(chordsToAdd[i].range)
            }
            else
            {
                // Fill holes?
                //newChordsToAdd[prev].range = new Range(newChordsToAdd[prev].range.start, chordsToAdd[i].range.start)
                
                prev = newChordsToAdd.length
                newChordsToAdd.push({ ...chordsToAdd[i] })
            }
        }
    }

    return newChordsToAdd
}


interface Group
{
    elems: Project.Note[]
    range: Range
}


function calculateGroups(data: Timeline.WorkData, elems: Project.Note[]): Group[]
{
    const minTime = elems.reduce<Rational | null>((accum, elem) =>
    {
        const start = Project.getAbsoluteTime(Project.global.project, elem.parentId, elem.range.start)
        return start.min(accum)
    },
    null)!

    const maxTime = elems.reduce<Rational | null>((accum, elem) =>
    {
        const end = Project.getAbsoluteTime(Project.global.project, elem.parentId, elem.range.end)
        return end.max(accum)
    },
    null)!

    const groups: Group[] = []

    let curTime = minTime
    while (curTime.compare(maxTime) < 0)
    {
        const nextTime = elems.reduce<Rational>((accum, elem) =>
        {
            const range = Project.getAbsoluteRange(Project.global.project, elem.parentId, elem.range)
            if (range.start.compare(curTime) > 0)
                return range.start.min(accum)
            
            if (range.end.compare(curTime) > 0)
                return range.end.min(accum)

            return accum
        },
        null!) || maxTime

        const groupRange = new Range(curTime, nextTime)

        const groupElems = elems.filter(elem =>
        {
            const range = Project.getAbsoluteRange(Project.global.project, elem.parentId, elem.range)
            return groupRange.overlapsRange(range)
        })

        groups.push({
            elems: groupElems,
            range: groupRange,
        })

        curTime = nextTime
    }

    return groups
}