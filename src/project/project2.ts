import Immutable from "immutable"
import Range from "../util/range"
import Rational from "../util/rational"
import ListOfRanges from "../util/listOfRanges"


export class Project
{
    nextId: Project.ID
    tracks: Project.Track[]
    elems: Immutable.Map<Project.ID, ListOfRanges<Project.RangedElement>>


    constructor()
    {
        this.nextId = 1
        this.tracks = []
        this.elems = Immutable.Map<Project.ID, ListOfRanges<Project.RangedElement>>()
    }


    static getDefault(): Project
    {
        let project = new Project()

        const track1Id = project.nextId
        project = Project.upsertTrack(project, new Project.TrackNotes())
        for (let i = 0; i < 16; i++)
            project = Project.upsertElement(project, track1Id, new Project.Note(Range.fromStartDuration(new Rational(i, 4), new Rational(1, 4)), 60 + i % 8))

        const track2Id = project.nextId
        project = Project.upsertTrack(project, new Project.TrackNotes())
        for (let i = 0; i < 16; i++)
            project = Project.upsertElement(project, track2Id, new Project.Note(Range.fromStartDuration(new Rational(i, 4), new Rational(1, 4)), 68 - (i % 8)))

        return project
    }


	static upsertTrack(project: Project, track: Project.Track, remove: boolean = false): Project
	{
        let nextId = project.nextId
        let tracks = project.tracks
		
		if (track.id < 0)
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

        return Object.assign({}, project, { nextId, tracks })
	}


	static upsertElement(project: Project, parentId: Project.ID, elem: Project.RangedElement, remove: boolean = false): Project
	{
        let nextId = project.nextId
        let list = project.elems.get(parentId)
		
		if (elem.id < 0)
		{
			elem = elem.withChanges({ id: nextId })
			nextId++
		}
		else
		{
            if (list)
			    list = list.removeById(elem.id)
		}
		
        if (!remove)
        {
            if (!list)
                list = new ListOfRanges()
            
			list = list.add(elem)
        }

        let elems = project.elems
        if (list)
            elems = elems.set(parentId, list)

        return Object.assign({}, project, { nextId, elems })
	}
}


export namespace Project
{
    export type ID = number


    export enum TrackType
    {
        Notes,
    }


    export class Track
    {
        id: Project.ID = -1
        type: Project.TrackType = -1


        constructor(type: Project.TrackType)
        {
            this.type = type
        }


        withChanges(changes: any): this
        {
            return Object.assign({}, this, changes)
        }
    }


    export class TrackNotes extends Track
    {
        constructor()
        {
            super(Project.TrackType.Notes)
        }
    }


    export enum ElementType
    {
        Note,
    }


    export class Element
    {
        id: Project.ID = -1
        type: Project.ElementType = -1


        constructor(type: Project.ElementType)
        {
            this.type = type
        }


        withChanges(changes: any): this
        {
            return Object.assign({}, this, changes)
        }
    }


    export class RangedElement extends Element
    {
        range: Range


        constructor(type: Project.ElementType, range: Range)
        {
            super(type)
            this.range = range
        }
    }


    export class Note extends RangedElement
    {
        pitch: number


        constructor(range: Range, pitch: number)
        {
            super(Project.ElementType.Note, range)
            this.pitch = pitch
        }
    }
}


export default Project