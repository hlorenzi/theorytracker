import * as Editor from "./index"
import * as Project from "../project"
import * as Theory from "../theory"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"


export function render(data: Editor.EditorUpdateData)
{
    data.ctx.save()
    
    data.ctx.fillStyle = data.prefs.editor.bkgColor
    data.ctx.fillRect(0, 0, data.state.renderRect.w, data.state.renderRect.h)

    const visibleRange = Editor.visibleTimeRange(data)

    const visibleX1 = Editor.xAtTime(data, visibleRange.start)
    const visibleX2 = Editor.xAtTime(data, visibleRange.end)
    const parentX1 = Editor.xAtTime(data, data.project.range.start)
    const parentX2 = Editor.xAtTime(data, data.project.range.end)

    data.ctx.fillStyle = data.prefs.editor.bkgVoidColor
    data.ctx.fillRect(visibleX1, 0, parentX1 - visibleX1, data.state.renderRect.h)
    data.ctx.fillRect(parentX2, 0, visibleX2 - parentX2, data.state.renderRect.h)
    
    data.ctx.save()
    data.ctx.beginPath()
    data.ctx.rect(
        data.state.trackHeaderW,
        0,
        data.state.renderRect.w - data.state.trackHeaderW,
        data.state.renderRect.h)
    data.ctx.clip()

    renderCursorHighlight(data)
    renderBackgroundMeasures(data)

    data.ctx.restore()
    
    let y = -data.state.trackScroll
    for (let t = 0; t < data.state.tracks.length; t++)
    {
        const y2 = y + data.state.tracks[t].renderRect.h

        if (y >= data.state.renderRect.h ||
            y + data.state.tracks[t].renderRect.h <= 0)
        {
            y = y2
            continue
        }

        data.ctx.save()
        data.ctx.translate(0, y)

        const hover = !!data.state.hover && data.state.hover.id == data.state.tracks[t].projectTrackId
        const selected = data.state.selection.has(data.state.tracks[t].projectTrackId)

        data.ctx.fillStyle = "#000"
        data.ctx.strokeStyle = "transparent"
        if (selected)
        {
            data.ctx.fillStyle = "#222"
            data.ctx.strokeStyle = "#fff"
        }
        else if (hover)
        {
            data.ctx.fillStyle = "#000"
            data.ctx.strokeStyle = "#888"
        }
        
        data.ctx.beginPath()
        data.ctx.rect(
            0.5, 1.5,
            data.state.trackHeaderW - 1,
            data.state.tracks[t].renderRect.h - 2)
        data.ctx.fill()
        data.ctx.stroke()

        renderTrackHeader(
            data,
            t)
        
        data.ctx.beginPath()
        data.ctx.rect(
            data.state.trackHeaderW,
            1,
            data.state.renderRect.w - data.state.trackHeaderW,
            data.state.tracks[t].renderRect.h - 1)
        data.ctx.clip()

        //data.ctx.translate(0, -data.state.tracks[t].yScroll)

        //Editor.renderRectCursorHighlight(state, ctx, t)
        data.state.tracks[t].render(data)
        //Editor.renderRectCursorContour(state, ctx, t)

        data.ctx.restore()

        
        data.ctx.strokeStyle = data.prefs.editor.trackHBorderColor
        data.ctx.beginPath()
        data.ctx.moveTo(0, y + 0.5)
        data.ctx.lineTo(data.state.renderRect.w, y + 0.5)
        data.ctx.moveTo(0, y2 + 0.5)
        data.ctx.lineTo(data.state.renderRect.w, y2 + 0.5)
        data.ctx.stroke()

        y = y2
    }

    if (data.state.mouse.down &&
        data.state.mouse.action == Editor.EditorAction.DragTrackHeader &&
        data.state.drag.trackInsertionBefore >= 0)
    {
        data.ctx.save()

        const y =
            -data.state.trackScroll +
                (data.state.tracks.length == 0 ? 0 :
                data.state.drag.trackInsertionBefore >= data.state.tracks.length ?
                    data.state.tracks[data.state.tracks.length - 1].renderRect.y2 :
                data.state.tracks[data.state.drag.trackInsertionBefore].renderRect.y)

        data.ctx.strokeStyle = data.prefs.editor.selectionCursorColor
        data.ctx.lineWidth = 3
        data.ctx.beginPath()
        data.ctx.moveTo(0, y + 0.5)
        data.ctx.lineTo(data.state.renderRect.w, y + 0.5)
        data.ctx.stroke()

        data.ctx.restore()
    }
    
    data.ctx.save()

    data.ctx.beginPath()
    data.ctx.rect(
        data.state.trackHeaderW,
        0,
        data.state.renderRect.w - data.state.trackHeaderW,
        data.state.renderRect.h)
    data.ctx.clip()

    if (data.state.cursor.visible)
    {
        const timeMin = data.state.cursor.time1.min(data.state.cursor.time2)!
        const timeMax = data.state.cursor.time1.max(data.state.cursor.time2)!
        renderCursorBeam(data, timeMin, false)
        renderCursorBeam(data, timeMax, true)
    }
    
    if (data.playback.playing)
        renderPlaybackBeam(data, data.playback.playTime)

    data.ctx.restore()
    
    data.ctx.strokeStyle = data.prefs.editor.trackVBorderColor
    data.ctx.beginPath()
    data.ctx.moveTo(data.state.trackHeaderW + 0.5, 0)
    data.ctx.lineTo(data.state.trackHeaderW + 0.5, data.state.renderRect.h)
    data.ctx.stroke()

    data.ctx.restore()
}


