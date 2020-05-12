import Editor from "./editor"
import Track from "./track"
import TrackStateManager from "./trackStateManager"
import TrackNotesPreviewState from "./trackNotesPreviewState"
import Rect from "../util/rect"
import Range from "../util/range"
import Project from "../project/project2"
import Rational from "../util/rational"
import CanvasUtils from "../util/canvasUtils"
import * as Theory from "../theory/theory"


type UpdateHoverInput =
{
    mouse:
    {
        pos: { x: number, y: number }
    }
}


export default class TrackNotesPreview
{
    static init(state: TrackStateManager<TrackNotesPreviewState>)
    {
        Track.init(state)
        state.mergeTrackState({
            type: "notesPreview",
            rowScale: 10,
        })
    }
	
	
	static updateHover(state: TrackStateManager<TrackNotesPreviewState>, input: UpdateHoverInput)
	{
        const margin = 10
        const checkRange = Editor.timeRangeAtX(
            state.contentStateManager,
            input.mouse.pos.x - margin,
            input.mouse.pos.x + margin)
        
        let hoverPrimary = null
        let hoverSecondary = null

        const key = Theory.Key.parse("C Major")

        for (const [note, keyCh, xMin, xMax] of TrackNotesPreview.iterNotesAndKeyChangesAtRange(state, checkRange))
        {
            const margin = 2

            const row = TrackNotesPreview.rowForPitch(state, note.pitch, key)
            const rectExact = TrackNotesPreview.rectForNote(state, note.range, row, xMin, xMax)
            const rect = new Rect(
                rectExact.x - margin,
                rectExact.y,
                rectExact.w + margin * 2,
                rectExact.h)

            const dragMarginOut = Math.abs(Math.min(0, rect.w - 16))
            const stretchMarginOut = 16
            const stretchMarginIn = Math.max(0, Math.min(10, rect.w / 4))
            const rectDrag = new Rect(rect.x - dragMarginOut, rect.y, rect.w + dragMarginOut * 2, rect.h)
            const rectStretchStart = new Rect(rect.x - stretchMarginOut, rect.y, stretchMarginOut + stretchMarginIn, rect.h)
            const rectStretchEnd = new Rect(rect.x2 - stretchMarginIn, rect.y, stretchMarginOut + stretchMarginIn, rect.h)
            
            const exactHover = rect.contains(input.mouse.pos)

            let action = 0
            if (dragMarginOut > 0 && rectDrag.contains(input.mouse.pos))
                action = Editor.actionDragTime | Editor.actionDragPitchRow
            else if (rectStretchStart.contains(input.mouse.pos) && !rectExact.cutStart)
                action = Editor.actionStretchTimeStart
            else if (rectStretchEnd.contains(input.mouse.pos) && !rectExact.cutEnd)
                action = Editor.actionStretchTimeEnd
            else if (exactHover)
                action = Editor.actionDragTime | Editor.actionDragPitchRow

            const hoverNote = 
            {
                id: note.id,
                range: note.range,
                action,
            }

            if (action != 0)
            {
                if (exactHover)
                    hoverPrimary = hoverNote
                else
                    hoverSecondary = hoverNote
            }

            if (hoverPrimary)
                break
        }

        const hover = hoverPrimary || hoverSecondary
        state.mergeContentState({
            mouse: {
                ...state.contentState.mouse,
                hover,
            }
        })
	}


    static *iterNotesAndKeyChangesAtRange(state: TrackStateManager<TrackNotesPreviewState>, range: Range): Generator<[Project.Note, null, number, number], void, void>
    {
        const trackElems = state.appState.project.elems.get(state.trackState.trackId)
        if (!trackElems)
            return

        for (const elem of trackElems.iterAtRange(range))
        {
			const xMin = Editor.xAtTime(state.contentStateManager, elem.range.start)
			const xMax = Editor.xAtTime(state.contentStateManager, elem.range.end)
			
            yield [elem as Project.Note, null, xMin, xMax]
        }
    }


	static yForRow(state: TrackStateManager<TrackNotesPreviewState>, row: number)
	{
		return state.trackState.h / 2 - (row + 1 + state.trackState.yScroll) * state.trackState.rowScale
	}
	
	
	static rowAtY(state: TrackStateManager<TrackNotesPreviewState>, y: number)
	{
		return Math.floor((state.trackState.h / 2 - y) / state.trackState.rowScale - state.trackState.yScroll)
	}
	
	
	static rowForPitch(state: TrackStateManager<TrackNotesPreviewState>, pitch: number, key: Theory.Key)
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.octavedDegreeForMidi(pitch - 64) + tonicRowOffset
	}
	
	
	static pitchForRow(state: TrackStateManager<TrackNotesPreviewState>, row: number, key: Theory.Key)
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.midiForDegree(row - Math.floor(tonicRowOffset)) + 64
	}
	
	
	static rectForNote(state: TrackStateManager<TrackNotesPreviewState>, range: Range, row: number, xStart: number, xEnd: number)
	{
		const noteOrigX1 = Editor.xAtTime(state.contentStateManager, range.start)
		const noteOrigX2 = Editor.xAtTime(state.contentStateManager, range.end)
		
		const noteY = TrackNotesPreview.yForRow(state, row)
		
		let noteX1 = Math.max(noteOrigX1, xStart)
		let noteX2 = Math.min(noteOrigX2, xEnd)
		
		const cutStart = noteOrigX1 < noteX1
		const cutEnd   = noteOrigX2 > noteX2
		
		if (!cutStart) noteX1 += 1
		if (!cutEnd)   noteX2 -= 1
		
		const noteW = Math.max(2, noteX2 - noteX1)
		
		return Object.assign(
            new Rect(noteX1, noteY, noteW, state.trackState.rowScale),
            { cutStart, cutEnd })
	}


    static render(state: TrackStateManager<TrackNotesPreviewState>, ctx: CanvasRenderingContext2D)
    {
        const visibleRange = Editor.visibleTimeRange(state.contentStateManager)

        const key = Theory.Key.parse("C Major")

		for (const [note, keyCh, xMin, xMax] of TrackNotesPreview.iterNotesAndKeyChangesAtRange(state, visibleRange))
		{
			const row = TrackNotesPreview.rowForPitch(state, note.pitch, key)
			const mode = key.scale.metadata!.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(ctx, key.degreeForMidi(note.pitch) + mode)
			const hovering = !!state.contentState.mouse.hover && state.contentState.mouse.hover.id == note.id
			const selected = state.appState.selection.contains(note.id)
			const playing = false//state.playback.playing && note.range.overlapsPoint(state.playback.time)
			TrackNotesPreview.renderNote(state, ctx, note.range, row, xMin, xMax, fillStyle, hovering, selected, playing)
        }
    }
	
	
	static renderNote(state: TrackStateManager<TrackNotesPreviewState>, ctx: CanvasRenderingContext2D, range: Range, row: number, xMin: number, xMax: number, fillStyle: any, hovering: boolean, selected: boolean, playing: boolean)
	{
		const rect = TrackNotesPreview.rectForNote(state, range, row, xMin, xMax)
		
		ctx.fillStyle = fillStyle
		
		ctx.beginPath()
		ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		
		if (hovering)
		{
			ctx.globalAlpha = 0.4
			ctx.fillStyle = "#fff"
			ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
			ctx.globalAlpha = 1
		}
		
		if (selected || playing)
		{
			const margin = 3
			ctx.globalAlpha = 0.6
			ctx.fillStyle = "#fff"
			ctx.fillRect(rect.x, rect.y + margin, rect.w, rect.h - margin * 2)
			ctx.globalAlpha = 1
		}
	}
}