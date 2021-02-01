import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Playback from "../playback"
import * as Timeline from "./index"
import * as Theory from "../theory"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import * as CanvasUtils from "../util/canvasUtils"
import { TimelineTrack } from "./track"


export class TimelineTrackChords extends TimelineTrack
{
    pencil: null |
    {
        time1: Rational
        time2: Rational
    }


    constructor(projectTrackId: Project.ID, name: string, h: number)
    {
        super()
        this.projectTrackId = this.parentId = projectTrackId
        this.name = name
        this.renderRect = new Rect(0, 0, 0, h)
        this.acceptedElemTypes.add("chord")
        this.pencil = null
    }


    *iterChordsAtRange(
        data: Timeline.WorkData,
        range: Range)
        : Generator<Project.Chord, void, void>
    {
        const trackElems = Project.global.project.lists.get(this.projectTrackId)
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
        for (const elem of this.iterChordsAtRange(data, range))
            yield elem.id
    }
	
	
	hover(data: Timeline.WorkData)
	{
        this.hoverBlockElements(data, (range) => this.iterChordsAtRange(data, range))
    }


    click(data: Timeline.WorkData, elemId: Project.ID)
    {
        const chord = Project.getElem(Project.global.project, elemId, "chord")
        if (chord)
        {
            data.state.insertion.duration = chord.range.duration
            Playback.playChordPreview(this.projectTrackId, chord.chord, 0, 1)
        }
    }


    pencilClear(data: Timeline.WorkData)
    {
        this.pencil = null
    }


    pencilHover(data: Timeline.WorkData)
    {
        const time = data.state.mouse.point.time

        this.pencil =
        {
            time1: time,
            time2: time.add(data.state.timeSnap.multiply(new Rational(4))),
        }
    }


    pencilDrag(data: Timeline.WorkData)
    {
		if (this.pencil)
		{
            this.pencil.time2 = data.state.mouse.point.time
            
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
            const key = Project.keyAt(Project.global.project, this.projectTrackId, this.pencil.time1)

            const elem = Project.makeChord(
                this.projectTrackId,
                new Range(this.pencil.time1, this.pencil.time2).sorted(),
                new Theory.Chord(key.tonic.chroma, 0, 0, []))

            let project = Project.global.project
            const id = project.nextId
            Project.global.project = Project.upsertElement(project, elem)
            Timeline.selectionAdd(data, id)
		}
	}


    render(data: Timeline.WorkData)
    {
        const visibleRange = Timeline.visibleTimeRange(data)

        for (let layer = 0; layer < 2; layer++)
        {
            for (const [chord, keyCh, xMin, xMax] of this.iterChordsAndKeyChangesAtRange(data, visibleRange))
            {
                const selected = data.state.selection.contains(chord.id)
                if (!Playback.global.playing && (layer == 0) == selected)
                    continue

                if (chord.type != "chord")
                    continue

                const key = keyCh.key
                const hovering = !!data.state.hover && data.state.hover.id == chord.id
                const playing = Playback.global.playing && chord.range.overlapsPoint(Playback.global.playTime)
                
                this.renderChord(
                    data, chord.range,
                    xMin, xMax,
                    chord.chord, key,
                    hovering, selected, playing)
            }
        }

        if (this.pencil)
        {
            data.ctx.save()
            data.ctx.globalAlpha = 0.4

            const key = Project.keyAt(Project.global.project, this.projectTrackId, this.pencil.time1)

            const range = new Range(this.pencil.time1, this.pencil.time2).sorted()
            this.renderChord(
                data, range, -Infinity, Infinity,
                new Theory.Chord(key.tonic.chroma, 0, 0, []),
                key,
                false, false, false)
            
            data.ctx.restore()
        }
    }


    renderChord(
        data: Timeline.WorkData,
        range: Range,
        xMin: number,
        xMax: number,
        chord: Theory.Chord,
        key: Theory.Key,
        hovering: boolean,
        selected: boolean,
        playing: boolean)
    {
        const x1 = Math.floor(Math.max(xMin, Math.min(xMax,
            Timeline.xAtTime(data, range.start)))) + 0.5
        const x2 = Math.floor(Math.max(xMin, Math.min(xMax,
            Timeline.xAtTime(data, range.end)))) + 0.5 - 1

        const y1 = 1.5
        const y2 = this.renderRect.h - 0.5

		data.ctx.fillStyle = (selected || playing) ? "#222" : "#000"
        data.ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

        CanvasUtils.renderChord(
            data.ctx,
            x1, y1, x2, y2,
            chord, key)
            
        data.ctx.strokeStyle = (selected || playing) ? "#fff" : hovering ? "#888" : "#444"
        data.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
    }
}