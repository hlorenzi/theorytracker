import * as Project from "./index.ts"
import * as Theory from "../theory"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"
import * as MathUtils from "../utils/mathUtils.ts"


export function jsonImport(json: any): Project.ImmutableRoot
{
    console.log("jsonImport", json)

    let project = Project.makeEmpty()
    const version = json.version as number

    for (const jsonTrack of json.tracks)
    {
        let track: Project.Track
        switch (jsonTrack.trackType as Project.Track["trackType"])
        {
            case "tempoChanges":
                track = Project.makeTrackTempoChanges()
                break
            case "keyChanges":
                track = Project.makeTrackKeyChanges()
                break
            case "meterChanges":
                track = Project.makeTrackMeterChanges()
                break
            case "notes":
                track = Project.makeTrackNotes()
                //track.instrument = jsonTrack.instrument
                //track.volumeDb = jsonTrack.volumeDb
                break
            case "chords":
                track = Project.makeTrackChords()
                //track.instrument = jsonTrack.instrument
                //track.volumeDb = jsonTrack.volumeDb
                break
        }

        track.name = jsonTrack.name

        if (track.trackType === "notes" ||
            track.trackType === "chords")
        {
            track.mute = jsonTrack.mute
            track.solo = jsonTrack.solo
        }

        const trackId = project.nextId
        project = Project.upsertTrack(project, track)

        if (track.trackType === "tempoChanges")
            project.tempoChangeTrackId = trackId
        else if (track.trackType === "keyChanges")
            project.keyChangeTrackId = trackId
        else if (track.trackType === "meterChanges")
            project.meterChangeTrackId = trackId
        else if (track.trackType === "chords")
            project.chordTrackId = trackId

        for (const jsonElem of jsonTrack.elems)
        {
            const projectMutable = { root: project }
            importElem(version, projectMutable, trackId, jsonElem, new Rational(0))
            project = projectMutable.root
        }
    }

    if (json.version < 2)
    {
        project.tempoChangeTrackId = project.nextId
        project = Project.upsertTrack(project, Project.makeTrackTempoChanges())
        const tempoCh = Project.makeTempoChange(project.tempoChangeTrackId, new Rational(0), json.baseBpm)
        project = Project.upsertElement(project, tempoCh)
    }

    console.log("project", project)
    return Project.withRefreshedRange(project)
}


function importElem(
    version: number,
    project: Project.Mutable,
    parentId: Project.ID,
    jsonElem: any,
    timeOffset: Rational)
{
    const range = Range.fromJson(jsonElem[2])
        .subtract(timeOffset)
        .quantize(Project.MAX_RATIONAL_DENOMINATOR)
    
    let elem: Project.Element
    switch (jsonElem[0] as Project.Element["type"] | "noteBlock")
    {
        case "tempoChange":
        {
            elem = Project.makeTempoChange(
                parentId,
                range.start,
                jsonElem[3].bpm)
            break
        }

        case "keyChange":
        {
            elem = Project.makeKeyChange(
                parentId,
                range.start,
                Theory.Key.parse(jsonElem[3]))
            break
        }

        case "meterChange":
        {
            elem = Project.makeMeterChange(
                parentId,
                range.start,
                version < 2 ?
                    Theory.Meter.parse(jsonElem[3]) :
                    Theory.Meter.fromJson(jsonElem[3]))
            break
        }

        case "note":
        {
            elem = Project.makeNote(
                parentId,
                range,
                jsonElem[3][0])
                //jsonElem[3][1],
                //jsonElem[3][2])
            break
        }

        case "noteBlock":
        {
            for (const jsonInner of jsonElem[4])
            {
                importElem(version, project, parentId, jsonInner, new Rational(0))
            }
            return
        }

        case "chord":
        {
            if (version < 2)
            {
                elem = Project.makeChord(
                    parentId,
                    range,
                    Theory.Chord.fromLegacyKind(
                        jsonElem[3][0],
                        jsonElem[3][2],
                        jsonElem[3][1]))
            }
            else
            {
                elem = Project.makeChord(
                    parentId,
                    range,
                    Theory.Chord.fromJson(jsonElem[3]))
            }
            break
        }

        default:
            throw "invalid project json"
    }

    const id = project.root.nextId
    project.root = Project.upsertElement(project.root, elem)

    if (jsonElem[4])
    {
        for (const jsonInner of jsonElem[4])
        {
            importElem(version, project, id, jsonInner, range.start)
        }
    }
}