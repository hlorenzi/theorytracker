import * as State from "../state.ts"
import * as Timeline from "./index.ts"
import * as Theory from "../theory"
import Rational from "../utils/rational.ts"


export function draw(
    timeline: Timeline.State,
    ctx: CanvasRenderingContext2D)
{
    ctx.save()
    ctx.translate(0.5, 0.5)

    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, timeline.renderRect.w, timeline.renderRect.h)

    drawElements(timeline, ctx, timeline.layout.elements)

    if (timeline.cursor.visible)
    {
        const timeMin = timeline.cursor.time1.min(timeline.cursor.time2)
        const timeMax = timeline.cursor.time1.max(timeline.cursor.time2)
        drawCursorBeam(timeline, ctx, timeMin, false)
        drawCursorBeam(timeline, ctx, timeMax, true)
    }

    ctx.restore()
}


function drawElements(
    timeline: Timeline.State,
    ctx: CanvasRenderingContext2D,
    elements: Timeline.LayoutElement[])
{
    for (const element of elements)
    {
        if (element.kind === "lane")
        {
            ctx.save()
            ctx.beginPath()
            ctx.rect(
                element.rect.x,
                element.rect.y,
                element.rect.w,
                element.rect.h)
            ctx.clip()

            drawLaneBkgSolid(timeline, ctx, element)
            drawLaneBkgMeasures(timeline, ctx, element, false)
            drawLaneBkgMeasures(timeline, ctx, element, true)
            drawCursorBkg(timeline, ctx, element)
            
            if (element.subElements)
                drawElements(timeline, ctx, element.subElements)

            drawLaneFrgOutline(timeline, ctx, element)

            ctx.restore()
        }

        if (element.kind === "laneNotes")
        {
            ctx.save()
            ctx.beginPath()
            ctx.rect(
                element.rect.x,
                element.rect.y,
                element.rect.w,
                element.rect.h)
            ctx.clip()

            drawLaneBkgSolid(timeline, ctx, element)
            drawLaneBkgOctaves(timeline, ctx, element, false)
            drawLaneBkgMeasures(timeline, ctx, element, false)
            drawLaneBkgOctaves(timeline, ctx, element, true)
            drawLaneBkgMeasures(timeline, ctx, element, true)
            drawCursorBkg(timeline, ctx, element)
            
            if (element.subElements)
                drawElements(timeline, ctx, element.subElements)

            drawLaneFrgOutline(timeline, ctx, element)

            ctx.restore()
        }

        if (element.kind === "note")
        {
            ctx.fillStyle =
                timeline.hover?.id === element.id ? "#f88" : "#f00"
            ctx.beginPath()
            ctx.roundRect(
                element.rect.x,
                element.rect.y,
                element.rect.w,
                element.rect.h,
                timeline.noteRowH / 4)
            ctx.fill()

            if (element.id !== undefined &&
                timeline.selection.has(element.id))
            {
                ctx.strokeStyle = "#fbb"
                ctx.lineWidth = 4
                ctx.stroke()
            }
        }
    }
}


export function drawLaneBkgCenterStroke(
    timeline: Timeline.State,
    ctx: CanvasRenderingContext2D,
    lane: Timeline.LayoutElementLaneMarkers)
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
    ctx: CanvasRenderingContext2D,
    lane: Timeline.LayoutElementLaneMarkers | Timeline.LayoutElementLaneNotes)
{
    ctx.fillStyle = "#eee"
    ctx.fillRect(
        lane.rect.x,
        lane.rect.y,
        lane.rect.w,
        lane.rect.h)
}


