import { ContentManager, AppReducer } from "../AppState"
import EditorState, { EditorMode } from "./editorState"
import Track from "./track"
import TrackState from "./trackState"
import TrackStateManager from "./trackStateManager"
import TrackKeyChanges from "./trackKeyChanges"
import TrackMeterChanges from "./trackMeterChanges"
import Project from "../project/project2"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import * as Theory from "../theory/theory"
import DockableData from "../dockable/DockableData"
import { stat } from "fs"
import TrackPopup from "./TrackPopup"


export default class Editor
{
	static actionPan              = 0x01
	static actionSelectCursor     = 0x02
	static actionSelectRect       = 0x04
	static actionDraw             = 0x08
	static actionDragTime         = 0x10
	static actionDragPitchRow     = 0x20
	static actionStretchTimeStart = 0x40
	static actionStretchTimeEnd   = 0x80


	static makeNewFull(): EditorState
    {
        return {
			mode: EditorMode.Full,
			modeTracks: [],

			x: 0,
			y: 0,
            w: 0,
			h: 0,

			trackHeaderW: 200,
			
			tracks: [],
			trackScroll: 0,

			timeScroll: -0.5,
			timeScale: 100,
			timeSnap: new Rational(1, 16),
			timeSnapBase: new Rational(1, 16),

			cursor:
			{
				visible: true,
				time1: new Rational(0),
				time2: new Rational(0),
				track1: 0,
				track2: 0,
			},

			rectCursor:
			{
				track: 0,
				time1: new Rational(0),
				time2: new Rational(0),
				y1: 0,
				y2: 0,
			},

			keys: {},

			mouse:
			{
				down: false,
				downDate: new Date(),

				action: 0,

				pos: { x: 0, y: 0 },
				posPrev: { x: 0, y: 0 },
				time: new Rational(0),
				track: 0,
				trackPos: { x: 0, y: 0 },
				trackYRaw: 0,
				row: 0,

				hover: null,

				drag: {
					xLocked: true,
					yLocked: true,

					posOrigin: { x: 0, y: 0 },
					timeOrigin: new Rational(0),
					timeScrollOrigin: 0,
					rangeOrigin: new Range(new Rational(), new Rational()),
					trackOrigin: 0,
					trackScrollOrigin: 0,
					trackPosOrigin: { x: 0, y: 0 },
					trackYRawOrigin: 0,
					trackYScrollOrigin: 0,
					rowOrigin: 0,
					projectOrigin: Project.getDefault(),

					posDelta: { x: 0, y: 0 },
					timeDelta: new Rational(0),
					trackPosDelta: { x: 0, y: 0 },
					rowDelta: 0,
				},

				wheelDate: new Date(),
			},
        }
    }
	

	static makeNewNoteEditor(trackIds: number[]): EditorState
    {
		const state = Editor.makeNewFull()
		state.mode = EditorMode.NoteEditor
		state.modeTracks = trackIds
		return state
	}


	static init(state: ContentManager<EditorState>)
	{
		state.contentState = Editor.makeNewFull()
	}


    static resize(state: ContentManager<EditorState>, action: any)
    {
        state.mergeContentState({
			x: action.x,
			y: action.y,
            w: action.w,
            h: action.h,
        })
	}


