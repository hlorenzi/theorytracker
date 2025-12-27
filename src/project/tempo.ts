import Immutable from "immutable"
import * as Project from "./index.ts"
import * as Theory from "../theory"
import BinarySearch from "../utils/binarySearch.ts"
import Rational from "../utils/rational.ts"
import ListOfRanges from "../utils/listOfRanges.ts"
import Range from "../utils/range.ts"


export interface TempoCacheRegion
{
    time1: Rational
    time2: Rational
    bpm: number
    startMs: number
}


let tempoCacheKey: ListOfRanges<Project.Element> = null!
let tempoCache: TempoCacheRegion[] = []
let firstTempoCh: Project.TempoChange | null = null
let lastTempoCh: Project.TempoChange | null = null

const defaultTempoRegion: TempoCacheRegion = {
    time1: new Rational(0),
    time2: new Rational(0),
    bpm: 120,
    startMs: 0,
}


export function ensureTempoCacheRefreshed(project: Project.ImmutableRoot)
{
    const tempoChList = project.lists.get(project.tempoChangeTrackId)
    if (!tempoChList)
        return

    if (tempoChList === tempoCacheKey)
        return

    tempoCacheKey = tempoChList
    tempoCache = []

    if (!tempoChList)
        return

    let accumulatedMs = 0

    for (const [elem1, elem2] of tempoChList.iterAllPairwise())
    {
        if (!elem1)
            firstTempoCh = elem2 as Project.TempoChange | null

        if (!elem2)
            lastTempoCh = elem1 as Project.TempoChange | null

        if (!elem1)
            continue

        const tempoCh1 = elem1 as Project.TempoChange
        const tempoCh2 = elem2 as (Project.TempoChange | null)

        tempoCache.push({
            time1: elem1.range.start,
            time2: tempoCh2 ? tempoCh2.range.start : project.range.end,
            bpm: tempoCh1.bpm,
            startMs: accumulatedMs,
        })

        if (tempoCh2)
        {
            const measuresPerSecond = (tempoCh1.bpm / 4 / 60)
            const durationMs =
                tempoCh2.range.start.subtract(tempoCh1.range.start).asFloat() /
                measuresPerSecond * 1000

            accumulatedMs += durationMs
        }
    }
}


export function getMillisecondsAt(
    project: Project.ImmutableRoot,
    time: Rational)
    : number
{
    ensureTempoCacheRefreshed(project)

    const tempoCacheIndex = BinarySearch.findPreviousOrEqual(
        tempoCache,
        (m) => time.compare(m.time1))

    const tempoRegion =
        tempoCacheIndex !== null ? tempoCache[tempoCacheIndex] :
        tempoCache.length > 0 ? tempoCache[0] :
        defaultTempoRegion

    const measuresPerSecond = (tempoRegion.bpm / 4 / 60)
    const localMs =
        time.subtract(tempoRegion.time1).asFloat() /
        measuresPerSecond * 1000

    return tempoRegion.startMs + localMs
}


export function getTimeAtMilliseconds(
    project: Project.ImmutableRoot,
    timeMs: number)
    : Rational
{
    ensureTempoCacheRefreshed(project)

    const tempoCacheIndex = BinarySearch.findPreviousOrEqual(
        tempoCache,
        (m) => timeMs - m.startMs)

    const tempoRegion =
        tempoCacheIndex !== null ? tempoCache[tempoCacheIndex] :
        tempoCache.length > 0 ? tempoCache[0] :
        defaultTempoRegion

    const measuresPerSecond = (tempoRegion.bpm / 4 / 60)
    const localBeats =
        (timeMs - tempoRegion.startMs) / 1000 * measuresPerSecond

    return tempoRegion.time1.add(Rational.fromFloat(localBeats, Project.MAX_RATIONAL_DENOMINATOR))
}