function renderBackgroundMeasures(data: Editor.EditorUpdateData)
{
    const visibleRange = Editor.visibleTimeRange(data)
    
    const meterChangeTrackId = Project.meterChangeTrackId(data.project)
    const meterChangeList = data.project.lists.get(meterChangeTrackId)!

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
        
        const meterCh1X = 0.5 + Math.floor(Editor.xAtTime(data, timeMin!))
        const meterCh2X = 0.5 + Math.floor(Editor.xAtTime(data, timeMax))

        data.ctx.strokeStyle = data.prefs.editor.meterChangeColor
        data.ctx.lineCap = "square"
        data.ctx.lineWidth = 1
        
        for (const [measureN, measureD, time1, time2] of meterCh1.meter.iterMeasuresPairwise(timeMin))
        {
            measureAlternate = !measureAlternate

            if (time2.compare(visibleRange.start) < 0)
                continue

            if (time1.compare(timeMax) > 0 || time1.compare(visibleRange.end) > 0)
                break

            const measureX1 = 0.5 + Math.floor(Editor.xAtTime(data, time1))
            const measureX2 = 0.5 + Math.floor(Editor.xAtTime(data, time2))

            if (true)//measureAlternate)
            {
                const x1 = Math.min(meterCh2X, measureX1)
                const x2 = Math.min(meterCh2X, measureX2)
                
                data.ctx.fillStyle = data.prefs.editor.measureAlternateBkgColor
                data.ctx.fillRect(x1, 0, x2 - x1, data.state.renderRect.h)
            }

            if (time1.compare(meterCh1.range.start) == 0)
                data.ctx.strokeStyle = data.prefs.editor.meterChangeColor
            else
                data.ctx.strokeStyle = data.prefs.editor.measureColor

            data.ctx.beginPath()
            data.ctx.moveTo(measureX1, 0)
            data.ctx.lineTo(measureX1, data.state.renderRect.h)
            data.ctx.stroke()

            const halfSubmeasureSize = Editor.xAtTime(data, new Rational(1, measureD * 2)) - Editor.xAtTime(data, new Rational(0))
            if (halfSubmeasureSize > 16)
            {
                let halfSubmeasureTime = time1.add(new Rational(-1, measureD * 2))
                for (let sub = 1; sub <= measureN; sub++)
                {
                    halfSubmeasureTime = halfSubmeasureTime.add(new Rational(2, measureD * 2))
                    
                    const halfSubmeasureX = 0.5 + Math.floor(Editor.xAtTime(data, halfSubmeasureTime))
                    if (halfSubmeasureX >= meterCh1X && halfSubmeasureX <= meterCh2X)
                    {
                        data.ctx.strokeStyle = data.prefs.editor.halfSubmeasureColor
                        data.ctx.beginPath()
                        data.ctx.moveTo(halfSubmeasureX, 0)
                        data.ctx.lineTo(halfSubmeasureX, data.state.renderRect.h)
                        data.ctx.stroke()
                    }
                }
            }
            
            const submeasureSize = Editor.xAtTime(data, new Rational(1, measureD)) - Editor.xAtTime(data, new Rational(0))
            if (submeasureSize > 8)
            {
                let submeasureTime = time1
                for (let sub = 1; sub <= measureN; sub++)
                {
                    submeasureTime = submeasureTime.add(new Rational(1, measureD))
                    
                    const submeasureX = 0.5 + Math.floor(Editor.xAtTime(data, submeasureTime))
                    if (submeasureX >= meterCh1X && submeasureX <= meterCh2X)
                    {
                        data.ctx.strokeStyle = data.prefs.editor.submeasureColor
                        data.ctx.beginPath()
                        data.ctx.moveTo(submeasureX, 0)
                        data.ctx.lineTo(submeasureX, data.state.renderRect.h)
                        data.ctx.stroke()
                    }
                }
            }
        }
    }
    
    const keyChangeTrackId = Project.keyChangeTrackId(data.project)
    const keyChangeList = data.project.lists.get(keyChangeTrackId)!

    for (const keyCh of keyChangeList.iterAtRange(visibleRange))
    {
        const keyChX = 0.5 + Math.floor(Editor.xAtTime(data, keyCh.range.start))
        
        data.ctx.strokeStyle = data.prefs.editor.keyChangeColor
        data.ctx.lineCap = "square"
        data.ctx.lineWidth = 1
        
        data.ctx.beginPath()
        data.ctx.moveTo(keyChX, 0)
        data.ctx.lineTo(keyChX, data.state.renderRect.h)
        data.ctx.stroke()
    }
}
	
	
function renderCursorHighlight(data: Editor.EditorUpdateData)
{
    if (!data.state.cursor.visible)
        return
    
    const timeMin = data.state.cursor.time1.min(data.state.cursor.time2)!
    const timeMax = data.state.cursor.time1.max(data.state.cursor.time2)!
    const trackMin = Math.min(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    const trackMax = Math.max(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    
    if (trackMin < 0 || trackMax < 0 ||
        trackMin >= data.state.tracks.length ||
        trackMax >= data.state.tracks.length)
        return
    
        const y1 = 0.5 + Math.floor(Editor.trackY(data, trackMin))
    const y2 = 0.5 + Math.floor(Editor.trackY(data, trackMax) + data.state.tracks[trackMax].renderRect.h)
    
    const x1 = Editor.xAtTime(data, timeMin)
    const x2 = Editor.xAtTime(data, timeMax)
    
    data.ctx.fillStyle = data.prefs.editor.selectionBkgColor
    data.ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
}


function renderCursorBeam(data: Editor.EditorUpdateData, time: Rational, tipOffsetSide: boolean)
{
    const trackMin = Math.min(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    const trackMax = Math.max(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    
    if (trackMin < 0 || trackMax < 0 ||
        trackMin >= data.state.tracks.length ||
        trackMax >= data.state.tracks.length)
        return
    
    const x = 0.5 + Math.floor(Editor.xAtTime(data, time))
    
    data.ctx.strokeStyle = data.prefs.editor.selectionCursorColor
    data.ctx.fillStyle = data.prefs.editor.selectionCursorColor
    data.ctx.lineCap = "square"
    data.ctx.lineWidth = 1
    
    const headYSize = 7
    const headXSize = headYSize * (tipOffsetSide ? -1 : 1)

    const y1 = 0.5 + Math.floor(Editor.trackY(data, trackMin))
    const y2 = 0.5 + Math.floor(Editor.trackY(data, trackMax) + data.state.tracks[trackMax].renderRect.h)
    
    data.ctx.beginPath()
    data.ctx.moveTo(x,             y1 + headYSize)
    data.ctx.lineTo(x + headXSize, y1)
    data.ctx.lineTo(x,             y1)
    data.ctx.fill()

    data.ctx.beginPath()
    data.ctx.moveTo(x,             y2 - headYSize)
    data.ctx.lineTo(x + headXSize, y2)
    data.ctx.lineTo(x,             y2)
    data.ctx.fill()

    data.ctx.beginPath()
    data.ctx.moveTo(x, y1)
    data.ctx.lineTo(x, y2)
    data.ctx.stroke()
}
	
	
function renderPlaybackBeam(data: Editor.EditorUpdateData, time: Rational)
{
    const x = 0.5 + Math.floor(Editor.xAtTime(data, time))
    
    data.ctx.strokeStyle = data.prefs.editor.playbackCursorColor
    data.ctx.lineCap = "square"
    data.ctx.lineWidth = 1
    
    data.ctx.beginPath()
    data.ctx.lineTo(x, 0)
    data.ctx.lineTo(x, data.state.renderRect.h)
    data.ctx.stroke()
}


function renderTrackHeader(data: Editor.EditorUpdateData, trackIndex: number)
{
    const track = data.state.tracks[trackIndex]
    const projTrack = Project.getElem(data.project, track.projectTrackId, "track")
    if (!projTrack)
        return


    if ((track instanceof Editor.EditorTrackNoteBlocks ||
        track instanceof Editor.EditorTrackNotes) &&
        projTrack.trackType == "notes")
    {
        data.ctx.fillStyle = "#fff"
        data.ctx.textAlign = "left"
        data.ctx.textBaseline = "top"
        data.ctx.font = "10px system-ui"
    
        const displayName = Project.trackDisplayName(projTrack)
        data.ctx.fillText(displayName, 10, 8, data.state.trackHeaderW - 20)

        renderControlDial(data, 0, "Vol", projTrack.volume)
        renderControlIcon(data, 7, "🔊", !projTrack.mute)
        renderControlIcon(data, 8, "🎚️", projTrack.solo)
    }
    else
    {
        data.ctx.fillStyle = "#fff"
        data.ctx.textAlign = "left"
        data.ctx.textBaseline = "top"
        data.ctx.font = "14px system-ui"
    
        data.ctx.fillText(track.name, 10, 8, data.state.trackHeaderW - 20)
    }    
}


function renderControlDial(
    data: Editor.EditorUpdateData,
    xSlot: number,
    label: string,
    value: number)
{
    const x = data.state.trackControlX + data.state.trackControlSize * xSlot
    const y = data.state.trackControlY
    const size = data.state.trackControlSize

    const factor = value

    data.ctx.fillStyle = "#888"
    data.ctx.fillRect(
        x, y,
        5, size)
    
    data.ctx.fillStyle = "#0f0"
    data.ctx.fillRect(
        x, y + size - factor * size,
        5, factor * size)

    data.ctx.fillStyle = "#fff"
    data.ctx.textAlign = "center"
    data.ctx.textBaseline = "middle"
    data.ctx.font = (size * 0.4) + "px system-ui"

    data.ctx.fillText(label, x + 5 + (size - 5) / 2, y + (size / 4))
    data.ctx.fillText(Math.floor(value * 100).toString(), x + 5 + (size - 5) / 2, y + (size / 4 * 3))
}


function renderControlIcon(
    data: Editor.EditorUpdateData,
    xSlot: number,
    icon: string,
    enabled: boolean)
{
    const x = data.state.trackControlX + data.state.trackControlSize * xSlot
    const y = data.state.trackControlY
    const size = data.state.trackControlSize

    data.ctx.fillStyle = enabled ? "#fff" : "#fff4"
    data.ctx.textAlign = "center"
    data.ctx.textBaseline = "middle"
    data.ctx.font = (size * 0.8) + "px system-ui"

    data.ctx.fillText(icon, x + size / 2, y + size / 2)
}