	static tracksRefresh(state: ContentManager<EditorState>)
    {
		const tracks: TrackState[] = []

		for (let t = 0; t < state.appState.project.tracks.length; t++)
		{
			const track = state.appState.project.tracks[t]
			if (track.trackType == Project.TrackType.Notes)
			{
				if (state.contentState.mode == EditorMode.Full)
					tracks.push({
						type: "notesPreview",
						trackIndex: t,
						trackId: track.id,
						y: 0,
						h: 40,
						yScroll: 0,
						pinned: false,
					})
				else if (state.contentState.modeTracks.some(t => t == track.id))
					tracks.push({
						type: "notes",
						trackIndex: t,
						trackId: track.id,
						y: 0,
						h: 0,
						yScroll: 0,
						pinned: false,
					})
			}
			else if (track.trackType == Project.TrackType.KeyChanges)
				tracks.push({
					type: "keyChanges",
					trackIndex: t,
					trackId: track.id,
					y: 0,
					h: TrackKeyChanges.knobHeight,
					yScroll: 0,
					pinned: false,
				})
			else if (track.trackType == Project.TrackType.MeterChanges)
				tracks.push({
					type: "meterChanges",
					trackIndex: t,
					trackId: track.id,
					y: 0,
					h: TrackMeterChanges.knobHeight,
					yScroll: 0,
					pinned: false,
				})
		}

		let fixedH = 0
		for (let t = 0; t < tracks.length; t++)
		{
			if (tracks[t].h > 0)
				fixedH += tracks[t].h
		}
	
		for (let t = 0; t < tracks.length; t++)
		{
			if (tracks[t].h == 0)
				tracks[t].h = state.contentState.h - fixedH
		}

		let y = 0
		for (let t = 0; t < tracks.length; t++)
		{
			tracks[t].y = y
			y += tracks[t].h
		}

		state.mergeContentState({ tracks })
		
		for (let t = 0; t < state.contentState.tracks.length; t++)
			Track.execute("init", state, t)
	}
	
	
	static reduce_keyDown(state: ContentManager<EditorState>, action: any)
	{
        state.mergeContentState({
			keys: { ...state.contentState.keys, [action.key]: true },
		})
	}
	
	
	static reduce_keyUp(state: ContentManager<EditorState>, action: any)
	{
		let keys = { ...state.contentState.keys }
		delete keys[action.key]
		
        state.mergeContentState({ keys })
	}
	
	
	static reduce_keyCommand(state: ContentManager<EditorState>, action: any)
	{
		
	}
	
	
	static reduce_mouseMove(state: ContentManager<EditorState>, action: any)
	{
		const track = Editor.trackAtY(state, state.contentState.mouse.pos.y)
		const trackDrag = !state.contentState.mouse.down ? track : state.contentState.mouse.drag.trackOrigin

		const trackX = action.pos.x - state.contentState.trackHeaderW
		const trackYRaw = state.contentState.mouse.pos.y - Editor.trackY(state, trackDrag)
		const trackY = trackYRaw + state.contentState.tracks[trackDrag].yScroll
		const trackPos = { x: trackX, y: trackY }
		
		const row = Track.execute("rowAtY", state, trackDrag, trackY)

		state.mergeContentState({
			mouse: {
				...state.contentState.mouse,
				pos: action.pos,
				posPrev: state.contentState.mouse.pos,
				time: Editor.timeAtX(state, trackX),
				track,
				trackPos,
				trackYRaw,
				row,
			}
		})
		
		if (!state.contentState.mouse.down)
		{
			state.mergeContentState({
				mouse: {
					...state.contentState.mouse,
					hover: null,
				}
			})

			if (state.contentState.keys[state.appState.prefs.editor.keyDraw])
			{
				for (let t = 0; t < state.contentState.tracks.length; t++)
				{
					if (t == state.contentState.mouse.track)
						Track.execute("drawHover", state, t)
					else
						Track.execute("drawClear", state, t)
				}
			}
			else
			{
				for (let t = 0; t < state.contentState.tracks.length; t++)
				{
					Track.execute("drawClear", state, t)

					if (t == state.contentState.mouse.track)
						Track.execute("hover", state, t)
				}
			}
		}
		else
		{
			const posDelta = {
				x: state.contentState.mouse.pos.x - state.contentState.mouse.drag.posOrigin.x,
				y: state.contentState.mouse.pos.y - state.contentState.mouse.drag.posOrigin.y,
			}

			const timeDelta =
				state.contentState.mouse.time.subtract(state.contentState.mouse.drag.timeOrigin)

			const trackPosDelta = {
				x: state.contentState.mouse.trackPos.x - state.contentState.mouse.drag.trackPosOrigin.x,
				y: state.contentState.mouse.trackPos.y - state.contentState.mouse.drag.trackPosOrigin.y,
			}

			const rowDelta = state.contentState.mouse.row - state.contentState.mouse.drag.rowOrigin

			const xLocked = state.contentState.mouse.drag.xLocked && Math.abs(posDelta.x) < state.appState.prefs.editor.mouseDragXLockedDistance
			const yLocked = state.contentState.mouse.drag.yLocked && Math.abs(posDelta.y) < state.appState.prefs.editor.mouseDragYLockedDistance
			
			state.mergeContentState({
				mouse: {
					...state.contentState.mouse,
					drag: {
						...state.contentState.mouse.drag,
						xLocked,
						yLocked,
						posDelta,
						timeDelta,
						trackPosDelta,
						rowDelta,
					},
				},
			})
			
			if (state.contentState.mouse.action == Editor.actionPan)
			{
				state.mergeContentState({
					timeScroll: state.contentState.mouse.drag.timeScrollOrigin - state.contentState.mouse.drag.posDelta.x / state.contentState.timeScale,
				})

				if (state.contentState.mouse.drag.posOrigin.x > state.contentState.trackHeaderW &&
					Track.execute("yScrollEnabled", state, state.contentState.mouse.drag.trackOrigin))
				{
					const trackState = new TrackStateManager<TrackState>(state, state.contentState.mouse.drag.trackOrigin)
					const yScroll =
						state.contentState.mouse.drag.trackYScrollOrigin -
						state.contentState.mouse.drag.posDelta.y
		
					trackState.mergeTrackState({ yScroll })
				}
				else
				{
					const lastTrack = state.contentState.tracks[state.contentState.tracks.length - 1]
					const trackScroll =
						Math.max(0,
						Math.min(
							lastTrack.y + lastTrack.h - state.contentState.h,
							state.contentState.mouse.drag.trackScrollOrigin - state.contentState.mouse.drag.posDelta.y))
					
					state.mergeContentState({ trackScroll })
				}
			}
			else if (state.contentState.mouse.action == Editor.actionSelectCursor)
			{
				Editor.cursorDrag(state, state.contentState.mouse.time, state.contentState.mouse.track)
				Editor.selectionClear(state)
				Editor.selectionAddAtCursor(state)
				Editor.handleEdgeScroll(state, false)
			}
			else if (state.contentState.mouse.action == Editor.actionSelectRect)
			{
				state.mergeContentState({
					rectCursor: { ...state.contentState.rectCursor,
						time2: state.contentState.mouse.time,
						y2: state.contentState.mouse.trackPos.y,
					},
				})

				Editor.selectionClear(state)
				Editor.selectionAddAtRectCursor(state)
				Editor.handleEdgeScroll(state, true)
			}
			else if (state.contentState.mouse.action == Editor.actionDraw)
			{
				Track.execute("drawDrag", state, state.contentState.mouse.drag.trackOrigin)
				Editor.handleEdgeScroll(state, false)
			}
			else
			{
				Editor.drag(state)
				Editor.handleEdgeScroll(state, true)
			}
		}
	}


