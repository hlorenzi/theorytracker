import * as State from "../state.ts"
import * as Timeline from "./index.ts"
import * as Prefs from "../prefs.ts"
import * as Theory from "../theory"
import Rational from "../utils/rational.ts"
import * as CanvasUtils from "../utils/canvasUtils.ts"
import Rect from "../utils/rect.ts"


export function draw(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D)
{
    ctx.save()
    ctx.translate(0.5, 0.5)

    ctx.fillStyle = "#fff"
    ctx.clearRect(0, 0, timeline.renderRect.w, timeline.renderRect.h)

    for (const lane of timeline.layout.lanes)
        drawLane(ctx, timeline, prefs, lane)

    if (timeline.cursor.visible)
    {
        const timeMin = timeline.cursor.time1.min(timeline.cursor.time2)
        const timeMax = timeline.cursor.time1.max(timeline.cursor.time2)
        drawCursorBeam(timeline, prefs, ctx, timeMin, false)
        drawCursorBeam(timeline, prefs, ctx, timeMax, true)
    }

    ctx.restore()
}


function drawLane(
    ctx: CanvasRenderingContext2D,
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    lane: Timeline.Lane)
{
    if (lane instanceof Timeline.LaneChords)
    {
        ctx.save()
        ctx.beginPath()
        ctx.rect(
            lane.rect.x,
            lane.rect.y,
            lane.rect.w,
            lane.rect.h)
        ctx.clip()

        drawLaneBkgSolid(timeline, prefs, ctx, lane)
        drawLaneBkgMeasures(timeline, prefs, ctx, lane, false)
        drawLaneBkgMeasures(timeline, prefs, ctx, lane, true)
        drawCursorBkg(timeline, prefs, ctx, lane)

        ctx.save()
        ctx.translate(lane.rect.x, lane.rect.y)
        drawElements(timeline, prefs, ctx, lane.elements)
        ctx.restore()

        drawLaneFrgOutline(timeline, prefs, ctx, lane)

        ctx.restore()
    }

    else if (lane instanceof Timeline.LaneNotes)
    {
        ctx.save()
        ctx.beginPath()
        ctx.rect(
            lane.rect.x,
            lane.rect.y,
            lane.rect.w,
            lane.rect.h)
        ctx.clip()

        drawLaneBkgSolid(timeline, prefs, ctx, lane)
        drawLaneBkgOctaves(timeline, prefs, ctx, lane, false)
        drawLaneBkgMeasures(timeline, prefs, ctx, lane, false)
        drawLaneBkgOctaves(timeline, prefs, ctx, lane, true)
        drawLaneBkgMeasures(timeline, prefs, ctx, lane, true)
        drawCursorBkg(timeline, prefs, ctx, lane)

        ctx.save()
        ctx.translate(lane.rect.x, lane.rect.y)
        drawElements(timeline, prefs, ctx, lane.elements)

        for (const tuple of lane.tupleIndicators)
        {
            ctx.strokeStyle = prefs.timeline.octaveLabelColor
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(tuple.rect.x, tuple.rect.y2 + 2)
            ctx.lineTo(tuple.rect.x, tuple.rect.y2 + 5)
            ctx.lineTo(tuple.rect.x2, tuple.rect.y2 + 5)
            ctx.lineTo(tuple.rect.x2, tuple.rect.y2 + 2)
            ctx.stroke()
            
            ctx.fillStyle = prefs.timeline.octaveLabelColor
            ctx.font = Math.floor(timeline.noteRowH - 4) + "px system-ui"
            ctx.textAlign = "center"
            ctx.textBaseline = "top"
            ctx.fillText(
                tuple.denominator.toString(),
                tuple.rect.xCenter,
                tuple.rect.y2 + 8)
        }

        ctx.restore()

        drawLaneFrgOutline(timeline, prefs, ctx, lane)

        ctx.restore()
    }
}


