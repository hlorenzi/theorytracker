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

    canvas.save()
    canvas.beginPath()
    canvas.rect(
        state.trackHeaderW,
        0,
        state.renderRect.w - state.trackHeaderW,
        state.renderRect.h)
    canvas.clip()

    renderBackground(state, canvas)
    renderCursorHighlight(state, canvas)

    canvas.restore()
    
    // clip inverse of top measure track
    canvas.save()
    canvas.beginPath()
    canvas.rect(
        0, state.trackMeasuresH,
        state.renderRect.w,
        state.renderRect.h)
    canvas.clip()
    
    let y = -state.trackScroll + state.tracks[0].renderRect.y
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
        
        const clipY1 = 1 + Math.max(0, state.trackMeasuresH - y)
        const clipY2 = state.tracks[t].renderRect.h

        canvas.beginPath()
        canvas.rect(
            state.trackHeaderW,
            clipY1,
            state.renderRect.w - state.trackHeaderW,
            clipY2 - clipY1)
        canvas.clip()

        //canvas.translate(0, -state.tracks[t].yScroll)

        renderRectSelectHighlight(state, canvas, t)
        state.tracks[t].render(state, canvas)
        renderRectSelectContour(state, canvas, t)

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

    renderMeasuresTrack(state, canvas)

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
    canvas.restore()
}


function renderTracksByFn(
    state: Timeline.State,
    canvas: CanvasRenderingContext2D,
    fn: (track: Timeline.TimelineTrack) => void)
{
    let y = -state.trackScroll + state.tracks[0].renderRect.y
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

        const clipY1 = 1 + Math.max(0, state.trackMeasuresH - y)
        const clipY2 = state.tracks[t].renderRect.h

        canvas.beginPath()
        canvas.rect(
            state.trackHeaderW,
            clipY1,
            state.renderRect.w - state.trackHeaderW,
            clipY2 - clipY1)
        canvas.clip()

        fn(state.tracks[t])

        canvas.restore()

        y = y2
    }
}


function renderBackground(state: Timeline.State, canvas: CanvasRenderingContext2D)
{
    const visibleRange = Timeline.visibleTimeRange(state)

    // Render alternating measure background and sub-measure dividers.
    for (const measure of Project.iterMeasuresAtRange(Project.global.project, visibleRange))
    {
        const x1 = 0.5 + Math.floor(Timeline.xAtTime(state, measure.time1))
        const x2 = 0.5 + Math.floor(Timeline.xAtTime(state, measure.time2))

        if (measure.num % 2 != 0)
        {
            canvas.fillStyle = Prefs.global.editor.bkgAlternateMeasureColor
            canvas.fillRect(x1, 0, x2 - x1, state.renderRect.h)
        }

        const submeasureSize =
            Timeline.xAtTime(state, new Rational(1, measure.meterCh.meter.denominator)) -
            Timeline.xAtTime(state, new Rational(0))

        if (submeasureSize > 8)
        {
            canvas.strokeStyle = measure.num % 2 != 0 ?
                Prefs.global.editor.bkgColor :
                Prefs.global.editor.bkgAlternateMeasureColor

            for (let n = 1; n < measure.meterCh.meter.numerator; n++)
            {
                const submeasureX = x1 + Math.round(submeasureSize * n)
                if (submeasureX >= x2)
                    break

                canvas.beginPath()
                canvas.moveTo(submeasureX, 0)
                canvas.lineTo(submeasureX, state.renderRect.h)
                canvas.stroke()
            }
        }
    }

    // Render track-specific background, such as note row dividers.
    renderTracksByFn(state, canvas, (tr) => tr.renderBackground(state, canvas))

    // Render dark overlay for areas beyond current active range.
    let activeRange: Range | null = null
    for (const track of state.tracks)
        activeRange = Range.intersect(activeRange, track.getActiveRange(state))

    if (!activeRange)
        activeRange = Project.global.project.range

    const visibleX1 = Timeline.xAtTime(state, visibleRange.start)
    const visibleX2 = Timeline.xAtTime(state, visibleRange.end)
    const activeX1 = Timeline.xAtTime(state, activeRange.start)
    const activeX2 = Timeline.xAtTime(state, activeRange.end)
    
    canvas.fillStyle = Prefs.global.editor.bkgInactiveOverlayColor
    canvas.fillRect(visibleX1, 0, activeX1 - visibleX1, state.renderRect.h)
    canvas.fillRect(activeX2, 0, visibleX2 - activeX2, state.renderRect.h)
    
    // Render numbering for measures at the topmost track.
    let suppressLabelUntilX = 0
    for (const measure of Project.iterMeasuresAtRange(Project.global.project, visibleRange))
    {
        const x1 = 0.5 + Math.floor(Timeline.xAtTime(state, measure.time1))
        const x2 = 0.5 + Math.floor(Timeline.xAtTime(state, measure.time2))

        if (x1 > suppressLabelUntilX)
        {
            canvas.fillStyle = Prefs.global.editor.measureLabelColor
            canvas.font = Math.floor(state.trackMeasuresH - 6) + "px system-ui"
            canvas.textAlign = "left"
            canvas.textBaseline = "middle"
            canvas.fillText(measure.num.toString(), x1 + 5, state.trackMeasuresH / 2 + 1.5)

            suppressLabelUntilX = x1 + 40
        }
    }
    
    // Render meter change dividers.
    const meterChangeTrackId = Project.meterChangeTrackId(Project.global.project)
    const meterChangeList = Project.global.project.lists.get(meterChangeTrackId)
    if (meterChangeList)
    {
        canvas.strokeStyle = Prefs.global.editor.meterChangeColor
        canvas.lineCap = "square"
        canvas.lineWidth = 1
        
        for (const keyCh of meterChangeList.iterAtRange(visibleRange))
        {
            const keyChX = 0.5 + Math.floor(Timeline.xAtTime(state, keyCh.range.start))
            
            canvas.beginPath()
            canvas.moveTo(keyChX, 0)
            canvas.lineTo(keyChX, state.renderRect.h)
            canvas.stroke()
        }
    }
    
    // Render key change dividers.
    const keyChangeTrackId = Project.keyChangeTrackId(Project.global.project)
    const keyChangeList = Project.global.project.lists.get(keyChangeTrackId)
    if (keyChangeList)
    {
        canvas.strokeStyle = Prefs.global.editor.keyChangeColor
        canvas.lineCap = "square"
        canvas.lineWidth = 1
        
        for (const keyCh of keyChangeList.iterAtRange(visibleRange))
        {
            const keyChX = 0.5 + Math.floor(Timeline.xAtTime(state, keyCh.range.start))
            
            canvas.beginPath()
            canvas.moveTo(keyChX, 0)
            canvas.lineTo(keyChX, state.renderRect.h)
            canvas.stroke()
        }
    }
}


