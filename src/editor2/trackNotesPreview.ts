import Editor from "./editor"
import Track from "./track"
import TrackStateManager from "./trackStateManager"
import TrackNotesPreviewState from "./TrackNotesPreviewState"
import Rect from "../util/rect"
import Range from "../util/range"
import Project from "../project/project2"
import Rational from "../util/rational"
import CanvasUtils from "../util/canvasUtils"
import * as Theory from "../theory/theory"


type StateManager = TrackStateManager<TrackNotesPreviewState>


export default class TrackNotesPreview
{
    static init(state: StateManager)
    {
        Track.init(state)
        state.mergeTrackState({
            type: "notesPreview",
            rowScale: 2,
        })
    }
	
	
	static hover(state: StateManager)
	{
        state.mergeContentState({
            mouse: { ...state.contentState.mouse,
                hover: null,
            }
        })
    }
	
	
	static elemsAt(state: StateManager, region: any): Project.ID[]
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
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of TrackNotesPreview.iterKeyChangePairsAtRange(state, range))
        {
            const time1 = keyCh1.time.max(range.start)!
            const time2 = keyCh2.time.min(range.end)!
            
            for (const note of TrackNotesPreview.iterNotesAtRange(state, new Range(time1, time2)))
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


    static render(state: StateManager, ctx: CanvasRenderingContext2D)
    {
        const visibleRange = Editor.visibleTimeRange(state.contentStateManager)

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
	
	
	static renderNote(state: StateManager, ctx: CanvasRenderingContext2D, range: Range, row: number, xMin: number, xMax: number, fillStyle: any, hovering?: boolean, selected?: boolean, playing?: boolean)
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