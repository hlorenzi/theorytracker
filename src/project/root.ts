import * as Project from "./index"
import * as Theory from "../theory"
import Immutable from "immutable"
import Range from "../util/range"
import Rational from "../util/rational"
import ListOfRanges from "../util/listOfRanges"


export interface Root
{
    nextId: Project.ID
    range: Range
    baseBpm: number
    tracks: Project.Track[]
    lists: Immutable.Map<Project.ID, ListOfRanges<Project.Element>>
    elems: Immutable.Map<Project.ID, Project.Element>
    keyChangeTrackId: number
    meterChangeTrackId: number
    chordTrackId: number
}


export function makeEmpty(): Root
{
    return {
        nextId: 1,
        range: new Range(new Rational(0), new Rational(4)),
        baseBpm: 120,
        tracks: [],
        lists: Immutable.Map<Project.ID, ListOfRanges<Project.Element>>(),
        elems: Immutable.Map<Project.ID, Project.Element>(),
        keyChangeTrackId: -1,
        meterChangeTrackId: -1,
        chordTrackId: -1,
    }
}


export function makeNew(): Root
{
    let project = makeEmpty()

    const track1Id = project.nextId
    project.keyChangeTrackId = track1Id
    project = upsertTrack(project, Project.makeTrackKeyChanges())
    
    const track2Id = project.nextId
    project.meterChangeTrackId = track2Id
    project = upsertTrack(project, Project.makeTrackMeterChanges())

    project = upsertElement(project, Project.makeKeyChange(
        track1Id, new Rational(0), Theory.Key.parse("C Major")))

    project = upsertElement(project, Project.makeMeterChange(
        track2Id, new Rational(0), new Theory.Meter(4, 4)))

    const track3Id = project.nextId
    project.chordTrackId = track3Id
    project = upsertTrack(project, Project.makeTrackChords())
    
    const track4Id = project.nextId
    project = upsertTrack(project, Project.makeTrackNotes())

    return project
}


export function getDefault(): Root
{
    let project = makeEmpty()

    const track1Id = project.nextId
    project.keyChangeTrackId = track1Id
    project = upsertTrack(project, Project.makeTrackKeyChanges())
    
    const track2Id = project.nextId
    project.meterChangeTrackId = track2Id
    project = upsertTrack(project, Project.makeTrackMeterChanges())

    project = upsertElement(project, Project.makeKeyChange(
        track1Id, new Rational(0), Theory.Key.parse("C Major")))

    project = upsertElement(project, Project.makeMeterChange(
        track2Id, new Rational(0), new Theory.Meter(4, 4)))

    const track3Id = project.nextId
    project.chordTrackId = track3Id
    project = upsertTrack(project, Project.makeTrackChords())
    
    project = upsertElement(project, Project.makeChord(
        track3Id,
        Range.fromStartDuration(new Rational(0), new Rational(1)),
        new Theory.Chord(0, 0, 0, [])))

    const track4Id = project.nextId
    project = upsertTrack(project, Project.makeTrackNotes())

    const noteBlockId = project.nextId
    project = upsertElement(project, Project.makeNoteBlock(
        track4Id,
        Range.fromStartDuration(new Rational(0), new Rational(4))))

    for (let i = 0; i < 16; i++)
        project = upsertElement(project, Project.makeNote(
            noteBlockId,
            Range.fromStartDuration(new Rational(i, 4), new Rational(1, 4)),
            60 + i,
            0,
            1))

    return project
}


export function upsertTrack(
    project: Root,
    track: Project.Track,
    remove: boolean = false,
    insertBefore: number = -1): Root
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


export function upsertElement(project: Root, elem: Project.Element): Root
{
    let nextId = project.nextId
    
    if (elem.id < 0)
    {
        elem = Project.elemModify(elem, { id: nextId })
        nextId++
    }
    
    const prevElem = project.elems.get(elem.id)
    const changeParent = !!prevElem && prevElem.parentId != elem.parentId

    if (!changeParent)
    {
        let list = project.lists.get(elem.parentId) || new ListOfRanges()
        list = list.upsert(elem)

        let elems = project.elems.set(elem.id, elem)
        let lists = project.lists.set(elem.parentId, list)
        return { ...project, nextId, elems, lists }
    }
    else if (elem.parentId < 0)
    {
        let prevList = project.lists.get(prevElem!.parentId) || new ListOfRanges()
        prevList = prevList.removeById(prevElem!.id)

        let elems = project.elems.delete(elem.id)
        let lists = project.lists.set(prevElem!.parentId, prevList)

        /*console.log("delete elem " + elem.id + " from " + prevElem!.parentId)
        console.log(prevList.findById(elem.id))
        console.log(elems.get(elem.id))*/

        return { ...project, nextId, elems, lists }
    }
    else
    {
        let prevList = project.lists.get(prevElem!.parentId) || new ListOfRanges()
        prevList = prevList.removeById(prevElem!.id)

        let nextList = project.lists.get(elem.parentId) || new ListOfRanges()
        nextList = nextList.upsert(elem)

        /*console.log("change parent from " + prevElem!.parentId + " to " + elem.parentId)
        console.log(prevElem!)
        console.log(prevList.findById(elem.id))
        console.log(elem)
        console.log(nextList.findById(elem.id))*/

        let elems = project.elems.set(elem.id, elem)
        let lists = project.lists
            .set(prevElem!.parentId, prevList)
            .set(elem.parentId, nextList)

        return { ...project, nextId, elems, lists }
    }
}


