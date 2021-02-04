import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Theory from "../theory"
import * as Playback from "../playback"
import * as Timeline from "./index"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import * as CanvasUtils from "../util/canvasUtils"


export class TimelineTrackNotes extends Timeline.TimelineTrack
{
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
        this.parentId = noteBlockId
        this.name = name
        this.renderRect = new Rect(0, 0, 0, h)
        this.acceptedElemTypes.add("note")
        this.pencil = null
        this.scrollEnabled = true
    }


    parentStart(data: Timeline.WorkData)
    {
        const noteBlock = Project.global.project.elems.get(this.parentId)
        return noteBlock?.range?.start ?? new Rational(0)
    }


    parentRange(data: Timeline.WorkData)
    {
        const noteBlock = Project.global.project.elems.get(this.parentId)
        return noteBlock?.range ?? new Range(new Rational(0), new Rational(0))
    }


    *iterNotesAtRange(
        data: Timeline.WorkData,
        range: Range)
        : Generator<Project.Note, void, void>
    {
        const list = Project.global.project.lists.get(this.parentId)
        if (!list)
            return

        for (const elem of list.iterAtRange(range.subtract(this.parentStart(data))))
            yield elem as Project.Note
    }


    *iterExternalNotesAtRange(
        data: Timeline.WorkData,
        range: Range)
        : Generator<[Project.Note, Project.NoteBlock], void, void>
    {
        for (const track of Project.global.project.tracks)
        {
            if (track.trackType != "notes")
                continue

            const trackElems = Project.global.project.lists.get(track.id)
            if (!trackElems)
                continue
            
            for (const noteBlock of trackElems.iterAtRange(range))
            {
                if (noteBlock.id == this.parentId)
                    continue
                
                if (noteBlock.type != "noteBlock")
                    continue
                    
                const noteList = Project.global.project.lists.get(noteBlock.id)
                if (!noteList)
                    continue

                for (const elem of noteList.iterAtRange(range.subtract(noteBlock.range.start)))
                {
                    const newElem =
                    {
                        ...elem,
                        range: elem.range
                            .displace(noteBlock.range.start)
                            .intersect(noteBlock.range)
                            .subtract(noteBlock.range.start),
                    }

                    if (newElem.range.duration.isZero())
                        continue
                    
                    yield [newElem as Project.Note, noteBlock as Project.NoteBlock]
                }
            }
        }
    }


    *iterNotesAndKeyChangesAtRange(
        data: Timeline.WorkData,
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


    *iterExternalNotesAndKeyChangesAtRange(
        data: Timeline.WorkData,
        range: Range)
        : Generator<[Project.Note, Project.NoteBlock, Project.KeyChange, number, number], void, void>
    {
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of this.iterKeyChangePairsAtRange(data, range))
        {
            const time1 = keyCh1.range.start.max(range.start)!
            const time2 = keyCh2.range.start.min(range.end)!
            
            for (const [note, noteBlock] of this.iterExternalNotesAtRange(data, new Range(time1, time2)))
                yield [note, noteBlock, keyCh1, keyCh1X, keyCh2X]
        }
    }


    *iterChordsAtRange(
        data: Timeline.WorkData,
        range: Range)
        : Generator<Project.Chord, void, void>
    {
        const trackElems = Project.global.project.lists.get(Project.global.project.chordTrackId)
        if (!trackElems)
            return

        for (const elem of trackElems.iterAtRange(range))
            yield elem as Project.Chord
    }


    *iterChordsAndKeyChangesAtRange(
        data: Timeline.WorkData,
        range: Range)
        : Generator<[Project.Chord, Project.KeyChange, number, number], void, void>
    {
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of this.iterKeyChangePairsAtRange(data, range))
        {
            const time1 = keyCh1.range.start.max(range.start)!
            const time2 = keyCh2.range.start.min(range.end)!
            
            for (const chord of this.iterChordsAtRange(data, new Range(time1, time2)))
                yield [chord, keyCh1, keyCh1X, keyCh2X]
        }
    }


    *elemsAtRegion(
        data: Timeline.WorkData,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const note of this.iterNotesAtRange(data, range))
            yield note.id
    }
	
	
	hover(data: Timeline.WorkData)
	{
        const pos = data.state.mouse.point.trackPos

        const margin = 10
        const checkRange = Timeline.timeRangeAtX(data, pos.x - margin, pos.x + margin)

        let hoverDrag = null
        let hoverStretch = null

        const parentStart = this.parentStart(data)
        
        for (const [note, keyCh, xMin, xMax] of this.iterNotesAndKeyChangesAtRange(data, checkRange))
        {
            const margin = 8

            const row = this.rowForPitch(data, note.midiPitch, keyCh.key)
            const rect = this.rectForNote(
                data, note.range.displace(parentStart),
                row, xMin, xMax, true)

            const rectDrag = rect
            const rectStretch = rect.expandW(margin)

            if (rectDrag.contains(pos))
            {
                hoverDrag =
                {
                    id: note.id,
                    range: note.range,
                    action:
                        Timeline.MouseAction.DragTimeAndRow,
                }
            }
            else if (rectStretch.contains(pos))
            {
                hoverStretch =
                {
                    id: note.id,
                    range: note.range,
                    action: pos.x < (rectDrag.x1 + rectDrag.x2) / 2 ?
                        Timeline.MouseAction.StretchTimeStart :
                        Timeline.MouseAction.StretchTimeEnd
                }
            }
        }

        data.state.hover = hoverDrag ?? hoverStretch
    }


    click(data: Timeline.WorkData, elemId: Project.ID)
    {
        const note = Project.getElem(Project.global.project, elemId, "note")
        if (note)
        {
            data.state.insertion.nearMidiPitch = note.midiPitch
            data.state.insertion.duration = note.range.duration
            Playback.playNotePreview(this.projectTrackId, note.midiPitch, note.volumeDb, note.velocity)
        }
    }


    pencilClear(data: Timeline.WorkData)
    {
        this.pencil = null
    }


    pencilHover(data: Timeline.WorkData)
    {
        const time = data.state.mouse.point.time
        const key = Project.keyAt(Project.global.project, this.projectTrackId, time)
        const row = this.rowAtY(data, data.state.mouse.point.trackPos.y)
        const midiPitch = this.pitchForRow(data, row, key)

        this.pencil =
        {
            time1: time.subtract(this.parentStart(data)),
            time2: time.subtract(this.parentStart(data)).add(data.state.timeSnap.multiply(new Rational(4))),
            midiPitch,
        }
    }


    pencilStart(data: Timeline.WorkData)
    {
		if (this.pencil)
		{
            Playback.playNotePreview(this.projectTrackId, this.pencil.midiPitch, Project.DefaultVolumeDb, 1)
        }
    }


    pencilDrag(data: Timeline.WorkData)
    {
		if (this.pencil)
		{
            this.pencil.time2 = data.state.mouse.point.time.subtract(this.parentStart(data))
            
            const time1X = Timeline.xAtTime(data, this.pencil.time1)
            const time2X = Timeline.xAtTime(data, this.pencil.time2)
			if (Math.abs(time1X - time2X) < 5)
                this.pencil.time2 = this.pencil.time1.add(data.state.timeSnap.multiply(new Rational(4)))
        }
    }
	
	
	pencilComplete(data: Timeline.WorkData)
	{
		if (this.pencil)
		{
            const elem = Project.makeNote(
                this.parentId,
                new Range(this.pencil.time1, this.pencil.time2).sorted(),
                this.pencil.midiPitch,
                Project.DefaultVolumeDb,
                1)

            let project = Project.global.project
            const id = project.nextId
            Project.global.project = Project.upsertElement(project, elem)
            Timeline.selectionAdd(data, id)
		}
	}
    
    
    findPreviousAnchor(data: Timeline.WorkData, time: Rational): Rational
    {
        const list = Project.global.project.lists.get(this.parentId)
        if (!list)
            return this.parentStart(data)

        return list.findPreviousAnchor(time) || this.parentStart(data)
    }
	
	
	deleteRange(data: Timeline.WorkData, range: Range)
	{
		for (const note of this.iterNotesAtRange(data, range))
		{
            const removeNote = Project.elemModify(note, { parentId: -1 })
            Project.global.project = Project.upsertElement(Project.global.project, removeNote)
            
			for (const slice of note.range.iterSlices(range))
			{
				const newNote = Project.makeNote(note.parentId, slice, note.midiPitch, note.volumeDb, note.velocity)
                Project.global.project = Project.upsertElement(Project.global.project, newNote)
			}
		}
	}


	selectionRemoveConflictingBehind(data: Timeline.WorkData)
	{
        Project.global.project = Project.global.project

        const list = Project.global.project.lists.get(this.parentId)
        if (!list)
            return

		for (const id of data.state.selection)
		{
			const selectedNote = Project.global.project.elems.get(id)
			if (!selectedNote)
				continue

            if (selectedNote.parentId !== this.parentId)
                continue

            if (selectedNote.type != "note")
                continue

			for (const note of list.iterAtRange(selectedNote.range))
			{
				if (data.state.selection.has(note.id))
					continue

                if (note.type != "note")
                    continue
    
				if (note.midiPitch !== selectedNote.midiPitch)
					continue

                const removeNote = Project.elemModify(note, { parentId: -1 })
                Project.global.project = Project.upsertElement(Project.global.project, removeNote)
				
				for (const slice of note.range.iterSlices(selectedNote.range))
				{
					const newNote = Project.makeNote(note.parentId, slice, note.midiPitch, note.volumeDb, note.velocity)
                    Project.global.project = Project.upsertElement(Project.global.project, newNote)
				}
			}
		}

        Project.global.project = Project.global.project
	}


	yForRow(data: Timeline.WorkData, row: number): number
	{
		return this.renderRect.h / 2 - (row + 1) * data.state.noteRowH - this.yScroll
	}
	
	
	rowAtY(data: Timeline.WorkData, y: number): number
	{
        return -Math.floor((y + this.yScroll - this.renderRect.h / 2) / data.state.noteRowH) - 1
	}
	
	
	rowForPitch(data: Timeline.WorkData, pitch: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.octavedDegreeForMidi(pitch - 60) + tonicRowOffset
	}
	
	
	pitchForRow(data: Timeline.WorkData, row: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.midiForDegree(row - Math.floor(tonicRowOffset)) + 60
	}
	
	
    rectForNote(
        data: Timeline.WorkData,
        range: Range,
        row: number, xStart: number, xEnd: number,
        clampY: boolean)
	{
		const noteOrigX1 = Timeline.xAtTime(data, range.start)
		const noteOrigX2 = Timeline.xAtTime(data, range.end)
		
        let noteY = Math.floor(this.yForRow(data, row))
        if (clampY)
        {
            noteY =
                Math.max(-data.state.noteRowH / 2 + 0.5,
                Math.min(this.renderRect.h - data.state.noteRowH / 2 - 0.5,
                noteY))
        }
		
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


    render(data: Timeline.WorkData)
    {
        const visibleRange = Timeline.visibleTimeRange(data)
        const parentRange = this.parentRange(data)
        const parentStart = parentRange.start

        const visibleX1 = Timeline.xAtTime(data, visibleRange.start)
        const visibleX2 = Timeline.xAtTime(data, visibleRange.end)
        const parentX1 = Timeline.xAtTime(data, parentRange.start)
        const parentX2 = Timeline.xAtTime(data, parentRange.end)

        data.ctx.fillStyle = "#0004"
        data.ctx.fillRect(visibleX1, 0, parentX1 - visibleX1, this.renderRect.h)
        data.ctx.fillRect(parentX2, 0, visibleX2 - parentX2, this.renderRect.h)
        
        const rowAtTop = this.rowAtY(data, 0)
        const rowAtBottom = this.rowAtY(data, this.renderRect.h)

        const octaveAtTop = Math.ceil(rowAtTop / 7) + 1
        const octaveAtBottom = Math.floor(rowAtBottom / 7) - 1

		for (const [chord, keyCh, xMin, xMax] of this.iterChordsAndKeyChangesAtRange(data, visibleRange))
		{
            for (const midiPitch of chord.chord.pitches)
            {
                const key = keyCh.key
                const row = this.rowForPitch(data, midiPitch + 60, key)
                const mode = key.scale.metadata!.mode
                const fillStyle = CanvasUtils.fillStyleForDegree(
                    data.ctx, key.degreeForMidi(midiPitch) + mode, true)

                for (let i = octaveAtBottom; i <= octaveAtTop; i++)
                {
                    this.renderChordNote(
                        data, chord.range, row + i * 7, xMin, xMax, fillStyle)
                }
            }
        }
        
		for (const [keyCh1, keyCh2, xMin, xMax] of this.iterKeyChangePairsAtRange(data, visibleRange))
		{
			const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(keyCh1.key.tonic.chroma)

			for (let i = octaveAtBottom; i <= octaveAtTop; i++)
			{
				const y = 0.5 + Math.floor(
                    this.yForRow(data, tonicRowOffset + i * 7) + data.state.noteRowH)
				
				data.ctx.strokeStyle = Prefs.global.editor.octaveDividerColor
				data.ctx.beginPath()
				data.ctx.moveTo(xMin, y)
				data.ctx.lineTo(xMax, y)
				data.ctx.stroke()

				for (let j = 1; j < 7; j += 1)
				{
					const ySuboctave = 0.5 + Math.floor(
                        this.yForRow(data, tonicRowOffset + i * 7 + j) + data.state.noteRowH)
					
					data.ctx.strokeStyle = Prefs.global.editor.noteRowAlternateBkgColor
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

        for (const [note, noteBlock, keyCh, xMin, xMax] of this.iterExternalNotesAndKeyChangesAtRange(data, visibleRange))
        {
            const key = keyCh.key
            const row = this.rowForPitch(data, note.midiPitch, key)
            const mode = key.scale.metadata!.mode
            const fillStyle = CanvasUtils.fillStyleForDegree(
                data.ctx, key.degreeForMidi(note.midiPitch) + mode, true)

            const playing = Playback.global.playing && note.range.displace(noteBlock.range.start).overlapsPoint(Playback.global.playTime)

            this.renderNote(
                data, note.range, noteBlock.range.start, row, xMin, xMax, fillStyle,
                true, false, false, playing)
        }

        for (let layer = 0; layer < (Playback.global.playing ? 1 : 2); layer++)
        {
            for (const [note, keyCh, xMin, xMax] of this.iterNotesAndKeyChangesAtRange(data, visibleRange))
            {
                const selected = data.state.selection.contains(note.id)
                if (!Playback.global.playing && (layer == 0) == selected)
                    continue

                const key = keyCh.key
                const row = this.rowForPitch(data, note.midiPitch, key)
                const mode = key.scale.metadata!.mode
                const fillStyle = CanvasUtils.fillStyleForDegree(
                    data.ctx, key.degreeForMidi(note.midiPitch) + mode, false)

                const hovering = !!data.state.hover && data.state.hover.id == note.id
                const playing = Playback.global.playing && note.range.displace(parentStart).overlapsPoint(Playback.global.playTime)
                
                this.renderNote(
                    data, note.range, parentStart, row, xMin, xMax, fillStyle,
                    false, hovering, selected, playing)
            }
        }

        if (this.pencil)
        {
            data.ctx.save()
            data.ctx.globalAlpha = 0.4

            const range = new Range(this.pencil.time1, this.pencil.time2).sorted()
			const key = Project.keyAt(Project.global.project, this.projectTrackId, this.pencil.time1.add(this.parentStart(data)))
			const row = this.rowForPitch(data, this.pencil.midiPitch, key)
			const mode = key.scale.metadata!.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(
                data.ctx, key.degreeForMidi(this.pencil.midiPitch) + mode, false)

			this.renderNote(data, range, parentStart, row, -Infinity, Infinity, fillStyle)
            
            data.ctx.restore()
        }
    }
	
	
	renderNote(
        data: Timeline.WorkData,
        range: Range,
        parentStart: Rational,
        row: number,
        xMin: number, xMax: number,
        fillStyle: any,
        external?: boolean,
        hovering?: boolean, selected?: boolean, playing?: boolean)
	{
		const rect = this.rectForNote(
            data, range.displace(parentStart),
            row, xMin, xMax, true)
		
        data.ctx.fillStyle = fillStyle
		
		data.ctx.beginPath()
        data.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		
		if (hovering || playing)
		{
			data.ctx.globalAlpha = 0.4
			data.ctx.fillStyle = external ? "#888" : "#fff"
			data.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
			data.ctx.globalAlpha = 1
		}
		
		if (selected || playing)
		{
			data.ctx.strokeStyle = external ? "#888" : "#fff"
			data.ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1)
		}
	}
	
	
	renderChordNote(
        data: Timeline.WorkData,
        range: Range,
        row: number,
        xMin: number, xMax: number,
        fillStyle: any)
	{
		const rect = this.rectForNote(
            data, range,
            row, xMin, xMax, false)
		
        data.ctx.globalAlpha = 0.1
        data.ctx.fillStyle = fillStyle
		
		data.ctx.beginPath()
        data.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)

        data.ctx.globalAlpha = 1
	}
}