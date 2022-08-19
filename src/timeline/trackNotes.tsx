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


    getActiveRange(state: Timeline.State): Range
    {
        const noteBlock = Project.global.project.elems.get(this.parentId)
        return noteBlock?.range ?? new Range(new Rational(0), new Rational(0))
    }


    *iterNotesAtRange(
        state: Timeline.State,
        range: Range)
        : Generator<Project.Note, void, void>
    {
        const list = Project.global.project.lists.get(this.parentId)
        if (!list)
            return

        for (const elem of list.iterAtRange(range.subtract(this.getActiveRange(state).start)))
            yield elem as Project.Note
    }


    *iterExternalNotesAtRange(
        state: Timeline.State,
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
        state: Timeline.State,
        range: Range)
        : Generator<[Project.Note, Project.KeyChange, number, number], void, void>
    {
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of this.iterKeyChangePairsAtRange(state, range))
        {
            const time1 = keyCh1.range.start.max(range.start)!
            const time2 = keyCh2.range.start.min(range.end)!
            
            for (const note of this.iterNotesAtRange(state, new Range(time1, time2)))
                yield [note, keyCh1, keyCh1X, keyCh2X]
        }
    }


    *iterExternalNotesAndKeyChangesAtRange(
        state: Timeline.State,
        range: Range)
        : Generator<[Project.Note, Project.NoteBlock, Project.KeyChange, number, number], void, void>
    {
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of this.iterKeyChangePairsAtRange(state, range))
        {
            const time1 = keyCh1.range.start.max(range.start)!
            const time2 = keyCh2.range.start.min(range.end)!
            
            for (const [note, noteBlock] of this.iterExternalNotesAtRange(state, new Range(time1, time2)))
                yield [note, noteBlock, keyCh1, keyCh1X, keyCh2X]
        }
    }


    *iterChordsAtRange(
        state: Timeline.State,
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
        state: Timeline.State,
        range: Range)
        : Generator<[Project.Chord, Project.KeyChange, number, number], void, void>
    {
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of this.iterKeyChangePairsAtRange(state, range))
        {
            const time1 = keyCh1.range.start.max(range.start)!
            const time2 = keyCh2.range.start.min(range.end)!
            
            for (const chord of this.iterChordsAtRange(state, new Range(time1, time2)))
                yield [chord, keyCh1, keyCh1X, keyCh2X]
        }
    }


    *elemsAtRegion(
        state: Timeline.State,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const [note, keyCh, xStart, xEnd] of this.iterNotesAndKeyChangesAtRange(state, range))
        {
            if (verticalRegion)
            {
                const rect = this.rectForNote(
                    state,
                    note.range,
                    this.rowForPitch(state, note.midiPitch, keyCh.key),
                    xStart,
                    xEnd,
                    false)

                if (verticalRegion.y1 > rect.y2 ||
                    verticalRegion.y2 < rect.y1)
                    continue
            }
            
            yield note.id
        }
    }
	
	
	hover(state: Timeline.State)
	{
        const pos = state.mouse.point.trackPos

        const margin = 10
        const checkRange = Timeline.timeRangeAtX(state, pos.x - margin, pos.x + margin)

        let hoverDrag = null
        let hoverStretch = null

        const parentStart = this.getActiveRange(state).start
        
        for (const [note, keyCh, xMin, xMax] of this.iterNotesAndKeyChangesAtRange(state, checkRange))
        {
            const margin = 8

            const row = this.rowForPitch(state, note.midiPitch, keyCh.key)
            const rect = this.rectForNote(
                state, note.range.displace(parentStart),
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

        state.hover = hoverDrag ?? hoverStretch
    }


    click(state: Timeline.State, elemId: Project.ID)
    {
        const note = Project.getElem(Project.global.project, elemId, "note")
        if (note)
        {
            state.insertion.nearMidiPitch = note.midiPitch
            state.insertion.duration = note.range.duration
            Playback.playNotePreview(this.projectTrackId, note.midiPitch, note.volumeDb, note.velocity)
        }
    }


    pencilClear(state: Timeline.State)
    {
        this.pencil = null
    }


    pencilHover(state: Timeline.State)
    {
        const time = state.mouse.point.time
        const key = Project.keyAt(Project.global.project, this.projectTrackId, time)
        const row = this.rowAtY(state, state.mouse.point.trackPos.y)
        const midiPitch = this.pitchForRow(state, row, key)

        this.pencil =
        {
            time1: time.subtract(this.getActiveRange(state).start),
            time2: time.subtract(this.getActiveRange(state).start).add(state.timeSnap.multiply(new Rational(4))),
            midiPitch,
        }
    }


    pencilStart(state: Timeline.State)
    {
		if (this.pencil)
		{
            Playback.playNotePreview(this.projectTrackId, this.pencil.midiPitch, Project.DefaultVolumeDb, 1)
        }
    }


    pencilDrag(state: Timeline.State)
    {
		if (this.pencil)
		{
            this.pencil.time2 = state.mouse.point.time.subtract(this.getActiveRange(state).start)
            
            const time1X = Timeline.xAtTime(state, this.pencil.time1)
            const time2X = Timeline.xAtTime(state, this.pencil.time2)
			if (Math.abs(time1X - time2X) < 5)
                this.pencil.time2 = this.pencil.time1.add(state.timeSnap.multiply(new Rational(4)))
        }
    }
	
	
	pencilComplete(state: Timeline.State)
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
            Timeline.selectionAdd(state, id)
		}
	}


	yForRow(state: Timeline.State, row: number): number
	{
		return this.renderRect.h / 2 - (row + 1) * state.noteRowH - this.yScroll
	}
	
	
	rowAtY(state: Timeline.State, y: number): number
	{
        return -Math.floor((y + this.yScroll - this.renderRect.h / 2) / state.noteRowH) - 1
	}
	
	
	rowForPitch(state: Timeline.State, pitch: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.octavedDegreeForMidi(pitch - 60) + tonicRowOffset
	}
	
	
	pitchForRow(state: Timeline.State, row: number, key: Theory.Key): number
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.midiForDegree(row - Math.floor(tonicRowOffset)) + 60
	}
	
	
    rectForNote(
        state: Timeline.State,
        range: Range,
        row: number, xStart: number, xEnd: number,
        clampY: boolean)
	{
		const noteOrigX1 = Timeline.xAtTime(state, range.start)
		const noteOrigX2 = Timeline.xAtTime(state, range.end)
		
        let noteY = Math.floor(this.yForRow(state, row))
        if (clampY)
        {
            noteY =
                Math.max(-state.noteRowH / 2 + 0.5,
                Math.min(this.renderRect.h - state.noteRowH / 2 - 0.5,
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
            new Rect(noteX1, noteY, noteW, state.noteRowH),
            { cutStart, cutEnd })
	}


    renderBackground(state: Timeline.State, canvas: CanvasRenderingContext2D)
    {
        const visibleRange = Timeline.visibleTimeRange(state)

        const rowAtTop = this.rowAtY(state, 0)
        const rowAtBottom = this.rowAtY(state, this.renderRect.h)

        const octaveAtTop = Math.ceil(rowAtTop / 7) + 1
        const octaveAtBottom = Math.floor(rowAtBottom / 7) - 1

		for (const [chord, keyCh, xMin, xMax] of this.iterChordsAndKeyChangesAtRange(state, visibleRange))
		{
            for (const midiPitch of chord.chord.pitches)
            {
                const key = keyCh.key
                const row = this.rowForPitch(state, midiPitch + 60, key)
                const mode = key.scale.metadata!.mode
                const fillStyle = CanvasUtils.fillStyleForDegree(
                    canvas, key.degreeForMidi(midiPitch) + mode, true)

                for (let i = octaveAtBottom; i <= octaveAtTop; i++)
                {
                    this.renderChordNote(
                        state, canvas, chord.range,
                        row + i * 7, xMin, xMax, fillStyle)
                }
            }
        }
        
		for (const [keyCh1, keyCh2, xMin, xMax] of this.iterKeyChangePairsAtRange(state, visibleRange))
		{
			const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(keyCh1.key.tonic.chroma)

            let renderOctaveLabels = true

            canvas.fillStyle = Prefs.global.editor.octaveLabelColor
            canvas.font = Math.floor(state.noteRowH - 4) + "px system-ui"
            canvas.textAlign = "left"
            canvas.textBaseline = "bottom"

            for (const measure of Project.iterMeasuresAtRange(Project.global.project, new Range(keyCh1.range.start, keyCh2.range.start)))
            {
                const x1 = Math.max(xMin, 0.5 + Math.floor(Timeline.xAtTime(state, measure.time1)))
                const x2 = Math.min(xMax, 0.5 + Math.floor(Timeline.xAtTime(state, measure.time2)))

                for (let i = octaveAtBottom; i <= octaveAtTop; i++)
                {
                    const y = 0.5 + Math.floor(
                        this.yForRow(state, tonicRowOffset + i * 7) + state.noteRowH)
                    
                    canvas.strokeStyle =
                        measure.num % 2 != 0 ?
                        Prefs.global.editor.bkgColor :
                        Prefs.global.editor.bkgAlternateMeasureColor

                    const labelX = Math.max(x1 + 5, state.trackHeaderW + 5)
                    if (renderOctaveLabels && labelX + 30 < xMax)
                    {
                        canvas.fillText(keyCh1.key.tonic.str + (i + 5).toString(), labelX, y - 1)
                    }
        
                    canvas.beginPath()
                    canvas.moveTo(x1, y)
                    canvas.lineTo(x2, y)
                    canvas.moveTo(x1, y + 1)
                    canvas.lineTo(x2, y + 1)
                    canvas.stroke()

                    for (let j = 1; j < 7; j += 1)
                    {
                        const ySuboctave = 0.5 + Math.floor(
                            this.yForRow(state, tonicRowOffset + i * 7 + j) + state.noteRowH)
                        
                        canvas.beginPath()
                        canvas.moveTo(x1, ySuboctave)
                        canvas.lineTo(x2, ySuboctave)
                        canvas.stroke()
                    }
                }

                renderOctaveLabels = false
            }
        }
    }


    render(state: Timeline.State, canvas: CanvasRenderingContext2D)
    {
        const visibleRange = Timeline.visibleTimeRange(state)
        const parentStart = this.getActiveRange(state).start

        for (const [note, noteBlock, keyCh, xMin, xMax] of this.iterExternalNotesAndKeyChangesAtRange(state, visibleRange))
        {
            const key = keyCh.key
            const row = this.rowForPitch(state, note.midiPitch, key)
            const mode = key.scale.metadata!.mode
            const fillStyle = CanvasUtils.fillStyleForDegree(
                canvas, key.degreeForMidi(note.midiPitch) + mode, true)

            const playing = Playback.global.playing && note.range.displace(noteBlock.range.start).overlapsPoint(Playback.global.playTime)

            this.renderNote(
                state, canvas, note.range, noteBlock.range.start, row, xMin, xMax, fillStyle,
                true, false, false, playing)
        }

        for (let layer = 0; layer < (Playback.global.playing ? 1 : 2); layer++)
        {
            for (const [note, keyCh, xMin, xMax] of this.iterNotesAndKeyChangesAtRange(state, visibleRange))
            {
                const selected = state.selection.contains(note.id)
                if (!Playback.global.playing && (layer == 0) == selected)
                    continue

                const key = keyCh.key
                const row = this.rowForPitch(state, note.midiPitch, key)
                const mode = key.scale.metadata!.mode
                const fillStyle = CanvasUtils.fillStyleForDegree(
                    canvas, key.degreeForMidi(note.midiPitch) + mode, false)

                const hovering = !!state.hover && state.hover.id == note.id
                const playing = Playback.global.playing && note.range.displace(parentStart).overlapsPoint(Playback.global.playTime)
                
                this.renderNote(
                    state, canvas, note.range, parentStart, row, xMin, xMax, fillStyle,
                    false, hovering, selected, playing)
            }
        }

        if (this.pencil)
        {
            canvas.save()
            canvas.globalAlpha = 0.4

            const range = new Range(this.pencil.time1, this.pencil.time2).sorted()
			const key = Project.keyAt(Project.global.project, this.projectTrackId, this.pencil.time1.add(this.getActiveRange(state).start))
			const row = this.rowForPitch(state, this.pencil.midiPitch, key)
			const mode = key.scale.metadata!.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(
                canvas, key.degreeForMidi(this.pencil.midiPitch) + mode, false)

			this.renderNote(state, canvas, range, parentStart, row, -Infinity, Infinity, fillStyle)
            
            canvas.restore()
        }
    }
	
	
	renderNote(
        state: Timeline.State,
        canvas: CanvasRenderingContext2D,
        range: Range,
        parentStart: Rational,
        row: number,
        xMin: number, xMax: number,
        fillStyle: any,
        external?: boolean,
        hovering?: boolean, selected?: boolean, playing?: boolean)
	{
		const rect = this.rectForNote(
            state, range.displace(parentStart),
            row, xMin, xMax, true)
		
        canvas.fillStyle = fillStyle
		
		canvas.beginPath()
        canvas.fillRect(rect.x, rect.y, rect.w, rect.h)
		
		if (hovering || playing)
		{
			canvas.globalAlpha = 0.4
			canvas.fillStyle = external ? "#888" : "#fff"
			canvas.fillRect(rect.x, rect.y, rect.w, rect.h)
			canvas.globalAlpha = 1
		}
		
		if (selected || playing)
		{
			canvas.strokeStyle = external ? "#888" : "#fff"
			canvas.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1)
		}
	}
	
	
	renderChordNote(
        state: Timeline.State,
        canvas: CanvasRenderingContext2D,
        range: Range,
        row: number,
        xMin: number, xMax: number,
        fillStyle: any)
	{
		const rect = this.rectForNote(
            state, range,
            row, xMin, xMax, false)
		
        canvas.globalAlpha = 0.1
        canvas.fillStyle = fillStyle
		
		canvas.beginPath()
        canvas.fillRect(rect.x, rect.y, rect.w, rect.h)

        canvas.globalAlpha = 1
	}
}