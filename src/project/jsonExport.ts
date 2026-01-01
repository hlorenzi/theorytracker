import * as Project from "./index.ts"
import * as Theory from "../theory"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"
import * as MathUtils from "../utils/mathUtils.ts"


export function jsonExport(project: Project.ImmutableRoot): string
{
    let json = ``
    json += `{\n`
    json += `"version": 2,\n`
    json += `"tracks": [\n`

    let firstTrack = true
    for (const track of project.tracks)
    {
        if (!firstTrack)
            json += `,\n`

        firstTrack = false

        json += `\t{\n`
        json += `\t"id": ${ JSON.stringify(track.id) },\n`
        json += `\t"name": ${ JSON.stringify(track.name) },\n`
        json += `\t"type": ${ JSON.stringify(track.type) },\n`
        json += `\t"trackType": ${ JSON.stringify(track.trackType) },\n`

        if (track.trackType === "notes" ||
            track.trackType === "chords")
        {
            json += `\t"mute": ${ JSON.stringify(track.mute) },\n`
            json += `\t"solo": ${ JSON.stringify(track.solo) },\n`
            json += `\t"volumeDb": 0,\n`// ${ JSON.stringify(track.volumeDb) },\n`
            //json += `\t"instrument": ${ JSON.stringify(track.instrument) },\n`
        }

        json += `\t"elems": [\n`

        let firstElem = true
        for (const elem of project.lists.get(track.id)?.iterAll() ?? [])
        {
            if (!firstElem)
                json += `,\n`

            json += exportElem(2, project, elem, new Rational(0))
            firstElem = false
        }

        json += `\n`
        json += `\t]\n`
        json += `\t}`
    }

    json += `\n]\n`
    json += `}`
    return json
}


function exportElem(
    indent: number,
    project: Project.ImmutableRoot,
    elem: Project.Element,
    timeOffset: Rational)
    : string
{
    const range = elem.range
        .displace(timeOffset)
        .quantize(Project.MAX_RATIONAL_DENOMINATOR)

    let json = `\t`.repeat(indent)
    json += `[`
    json += `${ JSON.stringify(elem.type) }`
    json += `, ${ JSON.stringify(elem.id) }`
    json += `, ${ JSON.stringify(range.toJson(Project.MAX_RATIONAL_DENOMINATOR)) }`

    switch (elem.type)
    {
        case "tempoChange":
        {
            json += `, ${ JSON.stringify({
                bpm: elem.bpm,
            }) }`
            break
        }

        case "keyChange":
        {
            json += `, ${ JSON.stringify(elem.key.str) }`
            break
        }

        case "meterChange":
        {
            json += `, ${ JSON.stringify({
                meter: elem.meter.toJson(),
            }) }`
            break
        }

        case "note":
        {
            json += `, ${ JSON.stringify([
                elem.midiPitch,
                0,//MathUtils.quantize(elem.volumeDb, 1000),
                1,//MathUtils.quantize(elem.velocity, 1000),
            ]) }`
            break
        }

        case "chord":
        {
            json += `, ${ JSON.stringify(elem.chord.toJson()) }`
            break
        }

        default:
        {
            json += ``
            break
        }
    }

    const innerList = project.lists.get(elem.id)
    if (innerList)
    {
        json += `, [\n`
        let firstElem = true
        for (const innerElem of innerList.iterAll())
        {
            if (!firstElem)
                json += `,\n`

            json += exportElem(indent + 1, project, innerElem, elem.range.start)
            firstElem = false
        }

        json += `\n`
        json += `\t`.repeat(indent)
        json += `]`
    }

    json += `]`
    return json
}