	static drag(state: ContentManager<EditorState>)
	{
		let mouseActionBlocked = 0
		if (state.contentState.mouse.drag.xLocked)
			mouseActionBlocked |= Editor.actionDragTime | Editor.actionStretchTimeEnd | Editor.actionStretchTimeStart

		if (state.contentState.mouse.drag.yLocked)
			mouseActionBlocked |= Editor.actionDragPitchRow

		const mouseAction = state.contentState.mouse.action & ~mouseActionBlocked
		const mouseDrag = state.contentState.mouse.drag

		for (const id of state.appState.selection)
		{
			const elem = mouseDrag.projectOrigin.elems.get(id)
			if (!elem)
				continue
			
			let changes: any = {}

			if (elem.type == Project.ElementType.Note)
			{
				const rangedElem = elem as any as Project.RangedElement

				if (mouseAction & Editor.actionDragTime)
					changes.range = rangedElem.range.displace(mouseDrag.timeDelta)
				
				if (mouseAction & Editor.actionStretchTimeStart)
				{
					changes.range = rangedElem.range.stretch(mouseDrag.timeDelta, mouseDrag.rangeOrigin.end, mouseDrag.rangeOrigin.start)
					if (rangedElem.range.start.compare(mouseDrag.rangeOrigin.start) == 0)
						changes.range = new Range(changes.range.start.snap(state.contentState.timeSnap), changes.range.end)
						
					changes.range = changes.range.sorted()
				}
	
				if (mouseAction & Editor.actionStretchTimeEnd)
				{
					changes.range = rangedElem.range.stretch(mouseDrag.timeDelta, mouseDrag.rangeOrigin.start, mouseDrag.rangeOrigin.end)
					if (rangedElem.range.end.compare(mouseDrag.rangeOrigin.end) == 0)
						changes.range = new Range(changes.range.start, changes.range.end.snap(state.contentState.timeSnap))
	
					changes.range = changes.range.sorted()
				}
			
				if (mouseAction & Editor.actionDragPitchRow)
				{
					const note = rangedElem as Project.Note
					const key = Editor.keyAt(state, state.contentState.tracks[state.contentState.mouse.drag.trackOrigin].trackId, rangedElem.range.start)
					const degree = key.octavedDegreeForMidi(note.pitch)
					const newPitch = key.midiForDegree(Math.floor(degree + mouseDrag.rowDelta))
					changes.pitch = newPitch
				}
				
				const newRangedElem = Project.RangedElement.withChanges(rangedElem, changes)
					
				state.mergeAppState({
					project: Project.upsertRangedElement(state.appState.project, newRangedElem)
				})
			}

			else if (elem.type == Project.ElementType.KeyChange ||
				elem.type == Project.ElementType.MeterChange)
			{
				const timedElem = elem as any as Project.TimedElement

				if (mouseAction & Editor.actionDragTime)
					changes.time = timedElem.time.add(mouseDrag.timeDelta).snap(state.contentState.timeSnap)
				
				if (mouseAction & Editor.actionStretchTimeStart)
				{
					changes.time = timedElem.time.stretch(mouseDrag.timeDelta, mouseDrag.rangeOrigin.end, mouseDrag.rangeOrigin.start)
					if (timedElem.time.compare(mouseDrag.rangeOrigin.start) == 0)
						changes.time = changes.time.snap(state.contentState.timeSnap)
				}
	
				if (mouseAction & Editor.actionStretchTimeEnd)
				{
					changes.time = timedElem.time.stretch(mouseDrag.timeDelta, mouseDrag.rangeOrigin.start, mouseDrag.rangeOrigin.end)
					if (timedElem.time.compare(mouseDrag.rangeOrigin.start) == 0)
						changes.time = changes.time.snap(state.contentState.timeSnap)
				}
				
				const newTimedElem = Project.TimedElement.withChanges(timedElem, changes)
					
				state.mergeAppState({
					project: Project.upsertTimedElement(state.appState.project, newTimedElem)
				})
			}
		}
	}
	
	
	static reduce_mouseDown(state: ContentManager<EditorState>, action: any)
	{
		if (state.contentState.mouse.down)
			return

		const now = new Date()
		const timeSinceLastDown = now.getTime() - state.contentState.mouse.downDate.getTime()
		const isDoubleClick = timeSinceLastDown < 250

		state.mergeContentState({
			mouse: { ...state.contentState.mouse,
				down: true,
				downDate: now,
				drag: { ...state.contentState.mouse.drag,
					xLocked: true,
					yLocked: true,
					posOrigin: state.contentState.mouse.pos,
					timeOrigin: state.contentState.mouse.time,
					timeScrollOrigin: state.contentState.timeScroll,
					trackScrollOrigin: state.contentState.trackScroll,
					trackOrigin: state.contentState.mouse.track,
					trackPosOrigin: state.contentState.mouse.trackPos,
					trackYRawOrigin: state.contentState.mouse.trackYRaw,
					trackYScrollOrigin: state.contentState.tracks[state.contentState.mouse.track].yScroll,
					rowOrigin: state.contentState.mouse.row,
					projectOrigin: state.appState.project,
				},
				action: 0,
			}
		})

		Editor.popupClear(state)

		if (action.rightButton || state.contentState.keys[state.appState.prefs.editor.keyPan])
		{
			state.mergeContentState({
				mouse: { ...state.contentState.mouse,
					action: Editor.actionPan
				}
			})
		}
		else if (state.contentState.keys[state.appState.prefs.editor.keySelectRect])
		{
			Editor.cursorSetVisible(state, false)

			state.mergeContentState({
				rectCursor: {
					track: state.contentState.mouse.track,
					time1: state.contentState.mouse.time,
					time2: state.contentState.mouse.time,
					y1: state.contentState.mouse.trackPos.y,
					y2: state.contentState.mouse.trackPos.y,
				},
				mouse: { ...state.contentState.mouse,
					action: Editor.actionSelectRect,
				}
			})
		}
		else if (state.contentState.keys[state.appState.prefs.editor.keyDraw])
		{
			Editor.cursorSetVisible(state, false)
			Editor.selectionClear(state)
			Track.execute("drawStart", state, state.contentState.mouse.track)

			state.mergeContentState({
				mouse: { ...state.contentState.mouse,
					action: Editor.actionDraw,
				}
			})
		}
		else
		{
			const selectMultiple = state.contentState.keys[state.appState.prefs.editor.keySelectMultiple]

			if (isDoubleClick && state.contentState.mode == EditorMode.Full)
			{
				let noteEditorState = Editor.makeNewNoteEditor([state.contentState.tracks[state.contentState.mouse.track].trackId])
				noteEditorState.timeScale = state.contentState.timeScale
				noteEditorState.timeScroll = state.contentState.timeScroll

				state.appState = AppReducer.createOrUpdateTab(
					state.appState, state.contentId,
					"editorNotes", noteEditorState)

				state.mergeContentState({
					mouse: { ...state.contentState.mouse,
						down: false,
					}
				})
			}
			else if (state.contentState.mouse.hover)
			{
				const alreadySelected = state.appState.selection.has(state.contentState.mouse.hover.id)

				if (!selectMultiple && !alreadySelected)
					Editor.selectionClear(state)

				if (!alreadySelected || !selectMultiple)
					Editor.selectionAdd(state, state.contentState.mouse.hover.id)
				else
					Editor.selectionRemove(state, state.contentState.mouse.hover.id)
				
				Editor.cursorSetVisible(state, false)

				state.mergeContentState({
					mouse: { ...state.contentState.mouse,
						drag: { ...state.contentState.mouse.drag,
							rangeOrigin: Editor.selectionRange(state)!,
						},
						action: state.contentState.mouse.hover.action,
					}
				})
			}
			else
			{
				if (!selectMultiple)
					Editor.selectionClear(state)

				Editor.cursorPlace(state, state.contentState.mouse.time, state.contentState.mouse.track)
				Editor.cursorSetVisible(state, true)
				state.mergeContentState({
					mouse: { ...state.contentState.mouse,
						action: Editor.actionSelectCursor,
					}
				})
			}
		}
	}
	
	
	static reduce_mouseUp(state: ContentManager<EditorState>, action: any)
	{
		if (!state.contentState.mouse.down)
			return state

		if (state.contentState.mouse.action == Editor.actionDraw)
		{
			Track.execute("drawEnd", state, state.contentState.mouse.track)
		}
		else if (state.contentState.mouse.action == Editor.actionPan &&
			state.contentState.mouse.drag.xLocked &&
			state.contentState.mouse.drag.yLocked)
		{
			if (state.contentState.mouse.pos.x < state.contentState.trackHeaderW)
			{
				state.appState = AppReducer.createPopup(
					state.appState,
					new Rect(
						state.contentState.x + state.contentState.mouse.pos.x,
						state.contentState.y + state.contentState.mouse.pos.y,
						0, 0),
					TrackPopup, {})
			}
			else if (state.contentState.mouse.hover)
			{
				Editor.selectionClear(state)
				Editor.selectionAdd(state, state.contentState.mouse.hover.id)
				Track.execute("popup", state, state.contentState.mouse.track)
			}
		}

		state.mergeContentState({
			mouse: { ...state.contentState.mouse,
				down: false,
				action: 0,
			}
		})
	}
	
	
	static reduce_mouseWheel(state: ContentManager<EditorState>, action: any)
	{
		if (Math.abs(action.deltaX) > 0)
		{
			let timeScroll = state.contentState.timeScroll + 0.01 / (state.contentState.timeScale / 100) * action.deltaX
			let wheelDate = new Date()

			state.mergeContentState({
				timeScroll,
				mouse: { ...state.contentState.mouse,
					wheelDate
				}
			})
		}
		else if (new Date().getTime() - state.contentState.mouse.wheelDate.getTime() > 250)
		{
			const snap = new Rational(1, 1024)
			const prevMouseTime = Editor.timeAtX(state, state.contentState.mouse.pos.x - state.contentState.trackHeaderW, snap)
			
			let timeScale = state.contentState.timeScale * (action.deltaY > 0 ? 0.8 : 1.25)
			timeScale = Math.max(4, Math.min(2048, timeScale))
			state.mergeContentState({ timeScale })
			
			const newMouseTime = Editor.timeAtX(state, state.contentState.mouse.pos.x - state.contentState.trackHeaderW, snap)
			
			const timeScroll = state.contentState.timeScroll - newMouseTime.subtract(prevMouseTime).asFloat()
			
			const timeSnapAdjustThresholdUpper = 24
			const timeSnapAdjustThresholdLower = 8
			let timeSnap = state.contentState.timeSnapBase
			
			if (timeSnap.asFloat() * timeScale > timeSnapAdjustThresholdUpper)
				while (timeSnap.asFloat() * timeScale > timeSnapAdjustThresholdUpper)
					timeSnap = timeSnap.divide(new Rational(2))
				
			else if (timeSnap.asFloat() * timeScale < timeSnapAdjustThresholdLower)
				while (timeSnap.asFloat() * timeScale < timeSnapAdjustThresholdLower)
					timeSnap = timeSnap.divide(new Rational(1, 2))
				
			state.mergeContentState({ timeScroll, timeSnap })
		}
	}

			
	static handleEdgeScroll(state: ContentManager<EditorState>, handleYScroll: boolean)
	{
		const threshold = state.appState.prefs.editor.mouseEdgeScrollThreshold
		const speed = state.appState.prefs.editor.mouseEdgeScrollSpeed

		const mouseX = state.contentState.mouse.pos.x - state.contentState.trackHeaderW

		let timeScroll = state.contentState.timeScroll

		if (mouseX > state.contentState.w - state.contentState.trackHeaderW - threshold)
			timeScroll += state.contentState.timeSnap.asFloat() * speed

		else if (mouseX < threshold)
			timeScroll -= state.contentState.timeSnap.asFloat() * speed

		state.mergeContentState({ timeScroll })

		if (handleYScroll &&
			Track.execute("yScrollEnabled", state, state.contentState.mouse.drag.trackOrigin))
		{
			const threshold = state.appState.prefs.editor.mouseEdgeScrollThreshold
			const speed = state.appState.prefs.editor.mouseEdgeScrollSpeed * 2
	
			const mouseY = state.contentState.mouse.trackYRaw

			const trackState = new TrackStateManager<TrackState>(state, state.contentState.mouse.drag.trackOrigin)
	
			if (mouseY > trackState.trackState.h - threshold)
				trackState.mergeTrackState({ yScroll: trackState.trackState.yScroll + speed })
	
			else if (mouseY < threshold)
				trackState.mergeTrackState({ yScroll: trackState.trackState.yScroll - speed })
		}
	}
	
	
	static popup(state: ContentManager<EditorState>, trackIndex: number, type: string, rect: Rect, popupState: any)
	{
		const x = state.contentState.x + state.contentState.trackHeaderW
		const y = state.contentState.y + Editor.trackY(state, trackIndex)

		state.appState = AppReducer.createFloating(state.appState, type, popupState, rect.displace(x, y))
	}
	
	
	static popupClear(state: ContentManager<EditorState>)
	{
		state.appState = AppReducer.removeFloating(state.appState, "inspector")
	}
	
	
	static cursorSetVisible(state: ContentManager<EditorState>, visible: boolean)
	{
		state.mergeContentState({
			cursor: {
				...state.contentState.cursor,
				visible,
			}
		})
	}
	
	
	static cursorPlace(state: ContentManager<EditorState>, time: Rational | null, trackIndex: number | null)
	{
		if (trackIndex !== null)
			trackIndex = Math.max(0, Math.min(state.contentState.tracks.length - 1, trackIndex))

		const cursor = state.contentState.cursor

		state.mergeContentState({
			cursor: { ...cursor,
				time1: time === null ? cursor.time1 : time,
				time2: time === null ? cursor.time2 : time,
				track1: trackIndex === null ? cursor.track1 : trackIndex,
				track2: trackIndex === null ? cursor.track2 : trackIndex,
			},
		})
	}
	
	
	static cursorDrag(state: ContentManager<EditorState>, time: Rational | null, trackIndex: number | null)
	{
		if (trackIndex !== null)
			trackIndex = Math.max(0, Math.min(state.contentState.tracks.length - 1, trackIndex))

		const cursor = state.contentState.cursor

		state.mergeContentState({
			cursor: { ...cursor,
				time2: time === null ? cursor.time2 : time,
				track2: trackIndex === null ? cursor.track2 : trackIndex,
			},
		})
	}


