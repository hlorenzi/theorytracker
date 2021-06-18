import * as Project from "./index"
import * as Theory from "../theory"
import Immutable from "immutable"
import BinarySearch from "../util/binarySearch"
import Rational from "../util/rational"
import ListOfRanges from "../util/listOfRanges"
import Range from "../util/range"


export interface Measure
{
    num: number
    numLocal: number
    time1: Rational
    time2: Rational
    meterCh: Project.MeterChange
}


let measureCacheKey: ListOfRanges<Project.Element> = null!
let measureCache: Measure[] = []
let firstMeterCh: Project.MeterChange | null = null
let lastMeterCh: Project.MeterChange | null = null


export function ensureMeasureCacheRefreshed(project: Project.Root)
{
    const meterChangeTrackId = Project.meterChangeTrackId(project)
    const meterChangeList = Project.global.project.lists.get(meterChangeTrackId)!

    if (meterChangeList === measureCacheKey)
        return

    measureCacheKey = meterChangeList
    measureCache = []

    if (!meterChangeList)
        return

    let num = 0

    for (const [elem1, elem2] of meterChangeList.iterAllPairwise())
    {
        if (!elem1)
            firstMeterCh = elem2 as Project.MeterChange | null

        if (!elem2)
            lastMeterCh = elem1 as Project.MeterChange | null

        if (!elem1 || !elem2)
            continue

        const meterCh1 = elem1 as Project.MeterChange
        const meterCh2 = elem2 as (Project.MeterChange | null)
        
        let numLocal = 0

        for (const [measureN, measureD, time1, time2] of meterCh1.meter.iterMeasuresPairwise(meterCh1.range.start))
        {
            if (meterCh2 && time1.compare(meterCh2.range.start) >= 0)
                break

            measureCache.push({
                num, numLocal,
                time1,
                time2: time2.min(meterCh2 ? meterCh2.range.start : time2),
                meterCh: meterCh1,
            })

            num++
            numLocal++
        }
    }
}


export function *iterMeasuresAtRange(
    project: Project.Root,
    range: Range)
    : Generator<Measure, void, void>
{
    ensureMeasureCacheRefreshed(project)

    const measureStart = BinarySearch.findPreviousOrEqual(measureCache, (m) => range.start.compare(m.time1))

    if (measureStart === null && firstMeterCh)
    {
        let time = firstMeterCh.range.start
        let num = 0

        while (time.compare(range.start) > 0)
        {
            time = time.subtract(firstMeterCh.meter.fullCycleDuration)
            num--
        }

        while (time.compare(firstMeterCh.range.start) < 0)
        {
            const time2 = time.add(firstMeterCh.meter.fullCycleDuration)

            if (time2.compare(range.start) >= 0)
            {
                yield {
                    meterCh: firstMeterCh,
                    num, numLocal: num,
                    time1: time,
                    time2,
                }
            }

            time = time2
            num++
        }
    }

    let lastMeasureNum = -1
    let measureIndex = measureStart || 0
    while (true)
    {
        if (measureIndex >= measureCache.length)
            break

        const measure = measureCache[measureIndex]
        if (measure.time1.compare(range.end) >= 0)
            break
        
        yield measure
        lastMeasureNum = measure.num
        measureIndex++
    }

    if (lastMeterCh)
    {
        let num = lastMeasureNum + 1
        let time = lastMeterCh.range.start
        
        while (time.compare(range.end) < 0)
        {
            const time2 = time.add(lastMeterCh.meter.fullCycleDuration)

            if (time2.compare(range.start) >= 0)
            {
                yield {
                    meterCh: lastMeterCh,
                    num, numLocal: num,
                    time1: time,
                    time2,
                }
            }

            time = time2
            num++
        }
    }
}