import * as Project from "./index"
import * as Theory from "../theory"
import Immutable from "immutable"
import Range from "../util/range"
import Rational from "../util/rational"
import ListOfRanges from "../util/listOfRanges"


export interface Root
{
    nextId: Project.ID
    baseBpm: number
    tracks: Project.Track[]
    lists: Immutable.Map<Project.ID, ListOfRanges<Project.Element>>
    elems: Immutable.Map<Project.ID, Project.Element>
}


export function makeEmpty(): Root
{
    return {
        nextId: 1,
        baseBpm: 120,
        tracks: [],
        lists: Immutable.Map<Project.ID, ListOfRanges<Project.Element>>(),
        elems: Immutable.Map<Project.ID, Project.Element>(),
    }
}


export function getDefault(): Root
{
    let project = makeEmpty()

    const track1Id = project.nextId
    project = upsertTrack(project, Project.makeTrackKeyChanges())
    
    const track2Id = project.nextId
    project = upsertTrack(project, Project.makeTrackMeterChanges())

    project = upsertElement(project, Project.makeKeyChange(
        track1Id, new Rational(0), Theory.Key.parse("C Major")))

    project = upsertElement(project, Project.makeMeterChange(
        track2Id, new Rational(0), new Theory.Meter(4, 4)))

    const track3Id = project.nextId
    project = upsertTrack(project, Project.makeTrackNotes())

    const noteBlockId = project.nextId
    project = upsertElement(project, Project.makeNoteBlock(
        track3Id,
        Range.fromStartDuration(new Rational(0), new Rational(4))))

    for (let i = 0; i < 16; i++)
        project = upsertElement(project, Project.makeNote(
            noteBlockId,
            Range.fromStartDuration(new Rational(i, 4), new Rational(1, 4)),
            60 + i))

    console.log(project)
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

    return Object.assign({}, project, { nextId, elems, tracks })
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
        return Object.assign({}, project, { nextId, elems, lists })
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

        return Object.assign({}, project, { nextId, elems, lists })
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

        return Object.assign({}, project, { nextId, elems, lists })
    }
}


export function keyChangeTrackId(project: Root): Project.ID
{
    return 1
}


export function meterChangeTrackId(project: Root): Project.ID
{
    return 2
}