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
    rangedLists: Immutable.Map<Project.ID, ListOfRanges<Project.RangedElement>>
    elems: Immutable.Map<number, Project.Element>


    constructor()
    {
        this.nextId = 1
        this.baseBpm = 120
        this.tracks = []
        this.rangedLists = Immutable.Map<Project.ID, ListOfRanges<Project.RangedElement>>()
        this.elems = Immutable.Map<number, Project.Element>()
    }


    static getDefault(): Root
    {
        let project = new Root()

        const track3Id = project.nextId
        project = Root.upsertTrack(project, new Project.TrackNotes())
        for (let i = 0; i < 16; i++)
            project = Root.upsertRangedElement(project, new Project.NoteBlock(
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


	static upsertRangedElement(project: Root, elem: Project.RangedElement, remove: boolean = false): Root
	{
        let nextId = project.nextId
		
		if (!elem.id)
		{
			elem = Project.Element.withChanges(elem, { id: nextId })
			nextId++
		}

        let rangedList = project.rangedLists.get(elem.parentId) || new ListOfRanges()
        rangedList = rangedList.add(elem)

        let elems = project.elems.set(elem.id, elem)
        let rangedLists = project.rangedLists.set(elem.parentId, rangedList)

        return Object.assign({}, project, { nextId, elems, rangedLists })
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