import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Theory from "../theory"
import * as Editor from "./index"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import * as CanvasUtils from "../util/canvasUtils"
import { EditorTrack } from "./track"


export class EditorTrackNotes extends EditorTrack
{
    noteBlockId: Project.ID

    pencil: null |
    {
        time1: Rational
        time2: Rational
        midiPitch: number
    }


    constructor(projectTrackId: Project.ID, noteBlockId: Project.ID, name: string, h: number)
    {
        super()
        this.projectTrackId = projectTrackId
        this.noteBlockId = noteBlockId
        this.name = name
        this.renderRect = new Rect(0, 0, 0, h)
        this.acceptedElemTypes.add(Project.ElementType.NoteBlock)
        this.pencil = null
    }


    parentStart(data: Editor.EditorUpdateData)
    {
        const noteBlock = data.project.elems.get(this.noteBlockId)
        return noteBlock?.range?.start ?? new Rational(0)
    }


    parentRange(data: Editor.EditorUpdateData)
    {
        const noteBlock = data.project.elems.get(this.noteBlockId)
        return noteBlock?.range ?? new Range(new Rational(0), new Rational(0))
    }


    *iterNotesAtRange(
        data: Editor.EditorUpdateData,
        range: Range)
        : Generator<Project.Note, void, void>
    {
        const trackElems = data.project.lists.get(this.noteBlockId)
        if (!trackElems)
            return

        for (const elem of trackElems.iterAtRange(range.displace(this.parentStart(data).negate())))
            yield elem as Project.Note
    }


    *iterKeyChangePairsAtRange(
        data: Editor.EditorUpdateData,
        range: Range)
        : Generator<[Project.KeyChange, Project.KeyChange, number, number], void, void>
    {
        const keyChangeTrackId = Project.Root.keyChangeTrackId(data.project)
        const keyChangeTrackTimedElems = data.project.lists.get(keyChangeTrackId)
        if (!keyChangeTrackTimedElems)
            return

        const firstKeyCh = keyChangeTrackTimedElems.findFirst() as (Project.KeyChange | null)
        const defaultKey = firstKeyCh?.key ?? Editor.defaultKey()
    
        for (const pair of keyChangeTrackTimedElems.iterActiveAtRangePairwise(range))
        {
            const keyCh1 = pair[0] ?? Project.makeKeyChange(-1, range.start, defaultKey)
            const keyCh2 = pair[1] ?? Project.makeKeyChange(-1, range.end,   defaultKey)
            
            const keyCh1X = Editor.xAtTime(data, keyCh1.range.start)
            const keyCh2X = Editor.xAtTime(data, keyCh2.range.start)
            
            yield [keyCh1 as Project.KeyChange, keyCh2 as Project.KeyChange, keyCh1X, keyCh2X]
        }
    }