	static selectionAdd(state: ContentManager<EditorState>, id: number)
	{
		state.mergeAppState({
			selection: state.appState.selection.add(id),
		})
	}


	static selectionAddAtCursor(state: ContentManager<EditorState>)
	{
		const trackMin = Math.min(state.contentState.cursor.track1, state.contentState.cursor.track2)
		const trackMax = Math.max(state.contentState.cursor.track1, state.contentState.cursor.track2)
		
		const time1 = state.contentState.cursor.time1
		const time2 = state.contentState.cursor.time2
		if (time1.compare(time2) != 0)
		{
			let selection = state.appState.selection

			const range = new Range(time1, time2, false, false).sorted()

			for (let t = trackMin; t <= trackMax; t++)
			{
				const elems = Track.execute("elemsAt", state, t, { range })

				for (const elem of elems)
					selection = selection.add(elem)
			}

			state.mergeAppState({ selection })
		}
	}


	static selectionAddAtRectCursor(state: ContentManager<EditorState>)
	{
		const track = state.contentState.rectCursor.track
		
		const time1 = state.contentState.rectCursor.time1
		const time2 = state.contentState.rectCursor.time2
		if (time1.compare(time2) != 0)
		{
			let selection = state.appState.selection

			const range = new Range(time1, time2, false, false).sorted()
			const y1 = Math.min(state.contentState.rectCursor.y1, state.contentState.rectCursor.y2)
			const y2 = Math.max(state.contentState.rectCursor.y1, state.contentState.rectCursor.y2)
			const elems = Track.execute("elemsAt", state, track, { range, y1, y2 })

			for (const elem of elems)
				selection = selection.add(elem)

			state.mergeAppState({ selection })
		}
	}