function drawElements(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D,
    elements: Timeline.LayoutElement[])
{
    for (const element of elements)
    {
        if (element.id !== undefined &&
            timeline.selection.has(element.id))
            element.zIndexForHover = 1

        else if (timeline.hover?.id === element.id)
            element.zIndexForHover = 2

        else
            element.zIndexForHover = 0
    }

    elements.sort((a, b) =>
        ((a.zIndex ?? 0) + (a.zIndexForHover ?? 0)) -
        ((b.zIndex ?? 0) + (b.zIndexForHover ?? 0)))

    for (const element of elements)
    {
        if (element.kind === "note")
        {
            ctx.save()
            ctx.beginPath()
            ctx.roundRect(
                element.rect.x,
                element.rect.y,
                element.rect.w,
                element.rect.h,
                timeline.noteRowH / 4)
            ctx.clip()

            const x1 = element.rect.x  + (element.cutStart ? -16 : 0)
            const x2 = element.rect.x2 + (element.cutEnd ? 16 : 0)

            const key = element.key
            const mode = key.scale.metadata!.mode
            const fillStyle = CanvasUtils.fillStyleForDegree(
                ctx,
                key.degreeForMidi(element.note.midiPitch) + mode,
                false)
                
            ctx.fillStyle = fillStyle
            ctx.beginPath()
            ctx.roundRect(
                x1,
                element.rect.y,
                x2 - x1,
                element.rect.h,
                timeline.noteRowH / 4)
            ctx.fill()

            if (timeline.hover?.id === element.id)
            {
                ctx.fillStyle = "#fff8"
                ctx.fill()
            }

            if (element.id !== undefined &&
                timeline.selection.has(element.id))
            {
                ctx.strokeStyle = "#fff8"
                ctx.lineWidth = 6
                ctx.stroke()
            }

            ctx.restore()
        }

        else if (element.kind === "chord")
            drawChord(timeline, prefs, ctx, element)

        else if (element.kind === "marker")
            drawMarker(timeline, prefs, ctx, element)
    }
}


function drawChord(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D,
    element: Timeline.LayoutElementChord)
{
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(
        element.rect.x,
        element.rect.y,
        element.rect.w,
        element.rect.h,
        5)
    ctx.clip()

    const x1 = element.rect.x  + (element.cutStart ? -16 : 0)
    const x2 = element.rect.x2 + (element.cutEnd ? 16 : 0)

    CanvasUtils.drawChord(
        ctx,
        Rect.fromVertices(x1, element.rect.y, x2, element.rect.y2),
        prefs,
        element.chord.chord,
        element.key)
        
    ctx.beginPath()
    ctx.roundRect(
        x1,
        element.rect.y,
        x2 - x1,
        element.rect.h,
        5)
        
    if (timeline.hover?.id === element.id)
    {
        ctx.fillStyle = "#fff8"
        ctx.fill()
    }

    if (element.id !== undefined &&
        timeline.selection.has(element.id))
    {
        ctx.strokeStyle = "#fff8"
        ctx.lineWidth = 6
        ctx.stroke()
    }

    ctx.restore()
}


function drawMarker(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D,
    element: Timeline.LayoutElementMarker)
{
    ctx.save()

    const color =
        element.keyCh ? prefs.timeline.keyChangeColor :
        element.meterCh ? prefs.timeline.meterChangeColor :
        "#000"

    const makeKeyChangeDifferenceText = (chromaPrev: number | undefined, chromaNext: number) => {
        if (chromaPrev === undefined)
            return ""

        const diff1 = Theory.Utils.mod(chromaNext - chromaPrev, 12)
        const diff2 = diff1 - 12
        const diff = Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2
        return ` (${diff >= 0 ? "+" : ""}${diff})`
    }

    const text =
        element.keyCh ?
            element.keyCh.key.toString() +
            makeKeyChangeDifferenceText(
                element.keyChPrev?.key.tonic.chroma,
                element.keyCh.key.tonic.chroma) :
        element.meterCh ?
            element.meterCh.meter.toString() :
        ""

    ctx.fillStyle = color
    ctx.strokeStyle = prefs.timeline.bkgColor
    ctx.font = `bold ${element.rect.h * 0.85}px ${prefs.timeline.fontNameMarker}`
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.lineWidth = 8

    if (element.rect.xCenter >= 0)
    {
        ctx.strokeText(
            text,
            element.rect.x2 + 8,
            element.rect.yCenter)
        ctx.fillText(
            text,
            element.rect.x2 + 8,
            element.rect.yCenter)
    }

    ctx.beginPath()
    ctx.moveTo(element.rect.x, element.rect.y)
    ctx.lineTo(element.rect.x2, element.rect.y)
    ctx.lineTo(element.rect.x2, element.rect.y + element.rect.h * 0.65)
    ctx.lineTo(element.rect.xCenter, element.rect.y2)
    ctx.lineTo(element.rect.x, element.rect.y + element.rect.h * 0.65)
    ctx.lineTo(element.rect.x, element.rect.y)
    ctx.clip()
    ctx.fill()

    if (timeline.hover?.id === element.id)
    {
        ctx.fillStyle = "#fff8"
        ctx.fill()
    }

    if (element.id !== undefined &&
        timeline.selection.has(element.id))
    {
        ctx.strokeStyle = "#fff8"
        ctx.lineWidth = 6
        ctx.stroke()
    }

    ctx.restore()
}


export function drawLaneBkgCenterStroke(
    timeline: Timeline.State,
    ctx: CanvasRenderingContext2D,
    lane: Timeline.Lane)
{
    const yCenter = Math.floor(lane.rect.y + lane.rect.h / 2) + 0.5
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(lane.rect.x, yCenter)
    ctx.lineTo(lane.rect.x + lane.rect.w, yCenter)
    ctx.stroke()
}


