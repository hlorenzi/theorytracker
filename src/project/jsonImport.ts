import * as Project from "./index"
import * as Theory from "../theory"
import Rational from "../util/rational"
import Range from "../util/range"
import * as MathUtils from "../util/mathUtils"


export function jsonImport(json: any): Project.Root
{
    console.log("jsonImport", json)

    let project = Project.makeEmpty()
    project.baseBpm = json.baseBpm

    for (const jsonTrack of json.tracks)
    {
        let track: Project.Track
        switch (jsonTrack.trackType as Project.Track["trackType"])
        {
            case "notes":
                track = Project.makeTrackNotes()
                track.instrument = jsonTrack.instrument
                track.volumeDb = jsonTrack.volumeDb
                break
            case "chords":
                track = Project.makeTrackChords()
                track.instrument = jsonTrack.instrument
                track.volumeDb = jsonTrack.volumeDb
                break
            case "keyChanges":
                track = Project.makeTrackKeyChanges()
                break
            case "meterChanges":
                track = Project.makeTrackMeterChanges()
                break
        }

        track.name = jsonTrack.name
        track.mute = jsonTrack.mute
        track.solo = jsonTrack.solo

        const trackId = project.nextId
        project = Project.upsertTrack(project, track)

        if (track.trackType == "keyChanges")
            project.keyChangeTrackId = trackId
        else if (track.trackType == "meterChanges")
            project.meterChangeTrackId = trackId
        else if (track.trackType == "chords")
            project.chordTrackId = trackId

        for (const jsonElem of jsonTrack.elems)
        {
            const projectRef = { ref: project }
            importElem(projectRef, trackId, jsonElem, new Rational(0))
            project = projectRef.ref
        }
    }

    console.log("project", project)
    return Project.withRefreshedRange(project)
}


function importElem(
    projectRef: { ref: Project.Root },
    parentId: Project.ID,
    jsonElem: any,
    timeOffset: Rational)
{
    const range = Range.fromJson(jsonElem[2]).subtract(timeOffset)

    let elem: Project.Element
    switch (jsonElem[0] as Project.Element["type"])
    {
        case "note":
        {
            elem = Project.makeNote(
                parentId,
                range,
                jsonElem[3][0],
                jsonElem[3][1],
                jsonElem[3][2])
            break
        }

        case "chord":
        {
            elem = Project.makeChord(
                parentId,
                range,
                new Theory.Chord(
                    jsonElem[3][0],
                    Theory.Chord.kindFromId(jsonElem[3][1]),
                    jsonElem[3][2],
                    []))
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
                Theory.Meter.parse(jsonElem[3]))
            break
        }

        case "noteBlock":
        {
            elem = Project.makeNoteBlock(
                parentId,
                range)
            break
        }

        case "track":
            throw "invalid json"
    }

    const id = projectRef.ref.nextId
    projectRef.ref = Project.upsertElement(projectRef.ref, elem)

    if (jsonElem[4])
    {
        for (const jsonInner of jsonElem[4])
        {
            importElem(projectRef, id, jsonInner, range.start)
        }
    }
}