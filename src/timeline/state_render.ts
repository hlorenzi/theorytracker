import * as Timeline from "./index"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Playback from "../playback"
import * as Theory from "../theory"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"


export function render(state: Timeline.State, canvas: CanvasRenderingContext2D)
{
    canvas.save()
    
    canvas.fillStyle = Prefs.global.editor.bkgColor
    canvas.fillRect(0, 0, state.renderRect.w, state.renderRect.h)

    const visibleRange = Timeline.visibleTimeRange(state)

    const visibleX1 = Timeline.xAtTime(state, visibleRange.start)
    const visibleX2 = Timeline.xAtTime(state, visibleRange.end)
    const parentX1 = Timeline.xAtTime(state, Project.global.project.range.start)
    const parentX2 = Timeline.xAtTime(state, Project.global.project.range.end)

    canvas.fillStyle = Prefs.global.editor.bkgVoidColor
    canvas.fillRect(visibleX1, 0, parentX1 - visibleX1, state.renderRect.h)
    canvas.fillRect(parentX2, 0, visibleX2 - parentX2, state.renderRect.h)
    
    canvas.save()
    canvas.beginPath()
    canvas.rect(
        state.trackHeaderW,
        0,
        state.renderRect.w - state.trackHeaderW,
        state.renderRect.h)
    canvas.clip()

    renderCursorHighlight(state, canvas)
    renderBackgroundMeasures(state, canvas)

    canvas.restore()
    
    let y = -state.trackScroll
    for (let t = 0; t < state.tracks.length; t++)
    {
        const y2 = y + state.tracks[t].renderRect.h

        if (y >= state.renderRect.h ||
            y + state.tracks[t].renderRect.h <= 0)
        {
            y = y2
            continue
        }

        canvas.save()
        canvas.translate(0, y)

        const hover = !!state.hover && state.hover.id == state.tracks[t].projectTrackId
        const selected = state.selection.has(state.tracks[t].projectTrackId)

        canvas.fillStyle = "#000"
        canvas.strokeStyle = "transparent"
        if (selected)
        {
            canvas.fillStyle = "#222"
            canvas.strokeStyle = "#fff"
        }
        else if (hover)
        {
            canvas.fillStyle = "#000"
            canvas.strokeStyle = "#888"
        }
        
        canvas.beginPath()
        canvas.rect(
            0.5, 1.5,
            state.trackHeaderW - 1,
            state.tracks[t].renderRect.h - 2)
        canvas.fill()
        canvas.stroke()

        renderTrackHeader(state, canvas, t)
        
        canvas.beginPath()
        canvas.rect(
            state.trackHeaderW,
            1,
            state.renderRect.w - state.trackHeaderW,
            state.tracks[t].renderRect.h - 1)
        canvas.clip()

        //canvas.translate(0, -state.tracks[t].yScroll)

        //Editor.renderRectCursorHighlight(state, ctx, t)
        state.tracks[t].render(state, canvas)
        //Editor.renderRectCursorContour(state, ctx, t)

        canvas.restore()

        
        canvas.strokeStyle = Prefs.global.editor.trackHBorderColor
        canvas.beginPath()
        canvas.moveTo(0, y + 0.5)
        canvas.lineTo(state.renderRect.w, y + 0.5)
        canvas.moveTo(0, y2 + 0.5)
        canvas.lineTo(state.renderRect.w, y2 + 0.5)
        canvas.stroke()

        y = y2
    }

    if (state.mouse.down &&
        state.mouse.action == Timeline.MouseAction.DragTrackHeader &&
        state.drag.trackInsertionBefore >= 0)
    {
        canvas.save()

        const y =
            -state.trackScroll +
                (state.tracks.length == 0 ? 0 :
                state.drag.trackInsertionBefore >= state.tracks.length ?
                    state.tracks[state.tracks.length - 1].renderRect.y2 :
                state.tracks[state.drag.trackInsertionBefore].renderRect.y)

        canvas.strokeStyle = Prefs.global.editor.selectionCursorColor
        canvas.lineWidth = 3
        canvas.beginPath()
        canvas.moveTo(0, y + 0.5)
        canvas.lineTo(state.renderRect.w, y + 0.5)
        canvas.stroke()

        canvas.restore()
    }
    
    canvas.save()

    canvas.beginPath()
    canvas.rect(
        state.trackHeaderW,
        0,
        state.renderRect.w - state.trackHeaderW,
        state.renderRect.h)
    canvas.clip()

    if (state.cursor.visible)
    {
        const timeMin = state.cursor.time1.min(state.cursor.time2)!
        const timeMax = state.cursor.time1.max(state.cursor.time2)!
        renderCursorBeam(state, canvas, timeMin, false)
        renderCursorBeam(state, canvas, timeMax, true)
    }
    
    if (Playback.global.playing)
        renderPlaybackBeam(state, canvas, Playback.global.playTime)

    canvas.restore()
    
    canvas.strokeStyle = Prefs.global.editor.trackVBorderColor
    canvas.beginPath()
    canvas.moveTo(state.trackHeaderW + 0.5, 0)
    canvas.lineTo(state.trackHeaderW + 0.5, state.renderRect.h)
    canvas.stroke()

    canvas.restore()
}


