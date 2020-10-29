import * as Project from "./elem"
import Immutable from "immutable"
import Range from "../util/range"
import Rational from "../util/rational"
import ListOfRanges from "../util/listOfRanges"
import * as Theory from "../theory"


export class Root
{
    nextId: Project.ID
    baseBpm: number
    tracks: Project.Track[]
    lists: Immutable.Map<Project.ID, ListOfRanges<Project.RangedElement>>
    elems: Immutable.Map<Project.ID, Project.Element>


    constructor()
    {
        this.nextId = 1
        this.baseBpm = 120
        this.tracks = []
        this.lists = Immutable.Map<Project.ID, ListOfRanges<Project.RangedElement>>()
        this.elems = Immutable.Map<Project.ID, Project.Element>()
    }


    static getDefault(): Root
    {
        let project = new Root()

        const track3Id = project.nextId
        project = Root.upsertTrack(project, new Project.TrackNotes())
        for (let i = 0; i < 16; i++)
            project = Root.upsertElement(project, new Project.NoteBlock(
                track3Id,
                Range.fromStartDuration(new Rational(i, 4), new Rational(1, 4))))

        /*const track4Id = project.nextId
        project = Project.upsertTrack(project, new Project.TrackNotes())
        for (let i = 0; i < 16; i++)
            project = Project.upsertRangedElement(project, new Project.Note(track4Id, Range.fromStartDuration(new Rational(i, 4), new Rational(1, 4)), 68 - (i % 8)))
        */
       
        return project
    }


	static upsertTrack(project: Root, track: Project.Track, remove: boolean = false): Root
	{
        let nextId = project.nextId
        let tracks = project.tracks
		
		if (!track.id)
		{
			track = track.withChanges({ id: nextId })
			nextId++
		}
		else
		{
            tracks = tracks.filter(t => t.id !== track.id)
		}
		
        if (!remove)
        {
            const trackIndex = tracks.findIndex(t => t.id === track.id)
            if (trackIndex < 0)
                tracks = [...tracks, track]
            else
                tracks = [
                    ...tracks.slice(0, trackIndex),
                    track,
                    ...tracks.slice(trackIndex + 1)
                ]
        }

        let elems = project.elems
        if (!remove)
            elems = elems.set(track.id, track)

        return Object.assign({}, project, { nextId, elems, tracks })
	}


	static upsertElement(project: Root, elem: Project.RangedElement): Root
	{
        let nextId = project.nextId
		
		if (!elem.id)
		{
			elem = Project.Element.withChanges(elem, { id: nextId })
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
    

    static keyChangeTrackForTrack(project: Root, trackId: Project.ID): Project.ID
    {
        return 1
    }
    

    static meterChangeTrackForTrack(project: Root, trackId: Project.ID): Project.ID
    {
        return 2
    }
}