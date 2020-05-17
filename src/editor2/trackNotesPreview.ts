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
	
	
	static pan(state: TrackStateManager<TrackNotesPreviewState>)
	{
        const yScroll =
            state.contentState.mouse.drag.trackYScrollOrigin -
            state.contentState.mouse.drag.posDelta.y

        state.mergeTrackState({ yScroll })
	}

			
	static handleEdgeScroll(state: TrackStateManager<TrackNotesPreviewState>)
	{
		const threshold = state.appState.prefs.editor.mouseEdgeScrollThreshold
		const speed = state.appState.prefs.editor.mouseEdgeScrollSpeed * 2

        const mouseY = state.contentState.mouse.trackYRaw
        const yScroll = state.trackState.yScroll

        if (mouseY > state.trackState.h - threshold)
            state.mergeTrackState({ yScroll: yScroll + speed })

		else if (mouseY < threshold)
            state.mergeTrackState({ yScroll: yScroll - speed })
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

        for (const [note, keyCh, xMin, xMax] of TrackNotesPreview.iterNotesAndKeyChangesAtRange(state, checkRange))
        {
            const margin = 2

            const row = TrackNotesPreview.rowForPitch(state, note.pitch, keyCh.key)
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
	
	
	static elemsAt(state: TrackStateManager<TrackNotesPreviewState>, region: any): Project.ID[]
	{
        const elems = []

        if (region.y1 === undefined)
        {
            for (const note of TrackNotesPreview.iterNotesAtRange(state, region.range))
                elems.push(note.id)
        }
        else
        {
            for (const [note, keyCh, xMin, xMax] of TrackNotesPreview.iterNotesAndKeyChangesAtRange(state, region.range))
            {
                const row = TrackNotesPreview.rowForPitch(state, note.pitch, keyCh.key)
                const rect = TrackNotesPreview.rectForNote(state, note.range, row, xMin, xMax)

                if (rect.y1 < region.y2 && rect.y2 > region.y1)
                    elems.push(note.id)
            }
        }

        return elems
	}


    static *iterNotesAtRange(state: TrackStateManager<TrackNotesPreviewState>, range: Range): Generator<Project.Note, void, void>
    {
        const trackElems = state.appState.project.rangedLists.get(state.trackState.trackId)
        if (!trackElems)
            return

        for (const note of trackElems.iterAtRange(range))
            yield note as Project.Note
    }


    static *iterKeyChangePairsAtRange(state: TrackStateManager<TrackNotesPreviewState>, range: Range): Generator<[Project.KeyChange, Project.KeyChange, number, number], void, void>
    {
        const keyChangeTrackId = Project.keyChangeTrackForTrack(state.appState.project, state.trackState.trackId)
        const keyChangeTrackTimedElems = state.appState.project.timedLists.get(keyChangeTrackId)
        if (!keyChangeTrackTimedElems)
            return

        const firstKeyCh = keyChangeTrackTimedElems.findFirst() as (Project.KeyChange | null)
        const defaultKey = firstKeyCh ? firstKeyCh.key : Editor.defaultKey()
    
        for (const pair of keyChangeTrackTimedElems.iterActiveAtRangePairwise(range))
        {
            const keyCh1 = pair[0] || new Project.KeyChange(-1, range.start, defaultKey)
            const keyCh2 = pair[1] || new Project.KeyChange(-1, range.end,   defaultKey)
            
            const keyCh1X = Editor.xAtTime(state.contentStateManager, keyCh1.time)
            const keyCh2X = Editor.xAtTime(state.contentStateManager, keyCh2.time)
            
            yield [keyCh1 as Project.KeyChange, keyCh2 as Project.KeyChange, keyCh1X, keyCh2X]
        }
    }


    static *iterNotesAndKeyChangesAtRange(state: TrackStateManager<TrackNotesPreviewState>, range: Range): Generator<[Project.Note, Project.KeyChange, number, number], void, void>
    {
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of TrackNotesPreview.iterKeyChangePairsAtRange(state, range))
        {
            const time1 = keyCh1.time.max(range.start)!
            const time2 = keyCh2.time.min(range.end)!
            
            for (const note of TrackNotesPreview.iterNotesAtRange(state, new Range(time1, time2)))
                yield [note, keyCh1, keyCh1X, keyCh2X]
        }
    }


	static yForRow(state: TrackStateManager<TrackNotesPreviewState>, row: number): number
	{
		return state.trackState.h / 2 - (row + 1) * state.trackState.rowScale - state.trackState.yScroll
	}
	
	
	static rowAtY(state: TrackStateManager<TrackNotesPreviewState>, y: number): number
	{
        return -Math.floor((y - state.trackState.h / 2) / state.trackState.rowScale) - 1
	}
	
	
	static rowForPitch(state: TrackStateManager<TrackNotesPreviewState>, pitch: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.octavedDegreeForMidi(pitch - 60) + tonicRowOffset
	}
	
	
	static pitchForRow(state: TrackStateManager<TrackNotesPreviewState>, row: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.midiForDegree(row - Math.floor(tonicRowOffset)) + 60
	}
	
	
	static rectForNote(state: TrackStateManager<TrackNotesPreviewState>, range: Range, row: number, xStart: number, xEnd: number)
	{
		const noteOrigX1 = Editor.xAtTime(state.contentStateManager, range.start)
		const noteOrigX2 = Editor.xAtTime(state.contentStateManager, range.end)
		
		const noteY = Math.floor(TrackNotesPreview.yForRow(state, row))
		
		let noteX1 = Math.max(noteOrigX1, xStart)
		let noteX2 = Math.min(noteOrigX2, xEnd)
		
		const cutStart = noteOrigX1 < noteX1
		const cutEnd   = noteOrigX2 > noteX2
		
		//if (!cutStart) noteX1 += 1
        if (!cutEnd)   noteX2 -= 1
        
        noteX1 = Math.floor(noteX1)
        noteX2 = Math.floor(noteX2)
		
		const noteW = Math.max(2, noteX2 - noteX1)
		
		return Object.assign(
            new Rect(noteX1, noteY, noteW, state.trackState.rowScale),
            { cutStart, cutEnd })
	}


    static render(state: TrackStateManager<TrackNotesPreviewState>, ctx: CanvasRenderingContext2D)
    {
        const visibleRange = Editor.visibleTimeRange(state.contentStateManager)

        const rowAtTop = TrackNotesPreview.rowAtY(state, state.trackState.yScroll)
        const rowAtBottom = TrackNotesPreview.rowAtY(state, state.trackState.yScroll + state.trackState.h)

        const octaveAtTop = Math.ceil(rowAtTop / 7) + 1
        const octaveAtBottom = Math.floor(rowAtBottom / 7) - 1

		for (const [keyCh1, keyCh2, xMin, xMax] of TrackNotesPreview.iterKeyChangePairsAtRange(state, visibleRange))
		{
			const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(keyCh1.key.tonic.chroma)

			for (let i = octaveAtBottom; i <= octaveAtTop; i++)
			{
				const y = 0.5 + Math.floor(TrackNotesPreview.yForRow(state, tonicRowOffset + i * 7) + state.trackState.rowScale)
				
				ctx.strokeStyle = state.appState.prefs.editor.octaveDividerColor
				ctx.beginPath()
				ctx.moveTo(xMin, y)
				ctx.lineTo(xMax, y)
				ctx.stroke()

				for (let j = 1; j < 7; j += 1)
				{
					const ySuboctave = 0.5 + Math.floor(TrackNotesPreview.yForRow(state, tonicRowOffset + i * 7 + j) + state.trackState.rowScale)
					
					ctx.strokeStyle = state.appState.prefs.editor.noteRowAlternateBkgColor
                    ctx.beginPath()
                    ctx.moveTo(xMin, ySuboctave)
                    ctx.lineTo(xMax, ySuboctave)
                    ctx.stroke()
				}
				
				/*if (i == 0)
				{
					ctx.globalAlpha = 0.05
					ctx.fillStyle = "#fff"
					ctx.fillRect(xMin, y - 7 * state.trackState.rowScale, xMax - xMin, 7 * state.trackState.rowScale)
					ctx.globalAlpha = 1
				}*/
			}
        }
        
		for (const [note, keyCh, xMin, xMax] of TrackNotesPreview.iterNotesAndKeyChangesAtRange(state, visibleRange))
		{
            const key = keyCh.key
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