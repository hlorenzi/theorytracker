import * as Immutable from "immutable"
import * as Project from "./index.ts"
import * as Theory from "../theory"
import Range from "../utils/range.ts"
import Rational from "../utils/rational.ts"
import ListOfRanges from "../utils/listOfRanges.ts"


// Least Common Multiple of 2, 3, 4, 5, 6, 7, 8, 9, and 10.
export const MAX_RATIONAL_DENOMINATOR = 2520


export interface Mutable
{
    root: ImmutableRoot
}


export interface ImmutableRoot
{
    nextId: Project.ID
    range: Range

    tracks: Project.Track[]
    lists: Immutable.Map<Project.ID, ListOfRanges<Project.Element>>
    elems: Immutable.Map<Project.ID, Project.Element>
    tempoChangeTrackId: number
    keyChangeTrackId: number
    meterChangeTrackId: number
    chordTrackId: number
    noteTrackId: number
}


export function makeEmpty(): ImmutableRoot
{
    return {
        nextId: 1,
        range: new Range(new Rational(0), new Rational(4)),
        tracks: [],
        lists: Immutable.Map<Project.ID, ListOfRanges<Project.Element>>(),
        elems: Immutable.Map<Project.ID, Project.Element>(),
        tempoChangeTrackId: -1,
        keyChangeTrackId: -1,
        meterChangeTrackId: -1,
        chordTrackId: -1,
        noteTrackId: -1,
    }
}


export function makeNew(): ImmutableRoot
{
    let project = makeEmpty()

    project.tempoChangeTrackId = project.nextId
    project = upsertTrack(project, Project.makeTrackTempoChanges())
    
    project.keyChangeTrackId = project.nextId
    project = upsertTrack(project, Project.makeTrackKeyChanges())
    
    project.meterChangeTrackId = project.nextId
    project = upsertTrack(project, Project.makeTrackMeterChanges())

    project = upsertElement(project, Project.makeTempoChange(
        project.tempoChangeTrackId, new Rational(0), 120))

    project = upsertElement(project, Project.makeKeyChange(
        project.keyChangeTrackId, new Rational(0), Theory.Key.parse("C Major")))

    project = upsertElement(project, Project.makeMeterChange(
        project.meterChangeTrackId, new Rational(0), new Theory.Meter(4, 4)))

    project.chordTrackId = project.nextId
    project = upsertTrack(project, Project.makeTrackChords())
    
    project.noteTrackId = project.nextId
    project = upsertTrack(project, Project.makeTrackNotes())

    return project
}


export function makeTest(): ImmutableRoot
{
    let project = makeNew()

    for (let i = 0; i < 24; i++)
        project = upsertElement(project, Project.makeNote(
            project.noteTrackId,
            Range.fromStartDuration(new Rational(i, 4), new Rational(1, 4)),
            Theory.Utils.midiMiddleC - 12 + i))

    for (let i = 0; i < 7; i++)
        project = upsertElement(project, Project.makeChord(
            project.chordTrackId,
            Range.fromStartDuration(new Rational(i * 4, 4), new Rational(4, 4)),
            Theory.Chord.fromDiatonicTriad(Theory.Key.parse("C Major"), i)))

    return withRefreshedRange(project)
}


export function upsertTrack(
    project: ImmutableRoot,
    track: Project.Track,
    remove: boolean = false,
    insertBefore: number = -1): ImmutableRoot
{
    let nextId = project.nextId
    let tracks = project.tracks
    
    if (track.id < 0)
    {
        track = Project.elemModify(track, { id: nextId })
        nextId++
    }
    
    if (remove)
    {
        const trackIndex = tracks.findIndex(t => t.id === track.id)
        if (trackIndex >= 0)
            tracks = [
                ...tracks.slice(0, trackIndex),
                ...tracks.slice(trackIndex + 1)
            ]
    }
    else
    {
        const trackIndex = tracks.findIndex(t => t.id === track.id)
        if (trackIndex < 0)
        {
            if (insertBefore < 0)
                tracks = [...tracks, track]
            else
                tracks = [
                    ...tracks.slice(0, insertBefore),
                    track,
                    ...tracks.slice(insertBefore)
                ]
        }
        else
        {
            tracks = [
                ...tracks.slice(0, trackIndex),
                track,
                ...tracks.slice(trackIndex + 1)
            ]
        }
    }

    let elems = project.elems
    if (remove)
        elems = elems.delete(track.id)
    else
        elems = elems.set(track.id, track)

    return { ...project, nextId, elems, tracks }
}


