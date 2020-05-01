import Project from "../project/project.js"
import Editor from "./editor.js"
import Track from "./track.js"
import Rational from "../util/rational.js"
import Range from "../util/range.js"
import Rect from "../util/rect.js"
import Theory from "../theory.ts"
import CanvasUtils from "../util/canvas.js"


export default class TrackNotes
{
	static init(state, trackIndex, action)
	{
		const newTrack =
		{
			...Track.init(state, action),
			kind: "notes",
			rowScale: 15,
		}
		
		return { ...state,
			tracks: [ ...state.tracks, newTrack ],
		}
	}
	
	
	static updateHover(state, trackIndex, input)
	{
		let hover = null
		let draw = null
		
		if (state.keys[Editor.keyDraw])
		{
			const keyCh = state.project.keyChanges.findActiveAt(input.mouse.time)
			const key = keyCh ? keyCh.key : Editor.defaultKey()
			const row = TrackNotes.rowAtY(state, trackIndex, input.mouse.y, key)
			const pitch = TrackNotes.pitchForRow(state, trackIndex, row, key)
			draw =
			{
				kind: "note",
				time1: input.mouse.time,
				time2: input.mouse.time.add(state.timeSnap.multiply(new Rational(4))),
				pitch,
			}
		}
		else
		{
			const margin = 10
			const checkRange = Editor.timeRangeAtX(state, input.mouse.x - margin, input.mouse.x + margin)
			
			let hoverPrimary = null
			let hoverSecondary = null

			for (const [note, keyCh, xMin, xMax] of TrackNotes.iterNotesAndKeyChangesAtRange(state, trackIndex, checkRange))
			{
				const margin = 2

				const row = TrackNotes.rowForPitch(state, trackIndex, note.pitch, keyCh.key)
				const rectExact = TrackNotes.rectForNote(state, trackIndex, note.range, row, xMin, xMax)
				const rect = new Rect(rectExact.x - margin, rectExact.y, rectExact.w + margin * 2, rectExact.h)

				const dragMarginOut = Math.abs(Math.min(0, rect.w - 16))
				const stretchMarginOut = 16
				const stretchMarginIn = Math.max(0, Math.min(10, rect.w / 4))
				const rectDrag = new Rect(rect.x - dragMarginOut, rect.y, rect.w + dragMarginOut * 2, rect.h)
				const rectStretchStart = new Rect(rect.x - stretchMarginOut, rect.y, stretchMarginOut + stretchMarginIn, rect.h)
				const rectStretchEnd = new Rect(rect.x2 - stretchMarginIn, rect.y, stretchMarginOut + stretchMarginIn, rect.h)
				
				const exactHover = rect.contains(input.mouse)

				let action = 0
				if (dragMarginOut > 0 && rectDrag.contains(input.mouse))
					action = Editor.actionDragTime | Editor.actionDragPitchRow
				else if (rectStretchStart.contains(input.mouse) && !rectExact.cutStart)
					action = Editor.actionStretchTimeStart
				else if (rectStretchEnd.contains(input.mouse) && !rectExact.cutEnd)
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

			hover = hoverPrimary || hoverSecondary
		}
		
		return Track.update(state, trackIndex, { hover, draw })
	}


	static hoveredPlaySoundPreview(state, trackIndex)
	{
		const hover = state.tracks[trackIndex].hover
		if (!hover)
			return state
		
		const id = hover.id
		const note = state.project.notes.findById(id)

		if (!note)
			return state
		
		return Editor.soundPreviewSet(state, TrackNotes.mergeSoundPreview(null, note.pitch))
	}
	
	
	static selectionAddAtCursor(state, trackIndex)
	{
		const timeRange = new Range(state.cursor.time1, state.cursor.time2, false, false).sorted()
		
		for (const note of state.project.notes.iterAtRange(timeRange))
			state = Track.selectionAdd(state, trackIndex, note.id)
		
		return state
	}
	
	
	static selectionAddAtRect(state, trackIndex)
	{
		const timeRange = new Range(state.rectSelection.time1, state.rectSelection.time2, false, false).sorted()
		const y1 = Math.min(state.rectSelection.y1, state.rectSelection.y2)
		const y2 = Math.max(state.rectSelection.y1, state.rectSelection.y2)
		
		for (const [note, keyCh, xMin, xMax] of TrackNotes.iterNotesAndKeyChangesAtRange(state, trackIndex, timeRange))
		{
			const row = TrackNotes.rowForPitch(state, trackIndex, note.pitch, keyCh.key)
			const rect = TrackNotes.rectForNote(state, trackIndex, note.range, row, xMin, xMax)
			if (y1 < rect.y2 && y2 > rect.y1)
				state = Track.selectionAdd(state, trackIndex, note.id)
		}
		
		return state
	}


	static selectionRemoveConflictingBehind(state, trackIndex)
	{
		const selection = state.tracks[trackIndex].selection

		for (const id of selection)
		{
			const elem = state.project.findById(id)
			if (!elem)
				continue

			for (const note of state.project.notes.iterAtRange(elem.range))
			{
				if (selection.has(note.id))
					continue

				if (note.pitch !== elem.pitch)
					continue
				
				state = { ...state, project: state.project.removeById(note.id) }
				
				for (const slice of note.range.iterSlices(elem.range))
				{
					const newNote = new Project.Note(slice, note.pitch)
					state = { ...state, project: state.project.upsertNote(newNote) }
				}
			}
		}

		return state
	}
	
	
	static clipboardPaste(state, trackIndex, pasteData)
	{
		for (const [clipboardId, elem] of state.clipboard.elems)
		{
			if (elem instanceof Project.Note)
			{
				const range = elem.range.displace(pasteData.time.subtract(state.clipboard.range.start))
				const note = new Project.Note(range, elem.pitch)
				const id = state.project.nextId
				state = { ...state, project: state.project.upsertNote(note) }
				state = Track.selectionAdd(state, trackIndex, id)
			}
		}
		
		return state
	}
	
	
	static previousAnchor(state, trackIndex, time)
	{
		return state.project.notes.findPreviousAnchor(time)
	}
	
	
	static deleteRange(state, trackIndex, range)
	{
		for (const note of state.project.notes.iterAtRange(range))
		{
			state = { ...state, project: state.project.removeById(note.id) }
			
			for (const slice of note.range.iterSlices(range))
			{
				const newNote = new Project.Note(slice, note.pitch)
				state = { ...state, project: state.project.upsertNote(newNote) }
			}
		}
		
		return state
	}
	
	
	static pan(state, trackIndex)
	{
		const pitchRowDelta = -(state.mouse.drag.yDelta / state.tracks[trackIndex].rowScale)

		const yScroll = state.tracks[trackIndex].dragData.yScroll + pitchRowDelta
		state = Track.update(state, trackIndex, { yScroll })

		return state
	}
	
	
	static drag(state, trackIndex)
	{
		const pitchRowDelta = -(state.mouse.drag.yDelta / state.tracks[trackIndex].rowScale)

		let soundPreview = null

		for (const id of state.tracks[trackIndex].selection)
		{
			const elem = state.tracks[trackIndex].dragData.elems.get(id)
			if (!elem)
				continue
			
			let changes = {}
			
			if (state.mouse.action & Editor.actionDragTime)
				changes.range = elem.range.displace(state.mouse.drag.timeDelta)
			
			if (state.mouse.action & Editor.actionStretchTimeStart)
			{
				changes.range = elem.range.stretch(state.mouse.drag.timeDelta, state.mouse.dragOrig.range.end, state.mouse.dragOrig.range.start)
				if (elem.range.start.compare(state.mouse.dragOrig.range.start) == 0)
					changes.range = new Range(changes.range.start.snap(state.timeSnap), changes.range.end)
					
				changes.range = changes.range.sorted()
			}

			if (state.mouse.action & Editor.actionStretchTimeEnd)
			{
				changes.range = elem.range.stretch(state.mouse.drag.timeDelta, state.mouse.dragOrig.range.start, state.mouse.dragOrig.range.end)
				if (elem.range.end.compare(state.mouse.dragOrig.range.end) == 0)
					changes.range = new Range(changes.range.start, changes.range.end.snap(state.timeSnap))

				changes.range = changes.range.sorted()
			}

			if (state.mouse.action & Editor.actionDragPitchRow)
			{
				const keyCh = state.project.keyChanges.findActiveAt(elem.range.start)
				const key = keyCh ? keyCh.key : Editor.defaultKey()
				const degree = key.octavedDegreeForMidi(elem.pitch)
				const newPitch = key.midiForDegree(Math.floor(degree + pitchRowDelta))
				changes.pitch = newPitch
				soundPreview = TrackNotes.mergeSoundPreview(soundPreview, newPitch)
			}
			
			state = { ...state, project: state.project.update(elem.withChanges(changes)) }
		}
		
		state = Editor.soundPreviewSet(state, soundPreview)
		return state
	}
	
	
	static drawMove(state, trackIndex, input)
	{
		let draw = state.tracks[trackIndex].draw
		
		if (draw)
		{
			let time2 = input.mouse.time
			if (Math.abs(Editor.xAtTime(state, draw.time1) - Editor.xAtTime(state, time2)) < 5)
				time2 = draw.time1.add(state.timeSnap.multiply(new Rational(4)))
			
			draw = { ...draw, time2 }
		}
		
		return Track.update(state, trackIndex, { draw })
	}
	
	
	static drawEnd(state, trackIndex, input)
	{
		const draw = state.tracks[trackIndex].draw
		if (draw)
		{
			if (draw.kind == "note")
			{
				const note = new Project.Note(new Range(draw.time1, draw.time2).sorted(), draw.pitch)
				const id = state.project.nextId
				state = { ...state, project: state.project.upsertNote(note) }
				state = Track.selectionAdd(state, trackIndex, id)
				state = Editor.soundPreviewSet(state, TrackNotes.mergeSoundPreview(null, draw.pitch))
			}
		}
		
		return state
	}
	
	
	static keyCommandTimeShift(state, trackIndex, commandData)
	{
		for (const id of state.tracks[trackIndex].selection)
		{
			const elem = state.project.findById(id)
			if (!elem)
				continue
			
			let changes = {}
			changes.range = elem.range.displace(commandData.timeDelta)
			
			state = { ...state, project: state.project.update(elem.withChanges(changes)) }
		}
		
		return state
	}
	
	
	static keyCommandPitchShift(state, trackIndex, commandData)
	{
		let soundPreview = null

		for (const id of state.tracks[trackIndex].selection)
		{
			const elem = state.project.findById(id)
			if (!elem)
				continue
			
			let changes = {}
			if (commandData.diatonic)
			{
				const keyCh = state.project.keyChanges.findActiveAt(elem.range.start)
				const key = keyCh ? keyCh.key : Editor.defaultKey()
				const degree = key.octavedDegreeForMidi(elem.pitch)
				const newDegree = degree + commandData.degreeDelta
				const newPitch = key.midiForDegree(commandData.degreeDelta >= 0 ? Math.floor(newDegree) : Math.ceil(newDegree))
				changes.pitch = newPitch
			}
			else
				changes.pitch = elem.pitch + commandData.pitchDelta
			
			soundPreview = TrackNotes.mergeSoundPreview(soundPreview, changes.pitch)
			state = { ...state, project: state.project.update(elem.withChanges(changes)) }
		}
		
		state = Editor.soundPreviewSet(state, soundPreview)
		return state
	}


	static yForRow(state, trackIndex, row)
	{
		const track = state.tracks[trackIndex]
		return track.rect.h / 2 - (row + 1 + track.yScroll) * track.rowScale
	}
	
	
	static rowAtY(state, trackIndex, y, key)
	{
		const track = state.tracks[trackIndex]
		return Math.floor((track.rect.h / 2 - y) / track.rowScale - track.yScroll)
	}
	
	
	static rowForPitch(state, trackIndex, pitch, key)
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.octavedDegreeForMidi(pitch - 60) + tonicRowOffset
	}
	
	
	static pitchForRow(state, trackIndex, row, key)
	{
		const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
		return key.midiForDegree(row - Math.floor(tonicRowOffset)) + 60
	}