export function drawLaneFrgOutline(
    timeline: Timeline.State,
    ctx: CanvasRenderingContext2D,
    lane: Timeline.LayoutElementLaneMarkers | Timeline.LayoutElementLaneNotes)
{
    ctx.strokeStyle = "#000"
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
    ctx: CanvasRenderingContext2D,
    lane: Timeline.LayoutElementLaneMarkers | Timeline.LayoutElementLaneNotes,
    mainLinePass: boolean)
{
    // Render alternating measure background and sub-measure dividers.
    const measureHalfH = lane.rect.h / 2
    const submeasureHalfH = lane.rect.h / 2
    for (const measure of timeline.layout.measures)
    {
        const x1 = Math.floor(Timeline.xAtTime(timeline, measure.time1))
        const x2 = Math.floor(Timeline.xAtTime(timeline, measure.time2))

        const submeasureSize =
            Timeline.xAtTime(timeline, new Rational(1, measure.meterCh.meter.denominator)) -
            Timeline.xAtTime(timeline, new Rational(0))

        if (mainLinePass)
        {
            ctx.strokeStyle = "#444"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(x1 + 0.5, lane.rect.y)
            ctx.lineTo(x1 + 0.5, lane.rect.y + lane.rect.h)
            ctx.stroke()
        }

        if (!mainLinePass &&
            submeasureSize > 8)
        {
            ctx.strokeStyle = "#fff"
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
}


export function drawLaneBkgOctaves(
    timeline: Timeline.State,
    ctx: CanvasRenderingContext2D,
    lane: Timeline.LayoutElementLaneNotes,
    mainLinePass: boolean)
{
    const rowAtTop = Timeline.rowAtY(timeline, lane, lane.rect.y)
    const rowAtBottom = Timeline.rowAtY(timeline, lane, lane.rect.y + lane.rect.h)

    const octaveAtTop = Math.ceil(rowAtTop / 7) + 1
    const octaveAtBottom = Math.floor(rowAtBottom / 7) - 1

    ctx.fillStyle = "#444"
    ctx.font = Math.floor(timeline.noteRowH - 4) + "px system-ui"
    ctx.textAlign = "left"
    ctx.textBaseline = "bottom"

    for (const keyRegion of timeline.layout.keyRegions)
    {
        const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(keyRegion.keyCh1.key.tonic.chroma)

        let needsOctaveLabels = true
        let drewOctaveLabels = false

        for (const measure of timeline.layout.measures)
        {
            /*if (measure.time1.lessThan(keyRegion.keyCh1.range.start) ||
                measure.time2.greaterThan(keyRegion.keyCh2.range.start))
                continue*/

            const x1 = Math.floor(Timeline.xAtTime(timeline, measure.time1))
            const x2 = Math.floor(Timeline.xAtTime(timeline, measure.time2))
        
            for (let i = octaveAtBottom; i <= octaveAtTop; i++)
            {
                const y = Math.floor(
                    Timeline.yForRow(timeline, lane, tonicRowOffset + i * 7) + timeline.noteRowH)
                
                if (mainLinePass)
                {
                    const labelX = Math.max(x1 + 5, 5)
                    if (needsOctaveLabels && labelX + 30 < x2)
                    {
                        ctx.fillText(keyRegion.keyCh1.key.tonic.str + (i + 5).toString(), labelX, y - 1)
                        drewOctaveLabels = true
                    }

                    ctx.strokeStyle = "#444"
                    ctx.beginPath()
                    ctx.moveTo(x1, y)
                    ctx.lineTo(x2, y)
                    ctx.moveTo(x1, y + 1)
                    ctx.lineTo(x2, y + 1)
                    ctx.stroke()
                }

                if (!mainLinePass)
                {
                    ctx.strokeStyle = "#fff"
                    ctx.beginPath()
                    for (let j = 1; j < 7; j += 1)
                    {
                        const ySuboctave = Math.floor(
                            Timeline.yForRow(timeline, lane, tonicRowOffset + i * 7 + j) + timeline.noteRowH)
                        
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
    ctx: CanvasRenderingContext2D,
    time: Rational,
    tipOffsetSide: boolean)
{
    const prefs = State.get().prefs

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
    ctx: CanvasRenderingContext2D,
    lane: Timeline.LayoutLane)
{
    if (!timeline.cursor.visible)
        return
    
    const prefs = State.get().prefs

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