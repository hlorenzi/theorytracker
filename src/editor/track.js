import { default as Immutable } from "immutable"
import Editor from "./editor2.js"
import TrackMarkers from "./trackMarkers.js"
import TrackChords from "./trackChords.js"
import TrackNotes from "./trackNotes.js"
import Rational from "../util/rational.js"
import Range from "../util/range.js"
import Rect from "../util/rect.js"


export default class Track
{
	static init(state, action)
	{
		return {
			rect: new Rect(0, 0, 0, 0),
			yScroll: 0,
			hover: null,
			draw: null,
			selection: new Immutable.Set(),
			dragData: null,
		}
	}
	
	
	static handlerForTrackKind(kind)
	{
		switch (kind)
		{
			case "markers": return TrackMarkers
			case "chords": return TrackChords
			case "notes": return TrackNotes
			default: throw "invalid track kind"
		}
	}
	
	
	static dispatchDerived(fnName, state, trackIndex, args)
	{
		const handler = Track.handlerForTrackKind(state.tracks[trackIndex].kind)
		const fn = handler[fnName]
		if (!fn)
			return null
		
		return fn(state, trackIndex, args)
	}
	
	
	static update(state, trackIndex, newData)
	{
		const track =
		{
			...state.tracks[trackIndex],
			...newData
		}
		
		return {
			...state,
			tracks: [ ...state.tracks.slice(0, trackIndex), track, ...state.tracks.slice(trackIndex + 1) ],
		}
	}
	
	
	static hoveredIsSelected(state, trackIndex, args)
	{
		if (!state.tracks[trackIndex].hover)
			return false
		
		return state.tracks[trackIndex].selection.has(state.tracks[trackIndex].hover.id)
	}
	
	
	static hoveredSelect(state, trackIndex, args)
	{
		if (!state.tracks[trackIndex].hover)
			return state
		
		const id = state.tracks[trackIndex].hover.id

		state = Track.cursorSetAtElem(state, trackIndex, state.project.findById(id))
		return Track.selectionAdd(state, trackIndex, id)
	}
	
	
	static hoveredToggleSelection(state, trackIndex, args)
	{
		if (!state.tracks[trackIndex].hover)
			return state
		
		const id = state.tracks[trackIndex].hover.id

		state = Track.cursorSetAtElem(state, trackIndex, state.project.findById(id))
		
		if (state.tracks[trackIndex].selection.has(id))
			return Track.selectionRemove(state, trackIndex, id)
		else
			return Track.selectionAdd(state, trackIndex, id)
	}


	static hoveredPlaySoundPreview(state, trackIndex, args)
	{
		return Track.dispatchDerived("hoveredPlaySoundPreview", state, trackIndex, args) || state
	}