function renderBackgroundMeasures(state: Timeline.State, canvas: CanvasRenderingContext2D)
{
    const visibleRange = Timeline.visibleTimeRange(state)
    
    const meterChangeTrackId = Project.meterChangeTrackId(Project.global.project)
    const meterChangeList = Project.global.project.lists.get(meterChangeTrackId)!

    const iter =
        meterChangeList.size > 0 ?
        meterChangeList.iterActiveAtRangePairwise(visibleRange) :
        [
            [null, Project.makeMeterChange(-1, new Rational(0), new Theory.Meter(4, 4))],
            [Project.makeMeterChange(-1, new Rational(0), new Theory.Meter(4, 4)), null]
        ]

    for (const [meterCh1Raw, meterCh2Raw] of iter)
    {
        let timeMin = (meterCh1Raw ? meterCh1Raw.range.start : null)
        let timeMax = (meterCh2Raw ? meterCh2Raw.range.start : visibleRange.end)

        let measureAlternate = true

        let meterCh1 = meterCh1Raw as (Project.MeterChange | null)
        let meterCh2 = meterCh2Raw as (Project.MeterChange | null)

        if (!meterCh1)
        {
            if (!meterCh2)
                continue
            
            meterCh1 = meterCh2
            timeMin = meterCh2.range.start
            while (timeMin.compare(visibleRange.start) > 0)
            {
                timeMin = timeMin.subtract(meterCh2.meter.fullCycleDuration)

                if (meterCh2.meter.alternatingMeasureCount % 2 != 0)
                    measureAlternate = !measureAlternate
            }
        }
        
        const meterCh1X = 0.5 + Math.floor(Timeline.xAtTime(state, timeMin!))
        const meterCh2X = 0.5 + Math.floor(Timeline.xAtTime(state, timeMax))

        canvas.strokeStyle = Prefs.global.editor.meterChangeColor
        canvas.lineCap = "square"
        canvas.lineWidth = 1
        
        for (const [measureN, measureD, time1, time2] of meterCh1.meter.iterMeasuresPairwise(timeMin))
        {
            measureAlternate = !measureAlternate

            if (time2.compare(visibleRange.start) < 0)
                continue

            if (time1.compare(timeMax) > 0 || time1.compare(visibleRange.end) > 0)
                break

            const measureX1 = 0.5 + Math.floor(Timeline.xAtTime(state, time1))
            const measureX2 = 0.5 + Math.floor(Timeline.xAtTime(state, time2))

            if (true)//measureAlternate)
            {
                const x1 = Math.min(meterCh2X, measureX1)
                const x2 = Math.min(meterCh2X, measureX2)
                
                canvas.fillStyle = Prefs.global.editor.measureAlternateBkgColor
                canvas.fillRect(x1, 0, x2 - x1, state.renderRect.h)
            }

            if (time1.compare(meterCh1.range.start) == 0)
                canvas.strokeStyle = Prefs.global.editor.meterChangeColor
            else
                canvas.strokeStyle = Prefs.global.editor.measureColor

            canvas.beginPath()
            canvas.moveTo(measureX1, 0)
            canvas.lineTo(measureX1, state.renderRect.h)
            canvas.stroke()

            const halfSubmeasureSize = Timeline.xAtTime(state, new Rational(1, measureD * 2)) - Timeline.xAtTime(state, new Rational(0))
            if (halfSubmeasureSize > 16)
            {
                let halfSubmeasureTime = time1.add(new Rational(-1, measureD * 2))
                for (let sub = 1; sub <= measureN; sub++)
                {
                    halfSubmeasureTime = halfSubmeasureTime.add(new Rational(2, measureD * 2))
                    
                    const halfSubmeasureX = 0.5 + Math.floor(Timeline.xAtTime(state, halfSubmeasureTime))
                    if (halfSubmeasureX >= meterCh1X && halfSubmeasureX <= meterCh2X)
                    {
                        canvas.strokeStyle = Prefs.global.editor.halfSubmeasureColor
                        canvas.beginPath()
                        canvas.moveTo(halfSubmeasureX, 0)
                        canvas.lineTo(halfSubmeasureX, state.renderRect.h)
                        canvas.stroke()
                    }
                }
            }
            
            const submeasureSize = Timeline.xAtTime(state, new Rational(1, measureD)) - Timeline.xAtTime(state, new Rational(0))
            if (submeasureSize > 8)
            {
                let submeasureTime = time1
                for (let sub = 1; sub <= measureN; sub++)
                {
                    submeasureTime = submeasureTime.add(new Rational(1, measureD))
                    
                    const submeasureX = 0.5 + Math.floor(Timeline.xAtTime(state, submeasureTime))
                    if (submeasureX >= meterCh1X && submeasureX <= meterCh2X)
                    {
                        canvas.strokeStyle = Prefs.global.editor.submeasureColor
                        canvas.beginPath()
                        canvas.moveTo(submeasureX, 0)
                        canvas.lineTo(submeasureX, state.renderRect.h)
                        canvas.stroke()
                    }
                }
            }
        }
    }
    
    const keyChangeTrackId = Project.keyChangeTrackId(Project.global.project)
    const keyChangeList = Project.global.project.lists.get(keyChangeTrackId)
    if (keyChangeList)
    {
        for (const keyCh of keyChangeList.iterAtRange(visibleRange))
        {
            const keyChX = 0.5 + Math.floor(Timeline.xAtTime(state, keyCh.range.start))
            
            canvas.strokeStyle = Prefs.global.editor.keyChangeColor
            canvas.lineCap = "square"
            canvas.lineWidth = 1
            
            canvas.beginPath()
            canvas.moveTo(keyChX, 0)
            canvas.lineTo(keyChX, state.renderRect.h)
            canvas.stroke()
        }
    }
}
	
	
function renderCursorHighlight(state: Timeline.State, canvas: CanvasRenderingContext2D)
{
    if (!state.cursor.visible)
        return
    
    const timeMin = state.cursor.time1.min(state.cursor.time2)!
    const timeMax = state.cursor.time1.max(state.cursor.time2)!
    const trackMin = Math.min(state.cursor.trackIndex1, state.cursor.trackIndex2)
    const trackMax = Math.max(state.cursor.trackIndex1, state.cursor.trackIndex2)
    
    if (trackMin < 0 || trackMax < 0 ||
        trackMin >= state.tracks.length ||
        trackMax >= state.tracks.length)
        return
    
        const y1 = 0.5 + Math.floor(Timeline.trackY(state, trackMin))
    const y2 = 0.5 + Math.floor(Timeline.trackY(state, trackMax) + state.tracks[trackMax].renderRect.h)
    
    const x1 = Timeline.xAtTime(state, timeMin)
    const x2 = Timeline.xAtTime(state, timeMax)
    
    canvas.fillStyle = Prefs.global.editor.selectionBkgColor
    canvas.fillRect(x1, y1, x2 - x1, y2 - y1)
}