	static mergeSoundPreview(soundPreview, pitch)
	{
		if (soundPreview && soundPreview.pitch >= pitch)
			return soundPreview

		return { kind: "note", pitch }
	}
	
	
	static rectForNote(state, trackIndex, range, row, xStart, xEnd)
	{
		const track = state.tracks[trackIndex]
		
		const noteOrigX1 = Editor.xAtTime(state, range.start)
		const noteOrigX2 = Editor.xAtTime(state, range.end)
		
		const noteY = TrackNotes.yForRow(state, trackIndex, row)
		
		let noteX1 = Math.max(noteOrigX1, xStart)
		let noteX2 = Math.min(noteOrigX2, xEnd)
		
		const cutStart = noteOrigX1 < noteX1
		const cutEnd   = noteOrigX2 > noteX2
		
		if (!cutStart) noteX1 += 1
		if (!cutEnd)   noteX2 -= 1
		
		const noteW = Math.max(2, noteX2 - noteX1)
		
		return Object.assign(new Rect(noteX1, noteY, noteW, track.rowScale), { cutStart, cutEnd })
	}
	
	
	static *iterKeyChangesAtRange(state, trackIndex, range)
	{
		const defaultKey = Editor.defaultKey()
		
		for (const pair of state.project.keyChanges.iterActiveAtRangePairwise(range))
		{
			const keyCh1 = pair[0] || new Project.KeyChange(range.start, defaultKey)
			const keyCh2 = pair[1] || new Project.KeyChange(range.end,   defaultKey)
			
			const keyCh1X = Editor.xAtTime(state, keyCh1.time)
			const keyCh2X = Editor.xAtTime(state, keyCh2.time)
			
			yield [keyCh1, keyCh1X, keyCh2X]
		}
	}
	
	
	static *iterNotesAndKeyChangesAtRange(state, trackIndex, range)
	{
		const defaultKey = Editor.defaultKey()
		
		for (const pair of state.project.keyChanges.iterActiveAtRangePairwise(range))
		{
			const keyCh1 = pair[0] || new Project.KeyChange(range.start, defaultKey)
			const keyCh2 = pair[1] || new Project.KeyChange(range.end,   defaultKey)
			
			const keyCh1X = Editor.xAtTime(state, keyCh1.time)
			const keyCh2X = Editor.xAtTime(state, keyCh2.time)
			
			const time1 = keyCh1.time.max(range.start)
			const time2 = keyCh2.time.min(range.end)
			
			for (const note of state.project.notes.iterAtRange(new Range(time1, time2)))
				yield [note, keyCh1, keyCh1X, keyCh2X]
		}
	}
	
	
	static render(state, trackIndex, ctx)
	{
		const track = state.tracks[trackIndex]
		const visibleTimeRange = Editor.visibleTimeRange(state)

		for (const [keyCh, xMin, xMax] of TrackNotes.iterKeyChangesAtRange(state, trackIndex, visibleTimeRange))
		{
			const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(keyCh.key.tonic.chroma)

			const rowAtTop = TrackNotes.rowAtY(state, trackIndex, 0)
			const rowAtBottom = TrackNotes.rowAtY(state, trackIndex, track.rect.h)

			const octaveAtTop = Math.ceil(rowAtTop / 7) + 1
			const octaveAtBottom = Math.floor(rowAtBottom / 7) - 1
			
			for (let i = octaveAtBottom; i <= octaveAtTop; i++)
			{
				const y = TrackNotes.yForRow(state, trackIndex, tonicRowOffset + i * 7) + track.rowScale
				
				ctx.strokeStyle = "#000"
				ctx.beginPath()
				ctx.moveTo(xMin, y)
				ctx.lineTo(xMax, y)
				ctx.stroke()

				for (let j = 2; j < 7; j += 2)
				{
					const ySuboctave = TrackNotes.yForRow(state, trackIndex, tonicRowOffset + i * 7 + j) + track.rowScale
					
					ctx.globalAlpha = 0.025
					ctx.filltyle = "#000"
					ctx.fillRect(xMin, ySuboctave, xMax - xMin, track.rowScale)
					ctx.globalAlpha = 1
				}
				
				if (i == 0)
				{
					ctx.globalAlpha = 0.05
					ctx.fillStyle = "#fff"
					ctx.fillRect(xMin, y - 7 * track.rowScale, xMax - xMin, 7 * track.rowScale)
					ctx.globalAlpha = 1
				}
			}
		}
		
		for (const [note, keyCh, xMin, xMax] of TrackNotes.iterNotesAndKeyChangesAtRange(state, trackIndex, visibleTimeRange))
		{
			if (!state.playback.playing && track.selection.has(note.id))
				continue

			const row = TrackNotes.rowForPitch(state, trackIndex, note.pitch, keyCh.key)
			const mode = keyCh.key.scale.metadata.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(ctx, keyCh.key.degreeForMidi(note.pitch) + mode)
			const hovering = track.hover && track.hover.id == note.id
			const playing = state.playback.playing && note.range.overlapsPoint(state.playback.time)
			TrackNotes.renderNote(state, trackIndex, ctx, note.range, row, xMin, xMax, fillStyle, hovering, false, playing)
		}

		if (!state.playback.playing)
		{
			for (const [note, keyCh, xMin, xMax] of TrackNotes.iterNotesAndKeyChangesAtRange(state, trackIndex, visibleTimeRange))
			{
				if (!track.selection.has(note.id))
					continue

				const row = TrackNotes.rowForPitch(state, trackIndex, note.pitch, keyCh.key)
				const mode = keyCh.key.scale.metadata.mode
				const fillStyle = CanvasUtils.fillStyleForDegree(ctx, keyCh.key.degreeForMidi(note.pitch) + mode)
				const hovering = track.hover && track.hover.id == note.id
				TrackNotes.renderNote(state, trackIndex, ctx, note.range, row, xMin, xMax, fillStyle, hovering, true, false)
			}
		}

		const draw = state.tracks[trackIndex].draw
		if (draw)
		{
			ctx.globalAlpha = 0.6
			
			const keyCh = state.project.keyChanges.findActiveAt(draw.time1)
			const key = keyCh ? keyCh.key : Editor.defaultKey()
			const row = TrackNotes.rowForPitch(state, trackIndex, draw.pitch, key)
			const mode = key.scale.metadata.mode
			const fillStyle = CanvasUtils.fillStyleForDegree(ctx, key.degreeForMidi(draw.pitch) + mode)
			TrackNotes.renderNote(state, trackIndex, ctx, new Range(draw.time1, draw.time2).sorted(), row, -Infinity, Infinity, fillStyle)
			
			ctx.globalAlpha = 1
		}
	}
	
	
	static renderNote(state, trackIndex, ctx, range, row, xMin, xMax, fillStyle, hovering, selected, playing)
	{
		const rect = TrackNotes.rectForNote(state, trackIndex, range, row, xMin, xMax)
		
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