	static selectionRemove(state: ContentManager<EditorState>, id: number)
	{
		state.mergeAppState({
			selection: state.appState.selection.remove(id),
		})
	}


	static selectionClear(state: ContentManager<EditorState>)
	{
		state.mergeAppState({
			selection: state.appState.selection.clear(),
		})
	}


	static selectionRange(state: ContentManager<EditorState>): Range | null
	{
		let range: Range | null = null

		for (const id of state.appState.selection)
		{
			const elem = state.appState.project.elems.get(id) as any
			if (!elem)
				continue

			if (elem.range)
			{
				const rangedElem = elem as Project.RangedElement
				range = Range.merge(range, rangedElem.range)
			}

			else if (elem.time)
			{
				const timedElem = elem as Project.TimedElement
				range = Range.merge(range, Range.fromPoint(timedElem.time))
			}
		}

		return range
	}


	static xAtTime(state: ContentManager<EditorState>, time: Rational): number
	{
		return (time.asFloat() - state.contentState.timeScroll) * state.contentState.timeScale
	}
	
	
	static timeAtX(state: ContentManager<EditorState>, x: number, timeSnap?: Rational): Rational
	{
		timeSnap = timeSnap || state.contentState.timeSnap
		const time = x / state.contentState.timeScale + state.contentState.timeScroll
		return Rational.fromFloat(time, timeSnap.denominator)
	}
	
	
	static timeRangeAtX(state: ContentManager<EditorState>, x1: number, x2: number, timeSnap?: Rational)
	{
		timeSnap = timeSnap || state.contentState.timeSnap
		return new Range(
			Editor.timeAtX(state, x1, timeSnap).subtract(timeSnap),
			Editor.timeAtX(state, x2, timeSnap).add(timeSnap))
	}