export function upsertElement(project: ImmutableRoot, elem: Project.Element): ImmutableRoot
{
    let nextId = project.nextId
    
    if (elem.id < 0)
    {
        elem = Project.elemModify(elem, { id: nextId })
        nextId++
    }
    
    const prevElem = project.elems.get(elem.id)
    const changeParent = !!prevElem && prevElem.parentId !== elem.parentId

    if (!changeParent)
    {
        let list = project.lists.get(elem.parentId) ?? new ListOfRanges()
        list = list.upsert(elem)

        let elems = project.elems.set(elem.id, elem)
        let lists = project.lists.set(elem.parentId, list)
        return { ...project, nextId, elems, lists }
    }
    else if (elem.parentId < 0)
    {
        let prevList = project.lists.get(prevElem.parentId) ?? new ListOfRanges()
        prevList = prevList.removeById(prevElem.id)

        let elems = project.elems.delete(elem.id)
        let lists = project.lists.set(prevElem.parentId, prevList)

        return { ...project, nextId, elems, lists }
    }
    else
    {
        let prevList = project.lists.get(prevElem.parentId) ?? new ListOfRanges()
        prevList = prevList.removeById(prevElem.id)

        let nextList = project.lists.get(elem.parentId) ?? new ListOfRanges()
        nextList = nextList.upsert(elem)

        let elems = project.elems.set(elem.id, elem)
        let lists = project.lists
            .set(prevElem.parentId, prevList)
            .set(elem.parentId, nextList)

        return { ...project, nextId, elems, lists }
    }
}


export function keyAt(project: ImmutableRoot, trackId: Project.ID, time: Rational): Theory.Key
{
    const keyChangeTrackTimedElems = project.lists.get(project.keyChangeTrackId)
    if (!keyChangeTrackTimedElems)
        return defaultKey()
        
    const keyCh = keyChangeTrackTimedElems.findActiveAt(time)
    if (keyCh)
        return (keyCh as Project.KeyChange).key

    const firstKeyCh = keyChangeTrackTimedElems.findFirst()
    if (firstKeyCh)
        return (firstKeyCh as Project.KeyChange).key
        
    return defaultKey()
}


export function meterChangeAt(project: ImmutableRoot, trackId: Project.ID, time: Rational): Project.MeterChange | null
{
    const meterChangeTrackTimedElems = project.lists.get(project.meterChangeTrackId)
    if (!meterChangeTrackTimedElems)
        return null
        
    const meterCh = meterChangeTrackTimedElems.findActiveAt(time)
    if (meterCh)
        return (meterCh as Project.MeterChange)

    const firstMeterCh = meterChangeTrackTimedElems.findFirst()
    if (firstMeterCh)
        return (firstMeterCh as Project.MeterChange)
        
    return null
}


export function meterAt(project: ImmutableRoot, trackId: Project.ID, time: Rational): Theory.Meter
{
    const meterCh = meterChangeAt(project, trackId, time)
    if (meterCh)
        return meterCh.meter
        
    return defaultMeter()
}


export function withRefreshedRange(project: ImmutableRoot): ImmutableRoot
{
    let range = new Range(new Rational(0), new Rational(4))

    for (const track of project.tracks)
    {
        const list = project.lists.get(track.id)
        if (list)
            range = range.merge(list.getTotalRange())
    }

    if (range.start.compare(project.range.start) === 0 &&
        range.end.compare(project.range.end) === 0)
        return project

    return { ...project, range }
}


export function getElem(
    project: ImmutableRoot,
    id: Project.ID | undefined)
    : Project.Element | undefined
{
    if (id === undefined)
        return undefined

    return project.elems.get(id)
}


export function getTypedElem<T extends Project.Element["type"]>(
    project: ImmutableRoot,
    id: Project.ID | undefined,
    type: T)
    : Extract<Project.Element, { type: T }> | undefined
{
    if (id === undefined)
        return undefined

    const elem = project.elems.get(id)
    if (!elem || elem.type !== type)
        return undefined

    return elem as Extract<Project.Element, { type: T }>
}


export function getTrack<T extends Project.Track["trackType"]>(
    project: ImmutableRoot,
    id: Project.ID,
    trackType: T)
    : Extract<Project.Track, { trackType: T }> | null
{
    const elem = project.elems.get(id)
    if (!elem || elem.type !== "track" || elem.trackType !== trackType)
        return null

    return elem as Extract<Project.Track, { trackType: T }>
}