export function keyChangeTrackId(project: Root): Project.ID
{
    return project.keyChangeTrackId
}


export function meterChangeTrackId(project: Root): Project.ID
{
    return project.meterChangeTrackId
}


export function keyAt(project: Root, trackId: Project.ID, time: Rational): Theory.Key
{
    const keyChangeTrackId = Project.keyChangeTrackId(project)
    const keyChangeTrackTimedElems = project.lists.get(keyChangeTrackId)
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


export function meterChangeAt(project: Root, trackId: Project.ID, time: Rational): Project.MeterChange | null
{
    const meterChangeTrackId = Project.meterChangeTrackId(project)
    const meterChangeTrackTimedElems = project.lists.get(meterChangeTrackId)
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


export function meterAt(project: Root, trackId: Project.ID, time: Rational): Theory.Meter
{
    const meterCh = meterChangeAt(project, trackId, time)
    if (meterCh)
        return meterCh.meter
        
    return defaultMeter()
}


export function withRefreshedRange(project: Root): Root
{
    let range = new Range(new Rational(0), new Rational(4));

    for (const track of project.tracks)
    {
        const list = project.lists.get(track.id)
        if (list)
            range = range.merge(list.getTotalRange())
    }

    if (range.start.compare(project.range.start) == 0 &&
        range.end.compare(project.range.end) == 0)
        return project

    return { ...project, range }
}


export function getElem<T extends Project.Element["type"]>(
    project: Root,
    id: Project.ID,
    type: T)
    : Extract<Project.Element, { type: T }> | null
{
    const elem = project.elems.get(id)
    if (!elem || elem.type != type)
        return null

    return elem as Extract<Project.Element, { type: T }>
}


export function getTrack<T extends Project.Track["trackType"]>(
    project: Root,
    id: Project.ID,
    trackType: T)
    : Extract<Project.Track, { trackType: T }> | null
{
    const elem = project.elems.get(id)
    if (!elem || elem.type != "track" || elem.trackType != trackType)
        return null

    return elem as Extract<Project.Track, { trackType: T }>
}


export function cloneElem(
    fromProject: Root,
    elem: Project.Element,
    toProject: Root)
    : Root
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
    project: Root,
    elem: Project.Element,
    splitRange: Range)
    : Root
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
    origProject: Root,
    project: Root,
    newParentId: Project.ID,
    elem: Project.Element,
    relativeDisplace: Rational,
    splitRange: Range,
    keepRange: Range)
    : Root
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


export function parentTrackFor(project: Root, elemId: Project.ID): Project.Track
{
    while (true)
    {
        const elem = project.elems.get(elemId)
        if (!elem)
            return null!
            
        if (elem.type == "track")
            return elem

        elemId = elem.parentId
    }
}


export function getAbsoluteTime(project: Root, parentId: Project.ID, time: Rational): Rational
{
    while (true)
    {
        const elem = project.elems.get(parentId)
        if (!elem)
            return time
            
        if (elem.type == "track")
            return time

        time = time.add(elem.range.start)
        parentId = elem.parentId
    }
}


export function getRelativeTime(project: Root, parentId: Project.ID, time: Rational): Rational
{
    while (true)
    {
        const elem = project.elems.get(parentId)
        if (!elem)
            return time
            
        if (elem.type == "track")
            return time

        time = time.subtract(elem.range.start)
        parentId = elem.parentId
    }
}


export function getAbsoluteRange(project: Root, parentId: Project.ID, range: Range): Range
{
    while (true)
    {
        const elem = project.elems.get(parentId)
        if (!elem)
            return range
            
        if (elem.type == "track")
            return range

        range = range.displace(elem.range.start)
        parentId = elem.parentId
    }
}


export function getRelativeRange(project: Root, parentId: Project.ID, range: Range): Range
{
    while (true)
    {
        const elem = project.elems.get(parentId)
        if (!elem)
            return range
            
        if (elem.type == "track")
            return range

        range = range.subtract(elem.range.start)
        parentId = elem.parentId
    }
}


export function getRangeForElems(project: Root, elemIds: Iterable<Project.ID>): Range | null
{
    let range: Range | null = null

    for (const id of elemIds)
    {
        const elem = project.elems.get(id) as Project.Element
        if (!elem)
            continue

        if (elem.type == "track")
            continue

        const absRange = Project.getAbsoluteRange(project, elem.parentId, elem.range)
        range = Range.merge(range, absRange)
    }

    return range
}


export function getMillisecondsAt(project: Root, time: Rational): number
{
    const measuresPerSecond = (project.baseBpm / 4 / 60)
    return time.subtract(project.range.start).asFloat() / measuresPerSecond * 1000
}


export function defaultKey(): Theory.Key
{
    return Theory.Key.parse("C Major")
}


export function defaultMeter(): Theory.Meter
{
    return new Theory.Meter(4, 4)
}