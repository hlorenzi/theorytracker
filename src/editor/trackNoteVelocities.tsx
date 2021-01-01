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


export class EditorTrackNoteVelocities extends EditorTrack
{
    noteBlockId: Project.ID

    pencil: null |
    {
        time1: Rational
        time2: Rational
        midiPitch: number
    }


    constructor(projectTrackId: Project.ID, noteBlockId: Project.ID, h: number)
    {
        super()
        this.projectTrackId = projectTrackId
        this.noteBlockId = noteBlockId
        this.name = "Note Velocities"
        this.renderRect = new Rect(0, 0, 0, h)
        this.pencil = null
        this.noCursor = true
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
        const list = data.project.lists.get(this.noteBlockId)
        if (!list)
            return

        for (const elem of list.iterAtRange(range.displace(this.parentStart(data).negate())))
            yield elem as Project.Note
    }


    valueAtY(data: Editor.EditorUpdateData, y: number)
    {
        return Math.max(0, Math.min(1, 1 - (y / this.renderRect.h)))
    }


    yAtValue(data: Editor.EditorUpdateData, value: number)
    {
        return (1 - value) * this.renderRect.h
    }


    pencilDrag(data: Editor.EditorUpdateData)
    {
        const visibleRange = Editor.visibleTimeRange(data)
        const parentStart = this.parentStart(data)
        const x1 = data.state.mouse.pointPrev.pos.x
        const x2 = data.state.mouse.point.pos.x
        const xMin = Math.min(x1, x2)
        const xMax = Math.max(x1, x2)

        let newProject = data.project

        for (const note of this.iterNotesAtRange(data, visibleRange))
        {
            const selected = data.state.selection.contains(note.id)
            const active = data.state.selection.size == 0 || selected
            if (!active)
                continue

            const markerX = Editor.xAtTime(data, note.range.start.add(parentStart))
            if (markerX >= xMin && markerX <= xMax)
            {
                const velocity = this.valueAtY(data, data.state.mouse.point.originTrackPos.y)
                const newNote = Project.elemModify(note, { velocity })
            
                newProject = Project.upsertElement(newProject, newNote)
                
                data.playback.playNotePreview(
                    Editor.parentTrackFor(data, newNote.parentId).id,
                    newNote.midiPitch,
                    newNote.velocity)
            }
        }

        data.project = newProject
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
    
        for (let layer = 0; layer < 2; layer++)
        {
            for (const note of this.iterNotesAtRange(data, visibleRange))
            {
                const selected = data.state.selection.contains(note.id)
                const active = data.state.selection.size == 0 || selected
                if ((layer == 0) == active)
                    continue

                this.renderMarkerStick(
                    data, parentStart, note.range, note.velocity, active)
            }
        }
    }
	
	
	renderMarkerStick(
        data: Editor.EditorUpdateData,
        parentStart: Rational,
        range: Range,
        value: number,
        active: boolean)
	{
        const x = Math.floor(Editor.xAtTime(data, range.start.add(parentStart))) + 0.5
        const y = this.yAtValue(data, value)
        const arcRadius = 4
        
        data.ctx.lineWidth = 2
        data.ctx.strokeStyle = active ?
            data.prefs.editor.noteVelocityMarkerColor :
            data.prefs.editor.noteVelocityMarkerInactiveColor
		
        data.ctx.beginPath()
        data.ctx.moveTo(x, this.renderRect.h)
        data.ctx.lineTo(x, y + arcRadius)
        data.ctx.arc(x, y, arcRadius, Math.PI * 0.5, Math.PI * 2.5)
        data.ctx.stroke()
	}
}