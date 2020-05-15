import Immutable from "immutable"
import Range from "../util/range"
import Rational from "../util/rational"
import ListOfPoints from "../util/listOfPoints"
import ListOfRanges from "../util/listOfRanges"
import * as Theory from "../theory/theory"


export class Project
{
    nextId: Project.ID
    tracks: Project.Track[]
    timedLists: Immutable.Map<Project.ID, ListOfPoints<Project.TimedElement>>
    rangedLists: Immutable.Map<Project.ID, ListOfRanges<Project.RangedElement>>
    elems: Immutable.Map<number, Project.Element>


    constructor()
    {
        this.nextId = 1
        this.tracks = []
        this.timedLists = Immutable.Map<Project.ID, ListOfPoints<Project.TimedElement>>()
        this.rangedLists = Immutable.Map<Project.ID, ListOfRanges<Project.RangedElement>>()
        this.elems = Immutable.Map<number, Project.Element>()
    }


    static getDefault(): Project
    {
        let project = new Project()

        const track1Id = project.nextId
        project = Project.upsertTrack(project, new Project.TrackKeyChanges())
        
        const track2Id = project.nextId
        project = Project.upsertTrack(project, new Project.TrackMeterChanges())

        project = Project.upsertTimedElement(project, new Project.KeyChange(track1Id, new Rational(0), Theory.Key.parse("D Major")))
        project = Project.upsertTimedElement(project, new Project.MeterChange(track2Id, new Rational(0), new Theory.Meter(4, 4)))

        const track3Id = project.nextId
        project = Project.upsertTrack(project, new Project.TrackNotes())
        for (let i = 0; i < 16; i++)
            project = Project.upsertRangedElement(project, new Project.Note(track3Id, Range.fromStartDuration(new Rational(i, 4), new Rational(1, 4)), 60 + i % 8))

        const track4Id = project.nextId
        project = Project.upsertTrack(project, new Project.TrackNotes())
        for (let i = 0; i < 16; i++)
            project = Project.upsertRangedElement(project, new Project.Note(track4Id, Range.fromStartDuration(new Rational(i, 4), new Rational(1, 4)), 68 - (i % 8)))

        return project
    }


	static upsertTrack(project: Project, track: Project.Track, remove: boolean = false): Project
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


	static upsertTimedElement(project: Project, elem: Project.TimedElement, remove: boolean = false): Project
	{
        let nextId = project.nextId
		
		if (!elem.id)
		{
			elem = Project.Element.withChanges(elem, { id: nextId })
			nextId++
		}

        let timedList = project.timedLists.get(elem.parentId) || new ListOfPoints()
        timedList = timedList.add(elem)

        let elems = project.elems.set(elem.id, elem)
        let timedLists = project.timedLists.set(elem.parentId, timedList)

        return Object.assign({}, project, { nextId, elems, timedLists })
	}


	static upsertRangedElement(project: Project, elem: Project.RangedElement, remove: boolean = false): Project
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
    

    static keyChangeTrackForTrack(project: Project, trackId: Project.ID): Project.ID
    {
        return 1
    }
    

    static meterChangeTrackForTrack(project: Project, trackId: Project.ID): Project.ID
    {
        return 2
    }
}


export namespace Project
{
    export type ID = number


    export enum ElementType
    {
        Track,
        Note,
        KeyChange,
        MeterChange,
    }


    export class Element
    {
        type: Project.ElementType = -1
        id: Project.ID = 0
        parentId: Project.ID = 0


        constructor(type: Project.ElementType, parentId: Project.ID)
        {
            this.type = type
            this.parentId = parentId
        }


        static withChanges<T>(original: T, changes: any): T
        {
            return Object.assign({}, original, changes)
        }
    }


    export enum TrackType
    {
        Notes,
        KeyChanges,
        MeterChanges,
    }


    export class Track extends Element
    {
        trackType: Project.TrackType = 0


        constructor(trackType: Project.TrackType)
        {
            super(ElementType.Track, 0)
            this.trackType = trackType
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


    export class TrackKeyChanges extends Track
    {
        constructor()
        {
            super(Project.TrackType.KeyChanges)
        }
    }


    export class TrackMeterChanges extends Track
    {
        constructor()
        {
            super(Project.TrackType.MeterChanges)
        }
    }


    export class TimedElement extends Element
    {
        time: Rational


        constructor(type: Project.ElementType, parentId: Project.ID, time: Rational)
        {
            super(type, parentId)
            this.time = time
        }
    }


    export class RangedElement extends Element
    {
        range: Range


        constructor(type: Project.ElementType, parentId: Project.ID, range: Range)
        {
            super(type, parentId)
            this.range = range
        }
    }


    export class Note extends RangedElement
    {
        pitch: number


        constructor(parentId: Project.ID, range: Range, pitch: number)
        {
            super(Project.ElementType.Note, parentId, range)
            this.pitch = pitch
        }
    }


    export class KeyChange extends TimedElement
    {
        key: Theory.Key


        constructor(parentId: Project.ID, time: Rational, key: Theory.Key)
        {
            super(Project.ElementType.KeyChange, parentId, time)
            this.key = key
        }
    }


    export class MeterChange extends TimedElement
    {
        meter: Theory.Meter


        constructor(parentId: Project.ID, time: Rational, meter: Theory.Meter)
        {
            super(Project.ElementType.MeterChange, parentId, time)
            this.meter = meter
        }
    }
}


export default Project