	static cursorSetAtElem(state, trackIndex, elem)
	{
		if (!elem)
			return state

		if (elem.time)
			return Editor.Cursor.place(state, elem.time, trackIndex)

		if (elem.range)
			return Editor.Cursor.place(state, elem.range.start, trackIndex)

		return state
	}
	
	
	static selectionClear(state, trackIndex, args)
	{
		return Track.update(state, trackIndex, { selection: new Immutable.Set() })
	}
	
	
	static selectionAdd(state, trackIndex, id)
	{
		return Track.update(state, trackIndex, { selection: state.tracks[trackIndex].selection.add(id) })
	}
	
	
	static selectionRemove(state, trackIndex, id)
	{
		return Track.update(state, trackIndex, { selection: state.tracks[trackIndex].selection.delete(id) })
	}
	
	
	static selectionRange(state, trackIndex)
	{
		let range = null

		for (const id of state.tracks[trackIndex].selection)
		{
			const elem = state.project.findById(id)
			if (!elem)
				continue

			if (elem.range)
				range = Range.merge(range, elem.range)
			else
				range = Range.merge(range, Range.fromPoint(elem.time))
		}
			
		return range
	}
	
	
	static selectionHasAny(state, trackIndex, args)
	{
		const res = Track.dispatchDerived("selectionHasAny", state, trackIndex, args)
		if (res !== null)
			return res
		
		for (const id of state.tracks[trackIndex].selection)
			if (state.project.findById(id))
				return true
			
		return false
	}
	
	
	static selectionDelete(state, trackIndex, args)
	{
		const res = Track.dispatchDerived("selectionDelete", state, trackIndex, args)
		if (res !== null)
			return res
		
		for (const id of state.tracks[trackIndex].selection)
			state = { ...state, project: state.project.removeById(id) }
		
		return state
	}
	
	
	static selectionAddAtCursor(state, trackIndex, args)
	{
		return Track.dispatchDerived("selectionAddAtCursor", state, trackIndex, args) || state
	}
	
	
	static selectionAddAtRect(state, trackIndex, args)
	{
		return Track.dispatchDerived("selectionAddAtRect", state, trackIndex, args) || state
	}
	
	
	static selectionAddToClipboard(state, trackIndex, args)
	{
		const res = Track.dispatchDerived("selectionAddToClipboard", state, trackIndex, args)
		if (res !== null)
			return res
		
		for (const id of state.tracks[trackIndex].selection)
		{
			const elem = state.project.findById(id)
			if (!elem)
				continue
				
			state = Editor.clipboardAdd(state, elem)
		}

		return state
	}
	
	
	static selectionRemoveConflictingBehind(state, trackIndex, args)
	{
		return Track.dispatchDerived("selectionRemoveConflictingBehind", state, trackIndex, args) || state
	}
	
	
	static clipboardPaste(state, trackIndex, args)
	{
		return Track.dispatchDerived("clipboardPaste", state, trackIndex, args) || state
	}
	
	
	static updateHover(state, trackIndex, args)
	{
		return Track.dispatchDerived("updateHover", state, trackIndex, args) || state
	}
	
	
	static previousAnchor(state, trackIndex, time)
	{
		return Track.dispatchDerived("previousAnchor", state, trackIndex, time) || null
	}
	
	
	static deleteRange(state, trackIndex, range)
	{
		return Track.dispatchDerived("deleteRange", state, trackIndex, range) || state
	}
	
	
	static pan(state, trackIndex, args)
	{
		return Track.dispatchDerived("pan", state, trackIndex, args) || state
	}
	
	
	static dragStart(state, trackIndex, args)
	{
		let elems = new Immutable.Map()
		for (const id of state.tracks[trackIndex].selection)
			elems = elems.set(id, state.project.findById(id))
		
		let dragData =
		{
			yScroll: state.tracks[trackIndex].yScroll,
			elems,
		}
	
		return Track.update(state, trackIndex, { dragData })
	}
	
	
	static drag(state, trackIndex, args)
	{
		return Track.dispatchDerived("drag", state, trackIndex, args) || state
	}
	
	
	static drawStart(state, trackIndex, args)
	{
		return Track.dispatchDerived("drawStart", state, trackIndex, args) || state
	}
	
	
	static drawMove(state, trackIndex, args)
	{
		return Track.dispatchDerived("drawMove", state, trackIndex, args) || state
	}
	
	
	static drawEnd(state, trackIndex, args)
	{
		return Track.dispatchDerived("drawEnd", state, trackIndex, args) || state
	}
	
	
	static keyCommandTimeShift(state, trackIndex, args)
	{
		return Track.dispatchDerived("keyCommandTimeShift", state, trackIndex, args) || state
	}
	
	
	static keyCommandPitchShift(state, trackIndex, args)
	{
		return Track.dispatchDerived("keyCommandPitchShift", state, trackIndex, args) || state
	}
	
	
	static render(state, trackIndex, args)
	{
		return Track.dispatchDerived("render", state, trackIndex, args) || state
	}
}