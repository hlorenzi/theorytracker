import Immutable from "immutable"
import * as Project from "./index.ts"
import * as Theory from "../theory"
import BinarySearch from "../utils/binarySearch.ts"
import Rational from "../utils/rational.ts"
import ListOfRanges from "../utils/listOfRanges.ts"
import Range from "../utils/range.ts"


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


export function ensureMeasureCacheRefreshed(project: Project.ImmutableRoot)
{
    const meterChangeList = project.lists.get(project.meterChangeTrackId)
    if (!meterChangeList)
        return

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
        const meterCh2 = elem2 as Project.MeterChange
        
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
    project: Project.ImmutableRoot,
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
    let measureIndex = measureStart ?? 0
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