export function cloneElem(
    fromProject: ImmutableRoot,
    elem: Project.Element,
    toProject: ImmutableRoot)
    : ImmutableRoot
{
    const newElem = { ...elem }
    newElem.id = -1

    const newId = toProject.nextId
    toProject = Project.upsertElement(toProject, newElem)

    const innerList = fromProject.lists.get(elem.id)
    if (innerList)
    {
        for (const innerElem of innerList.iterAll())
        {
            const newInnerElem = { ...innerElem }
            newInnerElem.parentId = newId
            
            toProject = cloneElem(fromProject, newInnerElem, toProject)
        }
    }

    return toProject
}


export function splitElem(
    project: ImmutableRoot,
    elem: Project.Element,
    splitRange: Range)
    : ImmutableRoot
{
    const origProject = project
    const absRange = getAbsoluteRange(origProject, elem.parentId, elem.range)

    if (!absRange.overlapsRange(splitRange))
        return project

    const removeElem = Project.elemModify(elem, { parentId: -1 })
    project = Project.upsertElement(project, removeElem)
    
    project = splitInnerElem(
        origProject,
        project,
        elem.parentId,
        elem,
        new Rational(0),
        splitRange,
        absRange)

    return project
}


function splitInnerElem(
    origProject: ImmutableRoot,
    project: ImmutableRoot,
    newParentId: Project.ID,
    elem: Project.Element,
    relativeDisplace: Rational,
    splitRange: Range,
    keepRange: Range)
    : ImmutableRoot
{
    const innerList = origProject.lists.get(elem.id)

    // FIXME: Also keep inner elements that were outside parent's range
    const absRange = getAbsoluteRange(origProject, elem.parentId, elem.range)
    if (!absRange.overlapsRange(keepRange))
        return project

    for (const slice of absRange.iterSlices(splitRange))
    {
        const newElemPart = Project.elemModify(elem, {
            id: -1,
            parentId: newParentId,
            range: getRelativeRange(origProject, elem.parentId, slice)
                .subtract(relativeDisplace),
        })
        
        const newElemPartId = project.nextId
        project = Project.upsertElement(project, newElemPart)
        
        if (innerList)
        {
            const innerRelativeDisplace = slice.start.subtract(absRange.start)

            for (const innerElem of innerList.iterAll())
            {
                project = splitInnerElem(
                    origProject,
                    project,
                    newElemPartId,
                    innerElem,
                    innerRelativeDisplace,
                    splitRange,
                    slice)
            }
        }
    }

    return project
}


export function parentTrackFor(project: ImmutableRoot, elemId: Project.ID): Project.Track
{
    while (true)
    {
        const elem = project.elems.get(elemId)
        if (!elem)
            return null!
            
        if (elem.type === "track")
            return elem

        elemId = elem.parentId
    }
}


export function getAbsoluteTime(project: ImmutableRoot, parentId: Project.ID, time: Rational): Rational
{
    while (true)
    {
        const elem = project.elems.get(parentId)
        if (!elem)
            return time
            
        if (elem.type === "track")
            return time

        time = time.add(elem.range.start)
        parentId = elem.parentId
    }
}


export function getRelativeTime(project: ImmutableRoot, parentId: Project.ID, time: Rational): Rational
{
    while (true)
    {
        const elem = project.elems.get(parentId)
        if (!elem)
            return time
            
        if (elem.type === "track")
            return time

        time = time.subtract(elem.range.start)
        parentId = elem.parentId
    }
}


export function getAbsoluteRange(project: ImmutableRoot, parentId: Project.ID, range: Range): Range
{
    while (true)
    {
        const elem = project.elems.get(parentId)
        if (!elem)
            return range
            
        if (elem.type === "track")
            return range

        range = range.displace(elem.range.start)
        parentId = elem.parentId
    }
}


export function getRelativeRange(project: ImmutableRoot, parentId: Project.ID, range: Range): Range
{
    while (true)
    {
        const elem = project.elems.get(parentId)
        if (!elem)
            return range
            
        if (elem.type === "track")
            return range

        range = range.subtract(elem.range.start)
        parentId = elem.parentId
    }
}


export function getRangeForElems(
    project: ImmutableRoot,
    elemIds: Iterable<Project.ID>)
    : Range | null
{
    let range: Range | null = null

    for (const id of elemIds)
    {
        const elem = project.elems.get(id) as Project.Element
        if (!elem)
            continue

        if (elem.type === "track")
            continue

        const absRange = Project.getAbsoluteRange(project, elem.parentId, elem.range)
        range = Range.merge(range, absRange)
    }

    return range
}


export function defaultKey(): Theory.Key
{
    return Theory.Key.parse("C Major")
}


export function defaultMeter(): Theory.Meter
{
    return new Theory.Meter(4, 4)
}