function renderCursorBeam(
    state: Timeline.State,
    canvas: CanvasRenderingContext2D,
    time: Rational,
    tipOffsetSide: boolean)
{
    const trackMin = Math.min(state.cursor.trackIndex1, state.cursor.trackIndex2)
    const trackMax = Math.max(state.cursor.trackIndex1, state.cursor.trackIndex2)
    
    if (trackMin < 0 || trackMax < 0 ||
        trackMin >= state.tracks.length ||
        trackMax >= state.tracks.length)
        return
    
    const x = 0.5 + Math.floor(Timeline.xAtTime(state, time))
    
    canvas.strokeStyle = Prefs.global.editor.selectionCursorColor
    canvas.fillStyle = Prefs.global.editor.selectionCursorColor
    canvas.lineCap = "square"
    canvas.lineWidth = 1
    
    const headYSize = 7
    const headXSize = headYSize * (tipOffsetSide ? -1 : 1)

    const y1 = 0.5 + Math.floor(Timeline.trackY(state, trackMin))
    const y2 = 0.5 + Math.floor(Timeline.trackY(state, trackMax) + state.tracks[trackMax].renderRect.h)
    
    canvas.beginPath()
    canvas.moveTo(x,             y1 + headYSize)
    canvas.lineTo(x + headXSize, y1)
    canvas.lineTo(x,             y1)
    canvas.fill()

    canvas.beginPath()
    canvas.moveTo(x,             y2 - headYSize)
    canvas.lineTo(x + headXSize, y2)
    canvas.lineTo(x,             y2)
    canvas.fill()

    canvas.beginPath()
    canvas.moveTo(x, y1)
    canvas.lineTo(x, y2)
    canvas.stroke()
}
	
	
function renderPlaybackBeam(
    state: Timeline.State,
    canvas: CanvasRenderingContext2D,
    time: Rational)
{
    const x = 0.5 + Math.floor(Timeline.xAtTime(state, time))
    
    canvas.strokeStyle = Prefs.global.editor.playbackCursorColor
    canvas.lineCap = "square"
    canvas.lineWidth = 1
    
    canvas.beginPath()
    canvas.lineTo(x, 0)
    canvas.lineTo(x, state.renderRect.h)
    canvas.stroke()
}