	static trackY(state: ContentManager<EditorState>, trackIndex: number): number
	{
		return state.contentState.tracks[trackIndex].y - state.contentState.trackScroll
	}


	static trackAtY(state: ContentManager<EditorState>, y: number): number
	{
		y += state.contentState.trackScroll

		if (y < 0)
			return 0

		for (let t = 0; t < state.contentState.tracks.length; t++)
		{
			const track = state.contentState.tracks[t]

			if (y >= track.y && y <= track.y + track.h)
				return t
		}

		return state.contentState.tracks.length - 1
	}


	static rectForTrack(state: ContentManager<EditorState>, trackIndex: number): Rect | null
	{
		let y = 0
		for (let t = 0; t < state.contentState.tracks.length; t++)
		{
			const h = state.contentState.tracks[t].h

			if (t == trackIndex)
			{
				return new Rect(
					state.contentState.trackHeaderW,
					y,
					state.contentState.w - state.contentState.trackHeaderW,
					h)
			}

			y += h
		}

		return null
	}
	
	
	static visibleTimeRange(state: ContentManager<EditorState>): Range
	{
		return new Range(
			Editor.timeAtX(state, 0).subtract(state.contentState.timeSnap),
			Editor.timeAtX(state, state.contentState.w).add(state.contentState.timeSnap))
	}
    

    static keyAt(state: ContentManager<EditorState>, trackId: Project.ID, time: Rational): Theory.Key
    {
        const keyChangeTrackId = Project.keyChangeTrackForTrack(state.appState.project, trackId)
        const keyChangeTrackTimedElems = state.appState.project.timedLists.get(keyChangeTrackId)
        if (!keyChangeTrackTimedElems)
			return Editor.defaultKey()
			
		const keyCh = keyChangeTrackTimedElems.findActiveAt(time)
		if (keyCh)
			return (keyCh as Project.KeyChange).key

        const firstKeyCh = keyChangeTrackTimedElems.findFirst()
		if (firstKeyCh)
			return (firstKeyCh as Project.KeyChange).key
			
		return Editor.defaultKey()
    }
    

    static meterAt(state: ContentManager<EditorState>, trackId: Project.ID, time: Rational): Theory.Meter
    {
        const meterChangeTrackId = Project.meterChangeTrackForTrack(state.appState.project, trackId)
        const meterChangeTrackTimedElems = state.appState.project.timedLists.get(meterChangeTrackId)
        if (!meterChangeTrackTimedElems)
			return Editor.defaultMeter()
			
		const meterCh = meterChangeTrackTimedElems.findActiveAt(time)
		if (meterCh)
			return (meterCh as Project.MeterChange).meter

        const firstMeterCh = meterChangeTrackTimedElems.findFirst()
		if (firstMeterCh)
			return (firstMeterCh as Project.MeterChange).meter
			
		return Editor.defaultMeter()
    }


	static defaultKey(): Theory.Key
	{
		return Theory.Key.parse("C Major")
	}