export function drawLaneBkgSolid(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D,
    lane: Timeline.Lane)
{
    if (timeline.layout.measures.length > 100)
    {
        ctx.fillStyle = prefs.timeline.bkgColor
        ctx.fillRect(
            lane.rect.x,
            lane.rect.y,
            lane.rect.w,
            lane.rect.h)

        return
    }

    for (const measure of timeline.layout.measures)
    {
        const x1 = Math.floor(Timeline.xAtTime(timeline, measure.time1))
        const x2 = Math.floor(Timeline.xAtTime(timeline, measure.time2))

        ctx.fillStyle =
            measure.num % 2 === 0 ? prefs.timeline.bkgColor :
            prefs.timeline.bkgAlternateMeasureColor

        ctx.fillRect(
            x1,
            lane.rect.y,
            x2 - x1,
            lane.rect.h)
    }
}


export function drawLaneFrgOutline(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D,
    lane: Timeline.Lane)
{
    ctx.strokeStyle = prefs.timeline.measureColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(lane.rect.x, lane.rect.y)
    ctx.lineTo(lane.rect.x + lane.rect.w, lane.rect.y)
    ctx.moveTo(lane.rect.x, lane.rect.y + lane.rect.h)
    ctx.lineTo(lane.rect.x + lane.rect.w, lane.rect.y + lane.rect.h)
    ctx.stroke()
}


export function drawLaneBkgMeasures(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D,
    lane: Timeline.Lane,
    mainLinePass: boolean)
{
    // Render alternating measure background and sub-measure dividers.
    for (const measure of timeline.layout.measures)
    {
        const x1 = Math.floor(Timeline.xAtTime(timeline, measure.time1))
        const x2 = Math.floor(Timeline.xAtTime(timeline, measure.time2))

        const submeasureSize =
            Timeline.xAtTime(timeline, new Rational(1, measure.meterCh.meter.denominator)) -
            Timeline.xAtTime(timeline, new Rational(0))

        if (mainLinePass)
        {
            ctx.strokeStyle = prefs.timeline.measureColor
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(x1 + 0.5, lane.rect.y)
            ctx.lineTo(x1 + 0.5, lane.rect.y + lane.rect.h)
            ctx.stroke()
        }

        if (!mainLinePass &&
            submeasureSize > 8)
        {
            ctx.strokeStyle = prefs.timeline.submeasureColor
            ctx.lineWidth = 1
            ctx.beginPath()

            for (let n = 1; n < measure.meterCh.meter.numerator; n++)
            {
                const submeasureX = x1 + Math.round(submeasureSize * n)
                if (submeasureX >= x2)
                    break

                ctx.moveTo(submeasureX, lane.rect.y)
                ctx.lineTo(submeasureX, lane.rect.y + lane.rect.h)
            }

            ctx.stroke()
        }
    }

    if (mainLinePass)
    {
        for (const marker of timeline.layout.markers)
        {
            const x = Math.floor(Timeline.xAtTime(timeline, marker.time))
            
            const color =
                marker.keyCh ? prefs.timeline.keyChangeColor :
                marker.meterCh ? prefs.timeline.meterChangeColor :
                prefs.timeline.measureColor
                
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(x + 0.5, lane.rect.y)
            ctx.lineTo(x + 0.5, lane.rect.y + lane.rect.h)
            ctx.stroke()
        }
    }
}