function renderTrackHeader(
    state: Timeline.State,
    canvas: CanvasRenderingContext2D,
    trackIndex: number)
{
    const track = state.tracks[trackIndex]
    const projTrack = Project.getElem(Project.global.project, track.projectTrackId, "track")
    if (!projTrack)
        return


    if ((track instanceof Timeline.TimelineTrackNoteBlocks ||
        track instanceof Timeline.TimelineTrackNotes ||
        track instanceof Timeline.TimelineTrackChords) &&
        (projTrack.trackType == "notes" ||
        projTrack.trackType == "chords"))
    {
        canvas.fillStyle = "#fff"
        canvas.textAlign = "left"
        canvas.textBaseline = "top"
        canvas.font = "10px system-ui"
    
        const displayName = Project.trackDisplayName(projTrack)
        canvas.fillText(displayName, 10, 8, state.trackHeaderW - 20)

        renderControlDial(state, canvas, 0,
            (v) => (v >= 0 ? "+" : "") + v.toFixed(1) + " dB",
            projTrack.volumeDb, Project.MinVolumeDb, Project.MaxVolumeDb)

        renderControlIcon(state, canvas, 7, "🔇", projTrack.mute)
        renderControlIcon(state, canvas, 8, "🎚️", projTrack.solo)
    }
    else
    {
        canvas.fillStyle = "#fff"
        canvas.textAlign = "left"
        canvas.textBaseline = "top"
        canvas.font = "14px system-ui"
    
        canvas.fillText(track.name, 10, 8, state.trackHeaderW - 20)
    }    
}


function renderControlDial(
    state: Timeline.State,
    canvas: CanvasRenderingContext2D,
    xSlot: number,
    labelFn: (value: number) => string,
    value: number,
    minValue: number,
    maxValue: number)
{
    const x = state.trackControlX + state.trackControlSize * xSlot
    const y = state.trackControlY
    const size = state.trackControlSize

    const factor = (value - minValue) / (maxValue - minValue)

    canvas.fillStyle = "#888"
    canvas.fillRect(
        x, y,
        5, size)
    
    canvas.fillStyle = "#0f0"
    canvas.fillRect(
        x, y + size - factor * size,
        5, factor * size)

    canvas.fillStyle = "#fff"
    canvas.textAlign = "left"
    canvas.textBaseline = "middle"
    canvas.font = (size * 0.5) + "px system-ui"

    //canvas.fillText(label, x + 5 + (size - 5) / 2, y + (size / 4))
    canvas.fillText(
        labelFn(value),
        x + 10,
        y + (size / 2),
        size * 3 - 10)
}


function renderControlIcon(
    state: Timeline.State,
    canvas: CanvasRenderingContext2D,
    xSlot: number,
    icon: string,
    enabled: boolean)
{
    const x = state.trackControlX + state.trackControlSize * xSlot
    const y = state.trackControlY
    const size = state.trackControlSize

    canvas.fillStyle = enabled ? "#fff" : "#fff4"
    canvas.textAlign = "center"
    canvas.textBaseline = "middle"
    canvas.font = (size * 0.8) + "px system-ui"

    canvas.fillText(icon, x + size / 2, y + size / 2)
}