function renderMeasuresTrack(state: Timeline.State, canvas: CanvasRenderingContext2D)
{
    const y1 = 0
    const y2 = state.trackMeasuresH

    canvas.save()

    canvas.fillStyle = Prefs.global.editor.bkgColor

    canvas.beginPath()
    canvas.rect(
        0.5, 1.5,
        state.trackHeaderW - 1,
        state.trackMeasuresH - 2)
    canvas.fill()

    canvas.beginPath()
    canvas.rect(
        state.trackHeaderW,
        1,
        state.renderRect.w - state.trackHeaderW,
        state.trackMeasuresH)
    canvas.clip()

    canvas.restore()

    canvas.strokeStyle = Prefs.global.editor.trackHBorderColor
    canvas.beginPath()
    canvas.moveTo(0, y1 + 0.5)
    canvas.lineTo(state.renderRect.w, y1 + 0.5)
    canvas.moveTo(0, y2 + 0.5)
    canvas.lineTo(state.renderRect.w, y2 + 0.5)
    canvas.stroke()
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
	
	
function renderRectSelectHighlight(
    state: Timeline.State,
    canvas: CanvasRenderingContext2D,
    trackIndex: number)
{
    if (state.mouse.action !== Timeline.MouseAction.SelectRect ||
        state.cursor.trackIndex1 !== trackIndex)
        return
    
    const timeMin = state.cursor.time1.min(state.cursor.time2)!
    const timeMax = state.cursor.time1.max(state.cursor.time2)!
    const trackMin = Math.min(state.cursor.trackIndex1, state.cursor.trackIndex2)
    const trackMax = Math.max(state.cursor.trackIndex1, state.cursor.trackIndex2)
    const y1 = 0.5 + Math.floor(Math.min(state.cursor.rectY1, state.cursor.rectY2))
    const y2 = 0.5 + Math.floor(Math.max(state.cursor.rectY1, state.cursor.rectY2))
    
    if (trackMin < 0 || trackMax < 0 ||
        trackMin >= state.tracks.length ||
        trackMax >= state.tracks.length)
        return
    
    const x1 = 0.5 + Math.floor(Timeline.xAtTime(state, timeMin))
    const x2 = 0.5 + Math.floor(Timeline.xAtTime(state, timeMax))
    
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


function renderRectSelectContour(
    state: Timeline.State,
    canvas: CanvasRenderingContext2D,
    trackIndex: number)
{
    if (state.mouse.action !== Timeline.MouseAction.SelectRect ||
        state.cursor.trackIndex1 !== trackIndex)
        return
    
    const timeMin = state.cursor.time1.min(state.cursor.time2)!
    const timeMax = state.cursor.time1.max(state.cursor.time2)!
    const trackMin = Math.min(state.cursor.trackIndex1, state.cursor.trackIndex2)
    const trackMax = Math.max(state.cursor.trackIndex1, state.cursor.trackIndex2)
    const y1 = 0.5 + Math.floor(Math.min(state.cursor.rectY1, state.cursor.rectY2))
    const y2 = 0.5 + Math.floor(Math.max(state.cursor.rectY1, state.cursor.rectY2))
    
    if (trackMin < 0 || trackMax < 0 ||
        trackMin >= state.tracks.length ||
        trackMax >= state.tracks.length)
        return
    
    const x1 = 0.5 + Math.floor(Timeline.xAtTime(state, timeMin))
    const x2 = 0.5 + Math.floor(Timeline.xAtTime(state, timeMax))
    
    canvas.strokeStyle = Prefs.global.editor.selectionCursorColor
    canvas.strokeRect(x1, y1, x2 - x1, y2 - y1)
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