export function drawLaneBkgOctaves(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D,
    lane: Timeline.Lane,
    mainLinePass: boolean)
{
    const rowAtTop = Timeline.rowAtY(timeline, lane, lane.rect.y)
    const rowAtBottom = Timeline.rowAtY(timeline, lane, lane.rect.y + lane.rect.h)

    const octaveAtTop = Math.ceil(rowAtTop / 7) + 1
    const octaveAtBottom = Math.floor(rowAtBottom / 7) - 1

    ctx.fillStyle = prefs.timeline.octaveLabelColor
    ctx.font = Math.floor(timeline.noteRowH - 4) + "px system-ui"
    ctx.textAlign = "left"
    ctx.textBaseline = "bottom"

    for (const keyRegion of timeline.layout.keyRegions)
    {
        const key = keyRegion.keyCh1.key
        const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
        const scaleLength = key.scale.chromas.length

        let needsOctaveLabels = true
        let drewOctaveLabels = false

        for (const measure of timeline.layout.measures)
        {
            if (measure.time1.compare(keyRegion.keyCh2.range.start) >= 0)
                continue

            if (measure.time2.compare(keyRegion.keyCh1.range.start) <= 0)
                continue

            const time1 = measure.time1.max(keyRegion.keyCh1.range.start)
            const time2 = measure.time2.min(keyRegion.keyCh2.range.start)

            const x1 = Math.floor(Timeline.xAtTime(timeline, time1))
            const x2 = Math.floor(Timeline.xAtTime(timeline, time2))
        
            for (let i = octaveAtBottom; i <= octaveAtTop; i++)
            {
                const y = Math.floor(
                    Timeline.yForRow(timeline, lane, tonicRowOffset + i * scaleLength) + timeline.noteRowH)
                
                if (mainLinePass)
                {
                    const labelX = Math.max(x1 + 5, 5)
                    if (needsOctaveLabels && labelX + 30 < x2)
                    {
                        for (let j = 0; j < scaleLength; j += 1)
                        {
                            const pitchName = key.namedPitches[j]
                            const chroma = key.scale.chromas[j] + key.tonic.chroma + ((i + 5) * 12)
                            const octave = Math.floor(chroma / 12)
                            ctx.fillText(
                                pitchName.str,
                                labelX,
                                y - 1 - j * timeline.noteRowH)
                            
                            if (j === 0)
                            {
                                const letterMeasure = ctx.measureText(pitchName.str)
                                ctx.fillText(
                                    octave.toString(),
                                    labelX + Math.max(14, letterMeasure.width),
                                    y - 1 - j * timeline.noteRowH)
                            }
                        }
                        
                        drewOctaveLabels = true
                    }

                    ctx.strokeStyle = prefs.timeline.measureColor
                    ctx.beginPath()
                    ctx.moveTo(x1, y)
                    ctx.lineTo(x2, y)
                    ctx.moveTo(x1, y + 1)
                    ctx.lineTo(x2, y + 1)
                    ctx.stroke()
                }

                if (!mainLinePass)
                {
                    ctx.strokeStyle = prefs.timeline.submeasureColor
                    ctx.beginPath()
                    for (let j = 1; j < scaleLength; j += 1)
                    {
                        const ySuboctave = Math.floor(
                            Timeline.yForRow(timeline, lane, tonicRowOffset + i * scaleLength + j) + timeline.noteRowH)
                        
                        ctx.moveTo(x1, ySuboctave)
                        ctx.lineTo(x2, ySuboctave)
                    }
                    ctx.stroke()
                }
            }

            if (drewOctaveLabels)
                needsOctaveLabels = false
        }
    }
}


function drawCursorBeam(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D,
    time: Rational,
    tipOffsetSide: boolean)
{
    const laneIndexMin = Timeline.cursorGetLaneIndexMin(timeline)
    const laneIndexMax = Timeline.cursorGetLaneIndexMax(timeline)
    
    const laneMin = timeline.layout.lanes[laneIndexMin]
    const laneMax = timeline.layout.lanes[laneIndexMax]
    
    const x = 0.5 + Math.floor(Timeline.xAtTime(timeline, time))
    
    ctx.strokeStyle = prefs.timeline.selectionCursorColor
    ctx.fillStyle = prefs.timeline.selectionCursorColor
    ctx.lineCap = "square"
    ctx.lineWidth = 2
    
    const headYSize = 10
    const headXSize = headYSize * (tipOffsetSide ? -1 : 1)

    const y1 = Math.floor(laneMin.rect.y)
    const y2 = Math.floor(laneMax.rect.y2)
    
    ctx.beginPath()
    ctx.moveTo(x,             y1 + headYSize)
    ctx.lineTo(x + headXSize, y1)
    ctx.lineTo(x,             y1)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(x,             y2 - headYSize)
    ctx.lineTo(x + headXSize, y2)
    ctx.lineTo(x,             y2)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(x, y1 + 1)
    ctx.lineTo(x, y2 - 1)
    ctx.stroke()
}
	
	
function drawCursorBkg(
    timeline: Timeline.State,
    prefs: Prefs.Prefs,
    ctx: CanvasRenderingContext2D,
    lane: Timeline.Lane)
{
    if (!timeline.cursor.visible)
        return
    
    const timeMin = timeline.cursor.time1.min(timeline.cursor.time2)
    const timeMax = timeline.cursor.time1.max(timeline.cursor.time2)
    const laneIndexMin = Timeline.cursorGetLaneIndexMin(timeline)
    const laneIndexMax = Timeline.cursorGetLaneIndexMax(timeline)
    
    if (laneIndexMin > lane.laneIndex ||
        laneIndexMax < lane.laneIndex)
        return

    const y1 = Math.floor(lane.rect.y)
    const y2 = Math.floor(lane.rect.y2)
    
    const x1 = Timeline.xAtTime(timeline, timeMin)
    const x2 = Timeline.xAtTime(timeline, timeMax)
    
    ctx.fillStyle = prefs.timeline.selectionBkgColor
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
}