	static defaultMeter(): Theory.Meter
	{
		return new Theory.Meter(4, 4)
	}
	
	
	static render(state: ContentManager<EditorState>, ctx: CanvasRenderingContext2D)
	{
		ctx.save()
		
		ctx.fillStyle = state.appState.prefs.editor.bkgColor
		ctx.fillRect(0, 0, state.contentState.w, state.contentState.h)

		ctx.save()
		ctx.translate(state.contentState.trackHeaderW, 0)

		ctx.beginPath()
		ctx.rect(
			0,
			0,
			state.contentState.w - state.contentState.trackHeaderW,
			state.contentState.h)
		ctx.clip()

		Editor.renderCursorHighlight(state, ctx)
		Editor.renderBackgroundMeasures(state, ctx)

		ctx.restore()
		
		let y = -state.contentState.trackScroll
		for (let t = 0; t < state.contentState.tracks.length; t++)
		{
			ctx.save()
			ctx.translate(state.contentState.trackHeaderW, y)
			
			ctx.beginPath()
			ctx.rect(
				0,
				1,
				state.contentState.w - state.contentState.trackHeaderW,
				state.contentState.tracks[t].h - 1)
			ctx.clip()

			ctx.translate(0, -state.contentState.tracks[t].yScroll)

			Editor.renderRectCursorHighlight(state, ctx, t)
			Track.execute("render", state, t, ctx)
			Editor.renderRectCursorContour(state, ctx, t)

			ctx.restore()

			y += state.contentState.tracks[t].h
			
			ctx.strokeStyle = state.appState.prefs.editor.trackHBorderColor
			ctx.beginPath()
			ctx.moveTo(0, y + 0.5)
			ctx.lineTo(state.contentState.w, y + 0.5)
			ctx.stroke()
		}
		
		if (state.contentState.cursor.visible)
		{
			ctx.save()
			ctx.translate(state.contentState.trackHeaderW, 0)

			ctx.beginPath()
			ctx.rect(
				0,
				0,
				state.contentState.w - state.contentState.trackHeaderW,
				state.contentState.h)
			ctx.clip()

			const timeMin = state.contentState.cursor.time1.min(state.contentState.cursor.time2)!
			const timeMax = state.contentState.cursor.time1.max(state.contentState.cursor.time2)!
			Editor.renderCursorBeam(state, ctx, timeMin, false)
			Editor.renderCursorBeam(state, ctx, timeMax, true)

			ctx.restore()
		}
        
		ctx.strokeStyle = state.appState.prefs.editor.trackVBorderColor
		ctx.beginPath()
		ctx.moveTo(state.contentState.trackHeaderW + 0.5, 0)
		ctx.lineTo(state.contentState.trackHeaderW + 0.5, state.contentState.h)
		ctx.stroke()

        ctx.restore()
    }
	
	
	static renderBackgroundMeasures(state: ContentManager<EditorState>, ctx: CanvasRenderingContext2D)
	{
		const visibleRange = Editor.visibleTimeRange(state)
		
		/*ctx.fillStyle = "#1b191c"
		
		const songXMin = Editor.xAtTime(state, state.project.range.start)
		const songXMax = Editor.xAtTime(state, state.project.range.end)
		
		if (songXMin > 0)
			ctx.fillRect(0, 0, songXMin, state.h)

		if (songXMax < state.w)
			ctx.fillRect(songXMax, 0, state.w - songXMax, state.h)*/

		const meterChangeTrackId = Project.meterChangeTrackForTrack(state.appState.project, 0)
		const meterChangeList = state.appState.project.timedLists.get(meterChangeTrackId)!

		for (let [meterCh1Raw, meterCh2Raw] of meterChangeList.iterActiveAtRangePairwise(visibleRange))
		{
			let timeMin = (meterCh1Raw ? meterCh1Raw.time : null)
			let timeMax = (meterCh2Raw ? meterCh2Raw.time : visibleRange.end)

			let measureAlternate = true

			let meterCh1 = meterCh1Raw as (Project.MeterChange | null)
			let meterCh2 = meterCh2Raw as (Project.MeterChange | null)

			if (!meterCh1)
			{
				if (!meterCh2)
					continue
				
				meterCh1 = meterCh2
				timeMin = meterCh2.time
				while (timeMin.compare(visibleRange.start) > 0)
				{
					timeMin = timeMin.subtract(meterCh2.meter.fullCycleDuration)

					if (meterCh2.meter.alternatingMeasureCount % 2 != 0)
						measureAlternate = !measureAlternate
				}
			}
			
			const meterCh1X = 0.5 + Math.floor(Editor.xAtTime(state, timeMin!))
			const meterCh2X = 0.5 + Math.floor(Editor.xAtTime(state, timeMax))

			ctx.strokeStyle = state.appState.prefs.editor.meterChangeColor
			ctx.lineCap = "square"
			ctx.lineWidth = 1
			
			for (const [measureN, measureD, time1, time2] of meterCh1.meter.iterMeasuresPairwise(timeMin))
			{
				measureAlternate = !measureAlternate

				if (time2.compare(visibleRange.start) < 0)
					continue

				if (time1.compare(timeMax) > 0 || time1.compare(visibleRange.end) > 0)
					break

				const measureX1 = 0.5 + Math.floor(Editor.xAtTime(state, time1))
				const measureX2 = 0.5 + Math.floor(Editor.xAtTime(state, time2))

				if (measureAlternate)
				{
					const x1 = Math.min(meterCh2X, measureX1)
					const x2 = Math.min(meterCh2X, measureX2)
					
					ctx.fillStyle = state.appState.prefs.editor.measureAlternateBkgColor
					ctx.fillRect(x1, 0, x2 - x1, state.contentState.h)
				}

				if (time1.compare(meterCh1.time) == 0)
					ctx.strokeStyle = state.appState.prefs.editor.meterChangeColor
				else
					ctx.strokeStyle = state.appState.prefs.editor.measureColor

				ctx.beginPath()
				ctx.moveTo(measureX1, 0)
				ctx.lineTo(measureX1, state.contentState.h)
				ctx.stroke()

				const halfSubmeasureSize = Editor.xAtTime(state, new Rational(1, measureD * 2)) - Editor.xAtTime(state, new Rational(0))
				if (halfSubmeasureSize > 16)
				{
					let halfSubmeasureTime = time1.add(new Rational(-1, measureD * 2))
					for (let sub = 1; sub <= measureN; sub++)
					{
						halfSubmeasureTime = halfSubmeasureTime.add(new Rational(2, measureD * 2))
						
						const halfSubmeasureX = 0.5 + Math.floor(Editor.xAtTime(state, halfSubmeasureTime))
						if (halfSubmeasureX >= meterCh1X && halfSubmeasureX <= meterCh2X)
						{
							ctx.strokeStyle = state.appState.prefs.editor.halfSubmeasureColor
							ctx.beginPath()
							ctx.moveTo(halfSubmeasureX, 0)
							ctx.lineTo(halfSubmeasureX, state.contentState.h)
							ctx.stroke()
						}
					}
				}
				
				const submeasureSize = Editor.xAtTime(state, new Rational(1, measureD)) - Editor.xAtTime(state, new Rational(0))
				if (submeasureSize > 8)
				{
					let submeasureTime = time1
					for (let sub = 1; sub <= measureN; sub++)
					{
						submeasureTime = submeasureTime.add(new Rational(1, measureD))
						
						const submeasureX = 0.5 + Math.floor(Editor.xAtTime(state, submeasureTime))
						if (submeasureX >= meterCh1X && submeasureX <= meterCh2X)
						{
							ctx.strokeStyle = state.appState.prefs.editor.submeasureColor
							ctx.beginPath()
							ctx.moveTo(submeasureX, 0)
							ctx.lineTo(submeasureX, state.contentState.h)
							ctx.stroke()
						}
					}
				}
			}
		}
		
		const keyChangeTrackId = Project.keyChangeTrackForTrack(state.appState.project, 0)
		const keyChangeList = state.appState.project.timedLists.get(keyChangeTrackId)!

		for (const keyCh of keyChangeList.iterAtRange(visibleRange))
		{
			const keyChX = 0.5 + Math.floor(Editor.xAtTime(state, keyCh.time))
			
			ctx.strokeStyle = state.appState.prefs.editor.keyChangeColor
			ctx.lineCap = "square"
			ctx.lineWidth = 1
			
			ctx.beginPath()
			ctx.moveTo(keyChX, 0)
			ctx.lineTo(keyChX, state.contentState.h)
			ctx.stroke()
		}
	}
	
	
	static renderCursorHighlight(state: ContentManager<EditorState>, ctx: CanvasRenderingContext2D)
	{
		if (!state.contentState.cursor.visible)
			return
		
		const timeMin = state.contentState.cursor.time1.min(state.contentState.cursor.time2)!
		const timeMax = state.contentState.cursor.time1.max(state.contentState.cursor.time2)!
		const trackMin = Math.min(state.contentState.cursor.track1, state.contentState.cursor.track2)
		const trackMax = Math.max(state.contentState.cursor.track1, state.contentState.cursor.track2)
		
		if (trackMin < 0 || trackMax < 0 ||
			trackMin >= state.contentState.tracks.length ||
			trackMax >= state.contentState.tracks.length)
			return
		
			const y1 = 0.5 + Math.floor(Editor.trackY(state, trackMin))
		const y2 = 0.5 + Math.floor(Editor.trackY(state, trackMax) + state.contentState.tracks[trackMax].h)
		
		const x1 = Editor.xAtTime(state, timeMin)
		const x2 = Editor.xAtTime(state, timeMax)
		
		ctx.fillStyle = state.appState.prefs.editor.selectionBkgColor
		ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
	}
	
	
	static renderCursorBeam(state: ContentManager<EditorState>, ctx: CanvasRenderingContext2D, time: Rational, tipOffsetSide: boolean)
	{
		const trackMin = Math.min(state.contentState.cursor.track1, state.contentState.cursor.track2)
		const trackMax = Math.max(state.contentState.cursor.track1, state.contentState.cursor.track2)
		
		if (trackMin < 0 || trackMax < 0 ||
			trackMin >= state.contentState.tracks.length ||
			trackMax >= state.contentState.tracks.length)
			return
		
		const x = 0.5 + Math.floor(Editor.xAtTime(state, time))
		
		ctx.strokeStyle = state.appState.prefs.editor.selectionCursorColor
		ctx.lineCap = "square"
		ctx.lineWidth = 1
		
		const headSize = 7 * (tipOffsetSide ? -1 : 1)

		const y1 = 0.5 + Math.floor(Editor.trackY(state, trackMin))
		const y2 = 0.5 + Math.floor(Editor.trackY(state, trackMax) + state.contentState.tracks[trackMax].h)
		
		ctx.beginPath()
		ctx.moveTo(x + headSize, y1)
		ctx.lineTo(x,            y1)
		ctx.lineTo(x,            y2)
		ctx.lineTo(x + headSize, y2)
		ctx.stroke()
	}
	
	
	static renderRectCursorHighlight(state: ContentManager<EditorState>, ctx: CanvasRenderingContext2D, trackIndex: number)
	{
		if (state.contentState.mouse.action != Editor.actionSelectRect)
			return
		
		if (trackIndex != state.contentState.rectCursor.track)
			return
		
		const timeMin = state.contentState.rectCursor.time1.min(state.contentState.rectCursor.time2)!
		const timeMax = state.contentState.rectCursor.time1.max(state.contentState.rectCursor.time2)!
		const y1 = 0.5 + Math.floor(Math.min(state.contentState.rectCursor.y1, state.contentState.rectCursor.y2))
		const y2 = 0.5 + Math.floor(Math.max(state.contentState.rectCursor.y1, state.contentState.rectCursor.y2)) + 1
		
		const x1 = 0.5 + Math.floor(Editor.xAtTime(state, timeMin))
		const x2 = 0.5 + Math.floor(Editor.xAtTime(state, timeMax))
		
		ctx.fillStyle = state.appState.prefs.editor.selectionBkgColor
		ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
	}
	
	
	static renderRectCursorContour(state: ContentManager<EditorState>, ctx: CanvasRenderingContext2D, trackIndex: number)
	{
		if (state.contentState.mouse.action != Editor.actionSelectRect)
			return
		
		if (trackIndex != state.contentState.rectCursor.track)
			return
		
		const timeMin = state.contentState.rectCursor.time1.min(state.contentState.rectCursor.time2)!
		const timeMax = state.contentState.rectCursor.time1.max(state.contentState.rectCursor.time2)!
		const y1 = 0.5 + Math.floor(Math.min(state.contentState.rectCursor.y1, state.contentState.rectCursor.y2))
		const y2 = 0.5 + Math.floor(Math.max(state.contentState.rectCursor.y1, state.contentState.rectCursor.y2)) + 1
		
		const x1 = 0.5 + Math.floor(Editor.xAtTime(state, timeMin))
		const x2 = 0.5 + Math.floor(Editor.xAtTime(state, timeMax))
		
		ctx.strokeStyle = state.appState.prefs.editor.selectionCursorColor
		ctx.lineCap = "square"
		ctx.lineWidth = 1
		ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
	}
}