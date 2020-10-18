import Editor from "./editor"
import Track from "./track"
import TrackStateManager from "./trackStateManager"
import TrackNotesState from "./trackNotesState"
import Rect from "../util/rect"
import Range from "../util/range"
import Project from "../project/project2"
import Rational from "../util/rational"
import CanvasUtils from "../util/canvasUtils"
import * as Theory from "../theory/theory"


type StateManager = TrackStateManager<TrackNotesState>


export default class TrackNotes
{
    static init(state: StateManager)
    {
        Track.init(state)
        state.mergeTrackState({
            type: "notes",
            rowScale: 10,
        })
    }
	
	
	static yScrollEnabled(state: StateManager): boolean
	{
		return true
	}
	
	
	static hover(state: StateManager)
	{
        const pos = state.contentState.mouse.trackPos

        const margin = 10
        const checkRange = Editor.timeRangeAtX(state.contentStateManager, pos.x - margin, pos.x + margin)
        
        let hoverPrimary = null
        let hoverSecondary = null

        for (const [note, keyCh, xMin, xMax] of TrackNotes.iterNotesAndKeyChangesAtRange(state, checkRange))
        {
            const margin = 2

            const row = TrackNotes.rowForPitch(state, note.pitch, keyCh.key)
            const rectExact = TrackNotes.rectForNote(state, note.range, row, xMin, xMax)
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
            
            const exactHover = rect.contains(pos)

            let action = 0
            if (dragMarginOut > 0 && rectDrag.contains(pos))
                action = Editor.actionDragTime | Editor.actionDragPitchRow
            else if (rectStretchStart.contains(pos) && !rectExact.cutStart)
                action = Editor.actionStretchTimeStart
            else if (rectStretchEnd.contains(pos) && !rectExact.cutEnd)
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
            mouse: { ...state.contentState.mouse,
                hover,
            }
        })
    }
    

	static drawClear(state: StateManager)
    {
        state.mergeTrackState({ draw: null })
    }
    

	static drawHover(state: StateManager)
    {
        const time =  state.contentState.mouse.time
        const key = Editor.keyAt(state.contentStateManager, state.trackState.trackId, time)
        const row = TrackNotes.rowAtY(state, state.contentState.mouse.trackPos.y)
        const pitch = TrackNotes.pitchForRow(state, row, key)

        state.mergeTrackState({
            draw:
            {
                time1: time,
                time2: time.add(state.contentState.timeSnap.multiply(new Rational(4))),
                pitch,
            }
        })
    }
	
	
	static drawDrag(state: StateManager)
	{
		const draw = state.trackState.draw
		if (draw)
		{
            let time2 = state.contentState.mouse.time
            
            const time1X = Editor.xAtTime(state.contentStateManager, draw.time1)
            const time2X = Editor.xAtTime(state.contentStateManager, time2)
			if (Math.abs(time1X - time2X) < 5)
				time2 = draw.time1.add(state.contentState.timeSnap.multiply(new Rational(4)))
            
            state.mergeTrackState({
                draw: { ...draw,
                    time2,
                }
            })
		}
	}
	
	
	static drawEnd(state: StateManager)
	{
		const draw = state.trackState.draw
		if (draw)
		{
            const note = new Project.Note(
                state.trackState.trackId,
                new Range(draw.time1, draw.time2).sorted(),
                draw.pitch)

            const id = state.appState.project.nextId
            state.mergeAppState({
                project: Project.upsertRangedElement(state.appState.project, note),
                selection: state.appState.selection.add(id),
            })
		}
	}
	
	
	static elemsAt(state: StateManager, region: any): Project.ID[]
	{
        const elems = []

        if (region.y1 === undefined)
        {
            for (const note of TrackNotes.iterNotesAtRange(state, region.range))
                elems.push(note.id)
        }
        else
        {
            for (const [note, keyCh, xMin, xMax] of TrackNotes.iterNotesAndKeyChangesAtRange(state, region.range))
            {
                const row = TrackNotes.rowForPitch(state, note.pitch, keyCh.key)
                const rect = TrackNotes.rectForNote(state, note.range, row, xMin, xMax)

                if (rect.y1 < region.y2 && rect.y2 > region.y1)
                    elems.push(note.id)
            }
        }

        return elems
    }


    static *iterNotesAtRange(state: StateManager, range: Range): Generator<Project.Note, void, void>
    {
        const trackElems = state.appState.project.rangedLists.get(state.trackState.trackId)
        if (!trackElems)
            return

        for (const note of trackElems.iterAtRange(range))
            yield note as Project.Note
    }


    static *iterKeyChangePairsAtRange(state: StateManager, range: Range): Generator<[Project.KeyChange, Project.KeyChange, number, number], void, void>
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


    static *iterNotesAndKeyChangesAtRange(state: StateManager, range: Range): Generator<[Project.Note, Project.KeyChange, number, number], void, void>
    {
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of TrackNotes.iterKeyChangePairsAtRange(state, range))
        {
            const time1 = keyCh1.time.max(range.start)!
            const time2 = keyCh2.time.min(range.end)!
            
            for (const note of TrackNotes.iterNotesAtRange(state, new Range(time1, time2)))
                yield [note, keyCh1, keyCh1X, keyCh2X]
        }
    }


	static yForRow(state: StateManager, row: number): number
	{
		return state.trackState.h / 2 - (row + 1) * state.trackState.rowScale
	}
	
	
	static rowAtY(state: StateManager, y: number): number
	{
        return -Math.floor((y - state.trackState.h / 2) / state.trackState.rowScale) - 1
	}
	
	
	static rowForPitch(state: StateManager, pitch: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.octavedDegreeForMidi(pitch - 60) + tonicRowOffset
	}
	
	
	static pitchForRow(state: StateManager, row: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.midiForDegree(row - Math.floor(tonicRowOffset)) + 60
	}
	
	
	static rectForNote(state: StateManager, range: Range, row: number, xStart: number, xEnd: number)
	{
		const noteOrigX1 = Editor.xAtTime(state.contentStateManager, range.start)
		const noteOrigX2 = Editor.xAtTime(state.contentStateManager, range.end)
		
		const noteY = Math.floor(TrackNotes.yForRow(state, row))
		
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


    static render(state: StateManager, ctx: CanvasRenderingContext2D)
    {
        const visibleRange = Editor.visibleTimeRange(state.contentStateManager)

        const rowAtTop = TrackNotes.rowAtY(state, state.trackState.yScroll)
        const rowAtBottom = TrackNotes.rowAtY(state, state.trackState.yScroll + state.trackState.h)

        const octaveAtTop = Math.ceil(rowAtTop / 7) + 1
        const octaveAtBottom = Math.floor(rowAtBottom / 7) - 1

		for (const [keyCh1, keyCh2, xMin, xMax] of TrackNotes.iterKeyChangePairsAtRange(state, visibleRange))
		{
			const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(keyCh1.key.tonic.chroma)

			for (let i = octaveAtBottom; i <= octaveAtTop; i++)
			{
				const y = 0.5 + Math.floor(TrackNotes.yForRow(state, tonicRowOffset + i * 7) + state.trackState.rowScale)
				
				ctx.strokeStyle = state.appState.prefs.editor.octaveDividerColor
				ctx.beginPath()
				ctx.moveTo(xMin, y)
				ctx.lineTo(xMax, y)
				ctx.stroke()

				for (let j = 1; j < 7; j += 1)
				{
					const ySuboctave = 0.5 + Math.floor(TrackNotes.yForRow(state, tonicRowOffset + i * 7 + j) + state.trackState.rowScale)
					
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
        
		for (const [note, keyCh, xMin, xMax] of TrackNotes.iterNotesAndKeyChangesAtRange(state, visibleRange))
		{
            const key = keyCh.key
			const row = TrackNotes.rowForPitch(state, note.pitch, key)
			const mode = key.scale.metadata!.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(ctx, key.degreeForMidi(note.pitch) + mode)
			const hovering = !!state.contentState.mouse.hover && state.contentState.mouse.hover.id == note.id
			const selected = state.appState.selection.contains(note.id)
			const playing = state.appState.playback.playing && note.range.overlapsPoint(state.appState.playback.time)
			TrackNotes.renderNote(state, ctx, note.range, row, xMin, xMax, fillStyle, hovering, selected, playing)
        }

		const draw = state.trackState.draw
		if (draw)
		{
			ctx.globalAlpha = 0.6
			
			const key = Editor.keyAt(state.contentStateManager, state.trackState.trackId, draw.time1)
			const row = TrackNotes.rowForPitch(state, draw.pitch, key)
			const mode = key.scale.metadata!.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(ctx, key.degreeForMidi(draw.pitch) + mode)
			TrackNotes.renderNote(state, ctx, new Range(draw.time1, draw.time2).sorted(), row, -Infinity, Infinity, fillStyle)
			
			ctx.globalAlpha = 1
		}
    }
	
	
	static renderNote(state: StateManager, ctx: CanvasRenderingContext2D, range: Range, row: number, xMin: number, xMax: number, fillStyle: any, hovering?: boolean, selected?: boolean, playing?: boolean)
	{
		const rect = TrackNotes.rectForNote(state, range, row, xMin, xMax)
		
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