    *iterNotesAndKeyChangesAtRange(
        data: Editor.EditorUpdateData,
        range: Range)
        : Generator<[Project.Note, Project.KeyChange, number, number], void, void>
    {
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of this.iterKeyChangePairsAtRange(data, range))
        {
            const time1 = keyCh1.range.start.max(range.start)!
            const time2 = keyCh2.range.start.min(range.end)!
            
            for (const note of this.iterNotesAtRange(data, new Range(time1, time2)))
                yield [note, keyCh1, keyCh1X, keyCh2X]
        }
    }


    *elemsAtRegion(
        data: Editor.EditorUpdateData,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const note of this.iterNotesAtRange(data, range))
            yield note.id
    }
	
	
	hover(data: Editor.EditorUpdateData)
	{
        const pos = data.state.mouse.point.trackPos

        const margin = 10
        const checkRange = Editor.timeRangeAtX(data, pos.x - margin, pos.x + margin)

        let hoverDrag = null
        let hoverStretch = null
        
        for (const [note, keyCh, xMin, xMax] of this.iterNotesAndKeyChangesAtRange(data, checkRange))
        {
            const margin = 8

            const row = this.rowForPitch(data, note.midiPitch, keyCh.key)
            const rect = this.rectForNote(data, note.range, this.parentStart(data), row, xMin, xMax)

            const rectDrag = rect
            const rectStretch = rect.expandW(margin)

            if (rectDrag.contains(pos))
            {
                hoverDrag =
                {
                    id: note.id,
                    range: note.range,
                    action:
                        Editor.EditorAction.DragTime |
                        Editor.EditorAction.DragRow |
                        Editor.EditorAction.DragTrack,
                }
            }
            else if (rectStretch.contains(pos))
            {
                hoverStretch =
                {
                    id: note.id,
                    range: note.range,
                    action: pos.x < (rectDrag.x1 + rectDrag.x2) / 2 ?
                        Editor.EditorAction.StretchTimeStart :
                        Editor.EditorAction.StretchTimeEnd
                }
            }
        }

        data.state.hover = hoverDrag ?? hoverStretch
    }


    pencilClear(data: Editor.EditorUpdateData)
    {
        this.pencil = null
    }


    pencilHover(data: Editor.EditorUpdateData)
    {
        const time = data.state.mouse.point.time.subtract(this.parentStart(data))
        const key = Editor.keyAt(data, this.projectTrackId, time)
        const row = this.rowAtY(data, data.state.mouse.point.trackPos.y)
        const midiPitch = this.pitchForRow(data, row, key)

        this.pencil =
        {
            time1: time,
            time2: time.add(data.state.timeSnap.multiply(new Rational(4))),
            midiPitch,
        }
    }


    pencilDrag(data: Editor.EditorUpdateData)
    {
		if (this.pencil)
		{
            this.pencil.time2 = data.state.mouse.point.time.subtract(this.parentStart(data))
            
            const time1X = Editor.xAtTime(data, this.pencil.time1)
            const time2X = Editor.xAtTime(data, this.pencil.time2)
			if (Math.abs(time1X - time2X) < 5)
                this.pencil.time2 = this.pencil.time1.add(data.state.timeSnap.multiply(new Rational(4)))
        }
    }
	
	
	pencilComplete(data: Editor.EditorUpdateData)
	{
		if (this.pencil)
		{
            const elem = Project.makeNote(
                this.noteBlockId,
                new Range(this.pencil.time1, this.pencil.time2).sorted(),
                this.pencil.midiPitch)

            const id = data.project.nextId
            data.project = Project.Root.upsertElement(data.project, elem)
            Editor.selectionAdd(data, id)
		}
	}


	yForRow(data: Editor.EditorUpdateData, row: number): number
	{
		return this.renderRect.h / 2 - (row + 1) * data.state.noteRowH
	}
	
	
	rowAtY(data: Editor.EditorUpdateData, y: number): number
	{
        return -Math.floor((y - this.renderRect.h / 2) / data.state.noteRowH) - 1
	}
	
	
	rowForPitch(data: Editor.EditorUpdateData, pitch: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.octavedDegreeForMidi(pitch - 60) + tonicRowOffset
	}
	
	
	pitchForRow(data: Editor.EditorUpdateData, row: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.midiForDegree(row - Math.floor(tonicRowOffset)) + 60
	}
	
	
    rectForNote(
        data: Editor.EditorUpdateData,
        range: Range,
        parentStart: Rational,
        row: number, xStart: number, xEnd: number)
	{
        range = range.displace(parentStart)

		const noteOrigX1 = Editor.xAtTime(data, range.start)
		const noteOrigX2 = Editor.xAtTime(data, range.end)
		
		const noteY = Math.floor(this.yForRow(data, row))
		
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
            new Rect(noteX1, noteY, noteW, data.state.noteRowH),
            { cutStart, cutEnd })
	}


    render(data: Editor.EditorUpdateData)
    {
        const visibleRange = Editor.visibleTimeRange(data)
        const parentRange = this.parentRange(data)
        const parentStart = parentRange.start

        const visibleX1 = Editor.xAtTime(data, visibleRange.start)
        const visibleX2 = Editor.xAtTime(data, visibleRange.end)
        const parentX1 = Editor.xAtTime(data, parentRange.start)
        const parentX2 = Editor.xAtTime(data, parentRange.end)

        data.ctx.fillStyle = "#0004"
        data.ctx.fillRect(visibleX1, 0, parentX1 - visibleX1, this.renderRect.h)
        data.ctx.fillRect(parentX2, 0, visibleX2 - parentX2, this.renderRect.h)
        
        const rowAtTop = this.rowAtY(data, this.yScroll)
        const rowAtBottom = this.rowAtY(data, this.yScroll + this.renderRect.h)

        const octaveAtTop = Math.ceil(rowAtTop / 7) + 1
        const octaveAtBottom = Math.floor(rowAtBottom / 7) - 1

		for (const [keyCh1, keyCh2, xMin, xMax] of this.iterKeyChangePairsAtRange(data, visibleRange))
		{
			const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(keyCh1.key.tonic.chroma)

			for (let i = octaveAtBottom; i <= octaveAtTop; i++)
			{
				const y = 0.5 + Math.floor(
                    this.yForRow(data, tonicRowOffset + i * 7) + data.state.noteRowH)
				
				data.ctx.strokeStyle = data.prefs.editor.octaveDividerColor
				data.ctx.beginPath()
				data.ctx.moveTo(xMin, y)
				data.ctx.lineTo(xMax, y)
				data.ctx.stroke()

				for (let j = 1; j < 7; j += 1)
				{
					const ySuboctave = 0.5 + Math.floor(
                        this.yForRow(data, tonicRowOffset + i * 7 + j) + data.state.noteRowH)
					
					data.ctx.strokeStyle = data.prefs.editor.noteRowAlternateBkgColor
                    data.ctx.beginPath()
                    data.ctx.moveTo(xMin, ySuboctave)
                    data.ctx.lineTo(xMax, ySuboctave)
                    data.ctx.stroke()
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

		for (const [note, keyCh, xMin, xMax] of this.iterNotesAndKeyChangesAtRange(data, visibleRange))
		{
            const selected = data.state.selection.contains(note.id)
            if (selected)
                continue

            const key = keyCh.key
			const row = this.rowForPitch(data, note.midiPitch, key)
			const mode = key.scale.metadata!.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(
                data.ctx, key.degreeForMidi(note.midiPitch) + mode)

			const hovering = !!data.state.hover && data.state.hover.id == note.id
            const playing = false
            
			this.renderNote(
                data, note.range, parentStart, row, xMin, xMax, fillStyle,
                hovering, selected, playing)
        }

		for (const [note, keyCh, xMin, xMax] of this.iterNotesAndKeyChangesAtRange(data, visibleRange))
		{
            const selected = data.state.selection.contains(note.id)
            if (!selected)
                continue

            const key = keyCh.key
			const row = this.rowForPitch(data, note.midiPitch, key)
			const mode = key.scale.metadata!.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(
                data.ctx, key.degreeForMidi(note.midiPitch) + mode)

			const hovering = !!data.state.hover && data.state.hover.id == note.id
            const playing = false
            
			this.renderNote(
                data, note.range, parentStart, row, xMin, xMax, fillStyle,
                hovering, selected, playing)
        }

        if (this.pencil)
        {
            data.ctx.save()
            data.ctx.globalAlpha = 0.4

            const range = new Range(this.pencil.time1, this.pencil.time2).sorted()
			const key = Editor.keyAt(data, this.projectTrackId, this.pencil.time1)
			const row = this.rowForPitch(data, this.pencil.midiPitch, key)
			const mode = key.scale.metadata!.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(
                data.ctx, key.degreeForMidi(this.pencil.midiPitch) + mode)

			this.renderNote(data, range, parentStart, row, -Infinity, Infinity, fillStyle)
            
            data.ctx.restore()
        }
    }
	
	
	renderNote(
        data: Editor.EditorUpdateData,
        range: Range,
        parentStart: Rational,
        row: number,
        xMin: number, xMax: number,
        fillStyle: any,
        hovering?: boolean, selected?: boolean, playing?: boolean)
	{
		const rect = this.rectForNote(data, range, parentStart, row, xMin, xMax)
		
		data.ctx.fillStyle = fillStyle
		
		data.ctx.beginPath()
        data.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		
		if (hovering)
		{
			data.ctx.globalAlpha = 0.4
			data.ctx.fillStyle = "#fff"
			data.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
			data.ctx.globalAlpha = 1
		}
		
		if (selected || playing)
		{
			data.ctx.strokeStyle = "#fff"
			data.ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w, rect.h)
		}
	}
}