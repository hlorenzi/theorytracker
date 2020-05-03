import { default as Immutable } from "immutable"
import Track from "./track.js"
import Theory from "../theory.ts"
import Rational from "../util/rational.js"
import Range from "../util/range.js"
import Rect from "../util/rect.js"
import Project from "../project/project.js"
import MathUtils from "../util/math.js"


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
	
	static keyPan = " "
	static keyDraw = "a"
	static keySelectMultiple = "control"
	static keySelectRect = "shift"
	
	
	static reduce(state, action)
	{
		const shouldLog = (
			action.type !== "playbackStep" &&
			action.type !== "mouseMove" &&
			action.type !== "keyDown" &&
			action.type !== "keyUp" &&
			action.type !== "keyCommand"
		)
		
		if (shouldLog)
		{
			console.log("Editor.oldState", state)
			console.log("Editor.action", action)
		}
		
		const reducer = Editor["reduce_" + action.type]
		
		if (reducer)
		{
			const newState = reducer(state, action)
			
			if (shouldLog)
			{
				console.log("Editor.newState", newState)
				console.log("")
			}
			
			return newState
		}
		else
		{
			console.error("unhandled Editor.action", action)
			return state
		}
	}
	
	
	static reduce_init(state, action)
	{
		state = {
			project: action.project,
			w: 0,
			h: 0,
			
			tracks: [],
			
			timeSnap: new Rational(1, 16),
			timeSnapBase: new Rational(1, 16),
			timeScale: 200,
			timeScroll: -1,

			insert: {
				nearPitch: 60,
				duration: new Rational(1, 4),
			},
			
			undoData: {
				stack: [],
				pointer: -1,
			},

			clipboard: {
				elems: new Immutable.Map(),
			},

			playback: {
				playing: false,
				timeAsFloat: 0,
				time: new Rational(0),
				startTime: null,
			},
			
			cursor: {
				visible: true,
				time1: new Rational(0),
				time2: new Rational(0),
				track1: 0,
				track2: 0,
			},
			
			rectSelection: null,
			
			mouse: {
				down: false,
				action: 0,
				dragOrig: null,
				drag: null,
				x: 0,
				y: 0,
				xPrev: 0,
				yPrev: 0,
				hover: null,
				draw: null,
				lastDownDate: new Date(),
				lastWheelDate: new Date(),
			},
			
			keys: {},
			pendingKeyCommandFinish: false,

			soundPreview: null,
			soundPreviewPrev: null,

			prefs:
			{
				doubleClickThresholdMs: 250,
				mouseEdgeScrollThreshold: 60,
				mouseEdgeScrollSpeed: 1,
				cursorEdgeScrollThreshold: new Rational(4),
				cursorEdgeScrollSpeed: 16,

				backgroundColor: "#29242e",
				selectionCursorColor: "#0af",
				playbackCursorColor: "#f00",
				trackSeparatorColor: "#aaa",
				submeasureColor: "#0008",
				halfSubmeasureColor: "#0002",
				meterChangeColor: "#0cf",
				keyChangeColor: "#f0c",
			}
		}
		
		state = Editor.refreshProjectRange(state)
		return Editor.undoPointAdd(state)
	}
	
	
	static reduce_set(state, action)
	{
		state = { ...state,
			...action.state,
		}
		
		return state
	}
	
	
	static reduce_resize(state, action)
	{
		state = { ...state,
			w: action.w,
			h: action.h,
			tracks: [ ...state.tracks ],
		}
		
		let trackY = 0
		for (let tr = 0; tr < state.tracks.length; tr++)
		{
			if (state.tracks[tr].kind == "notes")
				state.tracks[tr] = { ...state.tracks[tr], rect: new Rect(0, trackY, state.w, state.h - trackY) }
			else if (state.tracks[tr].kind == "chords")
				state.tracks[tr] = { ...state.tracks[tr], rect: new Rect(0, trackY, state.w, 54) }
			else
				state.tracks[tr] = { ...state.tracks[tr], rect: new Rect(0, trackY, state.w, 44) }
			
			trackY += state.tracks[tr].rect.h
		}
		
		return state
	}
	
	
	static reduce_projectSet(state, action)
	{
		state = Editor.undoPointAdd(state)		

		state = { ...state,
			project: action.project,
		}

		return state
	}
	
	
	static reduce_projectLoad(state, action)
	{
		state = { ...state,
			project: action.project,
		}

		state = Editor.selectionClear(state)
		state = Editor.reduce_clearUndoStack(state, {})		
		state = Editor.reduce_rewind(state, {})
		state = Editor.reduce_playbackSet(state, { playing: false })
		return state
	}
	
	
	static reduce_rewind(state, action)
	{
		if (state.playback.playing)
		{
			state = Editor.reduce_playbackSet(state, { playing: true, time: state.project.range.start })
		}
		else
		{
			state = Editor.Cursor.setVisible(state, true)
			state = Editor.Cursor.place(state, state.project.range.start, null)
			state = Editor.scrollTimeIntoView(state, state.project.range.start)
		}

		return state
	}
	
	
	static reduce_trackAdd(state, action)
	{
		state = Track.handlerForTrackKind(action.kind).init(state, action)
		state = Editor.Cursor.place(state, null, state.tracks.length - 1)
		
		return Editor.reduce_resize(state, { type: "resize", w: state.w, h: state.h })
	}
	
	
	static reduce_playbackSet(state, action)
	{
		if (state.mouse.down)
			state = Editor.reduce_mouseUp(state, {})

		const time = action.time || state.playback.time

		state = { ...state,
			playback: { ...state.playback,
				playing: action.playing,
				time,
				timeAsFloat: time.asFloat(),
				startTime: (action.playing ? time : null),
			},
		}

		if (action.playing)
			state = Editor.scrollPlaybackIntoView(state, time)		
		
		return state
	}
	
	
	static reduce_playbackStep(state, action)
	{
		const timeAsFloat = action.timeAsFloat === null ? state.playback.timeAsFloat : action.timeAsFloat
		const time = Rational.fromFloat(timeAsFloat, 1024)

		state = { ...state,
			playback: { ...state.playback,
				timeAsFloat,
				time,
			},
		}

		state = Editor.scrollPlaybackIntoView(state, time)
		return state
	}
	
	
	static reduce_clearSoundPreview(state, action = {})
	{
		let soundPreviewPrev = action.clearPrev ? null : (state.soundPreview || state.soundPreviewPrev)

		if (!state.soundPreview && state.soundPreviewPrev === soundPreviewPrev)
			return state

		return { ...state, soundPreview: null, soundPreviewPrev }
	}


	static reduce_insertNote(state, action)
	{
		state = Editor.handlePendingKeyCommandFinish(state)

		const insertOctave = Math.floor(state.insert.nearPitch / 12)
		const possiblePitches = [-1, 0, 1].map(offset =>
		{
			const pitch = (insertOctave + offset) * 12 + (MathUtils.mod(action.chroma, 12))
			const delta = Math.abs(pitch - state.insert.nearPitch)
			return { pitch, delta }
		})

		possiblePitches.sort((a, b) => a.delta - b.delta)
		const chosenPitch = possiblePitches[0].pitch

		const track = state.tracks.findIndex(t => t.kind === "notes")

		const range = new Range(action.time, action.time.add(state.insert.duration))
		const note = new Project.Note(range, chosenPitch)
		const id = state.project.nextId
		const project = state.project.upsertNote(note).withRefreshedRange()

		state = { ...state,
			project,
			insert: { ...state.insert,
				nearPitch: chosenPitch,
			},
		}

		state = Editor.Cursor.place(state, range.end, track)
		state = Editor.Cursor.setVisible(state, false)
		state = Editor.scrollTimeIntoView(state, range.end)
		state = Editor.soundPreviewSet(state, { kind: "note", pitch: chosenPitch })
		state = Editor.selectionClear(state)
		state = Track.selectionAdd(state, track, id)
		state = Track.selectionRemoveConflictingBehind(state, track)
		state = Editor.undoPointAdd(state)
		return state
	}


	static reduce_insertChord(state, action)
	{
		state = Editor.handlePendingKeyCommandFinish(state)

		const track = state.tracks.findIndex(t => t.kind === "chords")

		const range = new Range(action.time, action.time.add(state.insert.duration))
		const chord = new Project.Chord(range, action.chord)
		const id = state.project.nextId
		const project = state.project.upsertChord(chord).withRefreshedRange()

		state = { ...state, project }
		state = Editor.Cursor.place(state, range.end, track)
		state = Editor.Cursor.setVisible(state, false)
		state = Editor.scrollTimeIntoView(state, range.end)
		state = Editor.soundPreviewSet(state, { kind: "chord", chord: action.chord })
		state = Editor.selectionClear(state)
		state = Track.selectionAdd(state, track, id)
		state = Track.selectionRemoveConflictingBehind(state, track)
		state = Editor.undoPointAdd(state)
		return state
	}


	static reduce_insertKeyChange(state, action)
	{
		state = Editor.handlePendingKeyCommandFinish(state)

		const track = state.tracks.findIndex(t => t.kind === "markers")

		const keyCh = new Project.KeyChange(action.time, action.key)
		const id = state.project.nextId
		const project = state.project.upsertKeyChange(keyCh).withRefreshedRange()

		state = { ...state, project }
		state = Editor.Cursor.place(state, action.time, track)
		state = Editor.Cursor.setVisible(state, false)
		state = Editor.scrollTimeIntoView(state, action.time)
		state = Editor.selectionClear(state)
		state = Track.selectionAdd(state, track, id)
		state = Track.selectionRemoveConflictingBehind(state, track)
		state = Editor.undoPointAdd(state)
		return state
	}


	static reduce_insertMeterChange(state, action)
	{
		state = Editor.handlePendingKeyCommandFinish(state)

		const track = state.tracks.findIndex(t => t.kind === "markers")

		const meterCh = new Project.MeterChange(action.time, action.meter)
		const id = state.project.nextId
		const project = state.project.upsertMeterChange(meterCh).withRefreshedRange()

		state = { ...state, project }
		state = Editor.Cursor.place(state, action.time, track)
		state = Editor.Cursor.setVisible(state, false)
		state = Editor.scrollTimeIntoView(state, action.time)
		state = Editor.selectionClear(state)
		state = Track.selectionAdd(state, track, id)
		state = Track.selectionRemoveConflictingBehind(state, track)
		state = Editor.undoPointAdd(state)
		return state
	}
	
	
	static reduce_keyDown(state, action)
	{
		return { ...state,
			keys: { ...state.keys, [action.key]: true },
		}
	}
	
	
	static reduce_keyUp(state, action)
	{
		let keys = { ...state.keys }
		delete keys[action.key]
		
		return { ...state, keys }
	}
	
	
	static reduce_keyCommand(state, action)
	{
		let needsUndoPointAfter = true
		
		state = Editor.reduce_clearSoundPreview(state, { clearPrev: true })

		switch (action.key)
		{
			case "z":
			{
				if (state.playback.playing)
					break

				if (!action.ctrlKey)
					break
				
				if (action.shiftKey)
					state = Editor.reduce_redo(state, {})
				else
					state = Editor.reduce_undo(state, {})
				
				needsUndoPointAfter = false
				break
			}
			case "y":
			{
				if (state.playback.playing)
					break

				if (!action.ctrlKey)
					break
				
				state = Editor.reduce_redo(state, {})
				needsUndoPointAfter = false
				break
			}
			case "c":
			{
				if (state.playback.playing)
					break

				if (!action.ctrlKey)
					break

				state = Editor.reduce_copy(state, {})
				break
			}
			case "x":
			{
				if (state.playback.playing)
					break

				if (!action.ctrlKey)
					break

				state = Editor.reduce_cut(state, {})
				break
			}
			case "v":
			{
				if (state.playback.playing)
					break

				if (!action.ctrlKey)
					break
				
				state = Editor.reduce_paste(state, {})
				break
			}
			case " ":
			{
				const time = state.cursor.time1.min(state.cursor.time2)
				state = Editor.reduce_playbackSet(state, { playing: !state.playback.playing, time })
				break
			}
			case "delete":
			{
				if (state.playback.playing)
					break

				state = Editor.selectionDelete(state)
				break
			}
			case "backspace":
			{
				if (state.playback.playing)
					break

				if (!state.cursor.visible)
				{
					state = Editor.selectionDelete(state)
					break
				}

				const track1 = Math.min(state.cursor.track1, state.cursor.track2)
				const track2 = Math.max(state.cursor.track1, state.cursor.track2)
				
				if (state.cursor.time1.compare(state.cursor.time2) == 0)
				{
					const time = state.cursor.time1.min(state.cursor.time2)
					const prevAnchor = Editor.previousAnchor(state, time, track1, track2)
					
					for (let tr = track1; tr <= track2; tr++)
						state = Track.deleteRange(state, tr, new Range(prevAnchor, time, false, false))
						
					state = Editor.Cursor.place(state, prevAnchor, null)
					state = Editor.Cursor.setVisible(state, true)
					state = Editor.scrollTimeIntoView(state, prevAnchor)
				}
				else
				{
					const time1 = state.cursor.time1.min(state.cursor.time2)
					const time2 = state.cursor.time1.max(state.cursor.time2)
					
					for (let tr = track1; tr <= track2; tr++)
						state = Track.deleteRange(state, tr, new Range(time1, time2, false, false))
						
					state = Editor.Cursor.place(state, time1, null)
					state = Editor.Cursor.setVisible(state, true)
					state = Editor.scrollTimeIntoView(state, time1)
				}
				break
			}
			case "escape":
			{
				state = Editor.reduce_rewind(state)
				break
			}
			case "enter":
			{
				if (state.playback.playing)
					break

				state = Editor.Cursor.setVisible(state, true)

				const range = Editor.selectionRange(state)
				if (range)
				{
					let track = 0
					for (let tr = 0; tr < state.tracks.length; tr++)
						if (Track.selectionHasAny(state, tr))
							track = tr

					state = Editor.Cursor.place(state, range.end, track)
					state = Editor.scrollTimeIntoView(state, range.end)
				}

				state = Editor.handlePendingKeyCommandFinish(state)
				state = Editor.selectionClear(state)
				break
			}
			case "arrowright":
			case "arrowleft":
			{
				const invert = (action.key === "arrowleft")

				if (state.playback.playing)
				{
					const timeDelta = state.timeSnap.multiplyByFloat((action.ctrlKey ? 64 : 16) * (invert ? -1 : 1))
					const newTime = state.playback.time.add(timeDelta)
					state = Editor.reduce_playbackSet(state, { playing: true, time: newTime })
				}
				else if (state.cursor.visible && (!Editor.selectionHasAny(state) || action.shiftKey))
				{
					const timeDelta = state.timeSnap.multiplyByFloat((action.ctrlKey ? 16 : 1) * (invert ? -1 : 1))

					state = Editor.handlePendingKeyCommandFinish(state)

					if (action.shiftKey)
					{
						const newTime = state.cursor.time2.add(timeDelta)
						state = Editor.Cursor.drag(state, newTime, null)
						state = Editor.selectAtCursor(state)
						state = Editor.scrollTimeIntoView(state, newTime)
					}
					else
					{
						const timeMin = state.cursor.time1.min(state.cursor.time2)
						const timeMax = state.cursor.time1.max(state.cursor.time2)
	
						const newTime = (invert ? timeMin : timeMax).add(timeDelta)
						state = Editor.Cursor.place(state, newTime, null)
						state = Editor.scrollTimeIntoView(state, newTime)
					}
				}
				else
				{
					const commandData =
					{
						timeDelta: state.timeSnap.multiplyByFloat((action.ctrlKey ? 16 : 1) * (invert ? -1 : 1)),
					}
	
					state = Editor.executeKeyCommand(state, "TimeShift", commandData)

					const range = Editor.selectionRange(state)
					const newTime = (invert ? range.start : range.end)
					state = Editor.Cursor.setVisible(state, false)
					state = Editor.Cursor.place(state, newTime, null)
					state = Editor.scrollTimeIntoView(state, newTime)

					state = { ...state, pendingKeyCommandFinish: true }
					needsUndoPointAfter = false
				}

				break
			}
			case "arrowup":
			case "arrowdown":
			{
				if (state.playback.playing)
					break

				const invert = (action.key === "arrowdown")
				if (state.cursor.visible && (!Editor.selectionHasAny(state) || action.shiftKey))
				{
					const trackDelta = (invert ? 1 : -1)

					state = Editor.handlePendingKeyCommandFinish(state)
					
					if (action.shiftKey)
					{
						const newTrack = state.cursor.track2 + trackDelta
						state = Editor.Cursor.drag(state, null, newTrack)
						state = Editor.selectAtCursor(state)
					}
					else
					{
						const trackMin = Math.min(state.cursor.track1, state.cursor.track2)
						const trackMax = Math.max(state.cursor.track1, state.cursor.track2)
	
						const newTrack = (invert ? trackMax : trackMin) + trackDelta
						state = Editor.Cursor.place(state, null, newTrack)
					}
				}
				else
				{
					const commandData =
					{
						diatonic: true,
						degreeDelta: (action.ctrlKey ? 7 : 1) * (invert ? -1 : 1),
					}
					
					state = Editor.Cursor.setVisible(state, false)
					state = Editor.executeKeyCommand(state, "PitchShift", commandData)
					state = { ...state, pendingKeyCommandFinish: true }
					needsUndoPointAfter = false
				}

				break
			}
			case ".":
			case ">":
			case ",":
			case "<":
			{
				if (state.playback.playing)
					break

				const invert = (action.key === "," || action.key === "<")
				const commandData =
				{
					diatonic: false,
					pitchDelta: (action.ctrlKey ? 12 : 1) * (invert ? -1 : 1),
				}
				
				state = Editor.Cursor.setVisible(state, false)
				state = Editor.executeKeyCommand(state, "PitchShift", commandData)
				state = { ...state, pendingKeyCommandFinish: true }
				needsUndoPointAfter = false
				break
			}
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			{
				if (state.playback.playing)
					break

				const degree = (action.key.charCodeAt(0) - "1".charCodeAt(0))
				const time = state.cursor.time1.min(state.cursor.time2)
				const keyCh = state.project.keyChanges.findActiveAt(time)
				const key = keyCh ? keyCh.key : Editor.defaultKey()
				
				if (state.tracks[state.cursor.track1].kind === "chords")
				{
					const root = key.midiForDegree(degree)
					
					let pitches = [0]
					pitches.push(key.midiForDegree(degree + 2) - root)
					pitches.push(key.midiForDegree(degree + 4) - root)
					
					const kind = Theory.Chord.kindFromPitches(pitches)
					const chord = new Theory.Chord(root, 0, kind, 0, [])
					state = Editor.reduce_insertChord(state, { time, chord })
				}
				else
				{
					const chroma = key.midiForDegree(degree)
					state = Editor.reduce_insertNote(state, { time, chroma })
				}
			}
			default:
				return state
		}

		if (action.ev)
			action.ev.preventDefault()
		
		state = Editor.refreshProjectRange(state)
		
		if (needsUndoPointAfter)
		{
			state = { ...state, pendingKeyCommandFinish: false }
			state = Editor.undoPointAdd(state)
		}

		return state
	}


	static reduce_copy(state, action)
	{
		if (!Editor.selectionHasAny(state))
			return state
	
		state = Editor.clipboardClear(state)
		state = Editor.selectionAddToClipboard(state)
		state = Editor.undoPointAdd(state)
		return state
	}


	static reduce_cut(state, action)
	{
		if (!Editor.selectionHasAny(state))
			return state
		
		state = Editor.clipboardClear(state)
		state = Editor.selectionAddToClipboard(state)
		state = Editor.selectionDelete(state)
		state = Editor.undoPointAdd(state)
		return state
	}


	static reduce_paste(state, action)
	{
		state = Editor.clipboardPaste(state)
		state = Editor.undoPointAdd(state)
		return state
	}
	
	
	static reduce_mouseMove(state, action)
	{
		state = Editor.reduce_clearSoundPreview(state)

		state = { ...state,
			mouse: { ...state.mouse,
				x: action.x,
				y: action.y,
				xPrev: state.mouse.x,
				yPrev: state.mouse.y,
				hover: null,
				draw: null,
				time: Editor.timeAtX(state, action.x),
				track: Editor.trackAtY(state, action.y),
			}
		}
		
		if (!state.mouse.down)
		{
			for (let tr = 0; tr < state.tracks.length; tr++)
			{
				if (state.tracks[tr].rect.contains(state.mouse))
				{
					const input = { mouse: { ...state.mouse } }
					input.mouse.x -= state.tracks[tr].rect.x
					input.mouse.y -= state.tracks[tr].rect.y
					
					state = Track.updateHover(state, tr, input)
					if (state.tracks[tr].hover || state.tracks[tr].draw)
					{
						state = { ...state,
							mouse: { ...state.mouse,
								hover: state.tracks[tr].hover,
								draw: state.tracks[tr].draw,
							},
						}
					}
				}
				else
					state = Track.update(state, tr, { hover: null, draw: null })
			}
		}
		else
		{
			state = { ...state,
				mouse: { ...state.mouse,
					drag: {
						xDelta: state.mouse.x - state.mouse.dragOrig.x,
						yDelta: state.mouse.y - state.mouse.dragOrig.y,
						timeDelta: state.mouse.time.subtract(state.mouse.dragOrig.time),
					},
				},
			}
			
			const handleMouseEdgeScroll = (state) =>
			{
				let timeScroll = state.timeScroll

				if (state.mouse.x > state.w - state.prefs.mouseEdgeScrollThreshold)
					timeScroll += state.timeSnap.asFloat() * state.prefs.mouseEdgeScrollSpeed

				else if (state.mouse.x < state.prefs.mouseEdgeScrollThreshold)
					timeScroll -= state.timeSnap.asFloat() * state.prefs.mouseEdgeScrollSpeed

				return { ...state, timeScroll }
			}
			
			if (state.mouse.action == Editor.actionPan)
			{
				state = { ...state,
					timeScroll: state.mouse.dragOrig.timeScroll - state.mouse.drag.xDelta / state.timeScale,
				}

				for (let tr = 0; tr < state.tracks.length; tr++)
					state = Track.pan(state, tr)
			}
			else if (state.mouse.action == Editor.actionSelectCursor)
			{
				state = Editor.Cursor.drag(state, state.mouse.time, state.mouse.track)
				state = Editor.selectAtCursor(state)
				state = handleMouseEdgeScroll(state)
			}
			else if (state.mouse.action == Editor.actionSelectRect)
			{
				state = { ...state,
					rectSelection: { ...state.rectSelection,
						time2: state.mouse.time,
						y2: state.mouse.y - state.tracks[state.rectSelection.track].rect.y,
					},
				}
				
				for (let tr = 0; tr < state.tracks.length; tr++)
					state = Track.selectionClear(state, tr)
				
				state = Track.selectionAddAtRect(state, state.rectSelection.track)
				state = handleMouseEdgeScroll(state)
			}
			else if (state.mouse.action == Editor.actionDraw)
			{
				for (let tr = 0; tr < state.tracks.length; tr++)
				{
					const input = { mouse: { ...state.mouse } }
					input.mouse.x -= state.tracks[tr].rect.x
					input.mouse.y -= state.tracks[tr].rect.y
					
					state = Track.drawMove(state, tr, input)
				}

				state = handleMouseEdgeScroll(state)
			}
			else
			{
				for (let tr = 0; tr < state.tracks.length; tr++)
					state = Track.drag(state, tr)

				state = handleMouseEdgeScroll(state)
			}
		}
		
		return state
	}
	
	
	static reduce_mouseDown(state, action)
	{
		if (state.mouse.down)
			return state

		const timeSinceLastDown = new Date().getTime() - state.mouse.lastDownDate.getTime()

		state = Editor.reduce_clearSoundPreview(state, { clearPrev: true })
		state = Editor.handlePendingKeyCommandFinish(state)
		
		state = { ...state,
			mouse: { ...state.mouse,
				down: true,
				action: 0,
				lastDownDate: new Date(),
				dragOrig: {
					x: state.mouse.x,
					y: state.mouse.y,
					time: state.mouse.time,
					timeScroll: state.timeScroll,
					track: state.mouse.track,
				},
			},
		}
		
		if (action.rightButton || state.keys[Editor.keyPan])
		{
			state = { ...state,
				mouse: { ...state.mouse,
					action: Editor.actionPan,
				},
			}
			
			for (let tr = 0; tr < state.tracks.length; tr++)
				state = Track.dragStart(state, tr)
		}
		else if (state.keys[Editor.keySelectRect])
		{
			state = Editor.Cursor.setVisible(state, false)
			
			state = { ...state,
				mouse: { ...state.mouse,
					action: Editor.actionSelectRect,
				},
				rectSelection: {
					track: state.mouse.track,
					time1: state.mouse.time,
					time2: state.mouse.time,
					y1: state.mouse.y - state.tracks[state.mouse.track].rect.y,
					y2: state.mouse.y - state.tracks[state.mouse.track].rect.y,
				},
			}
		}
		else if (!state.playback.playing)
		{
			if (state.mouse.draw)
			{
				state = Editor.selectionClear(state)
				state = Editor.Cursor.setVisible(state, false)

				for (let tr = 0; tr < state.tracks.length; tr++)
					state = Track.drawStart(state, tr)
				
				state = { ...state,
					mouse: { ...state.mouse,
						action: Editor.actionDraw,
					},
				}
			}
			else
			{
				if (!state.mouse.hover)
				{
					if (timeSinceLastDown < state.prefs.doubleClickThresholdMs)
					{
						const time = Editor.previousAnchor(state, state.mouse.time, state.mouse.track, state.mouse.track)
						state = Editor.Cursor.place(state, time, state.mouse.track)
						state = Editor.scrollTimeIntoView(state, time)
					}
					else
					{
						state = Editor.Cursor.place(state, state.mouse.time, state.mouse.track)
						state = { ...state,
							mouse: { ...state.mouse,
								action: Editor.actionSelectCursor,
							},
						}
					}
					
					state = Editor.Cursor.setVisible(state, true)
				}
				else
				{
					state = Editor.Cursor.setVisible(state, false)
					
					if (state.keys[Editor.keySelectMultiple])
					{
						for (let tr = 0; tr < state.tracks.length; tr++)
						{
							state = Track.hoveredPlaySoundPreview(state, tr)
							state = Track.hoveredToggleSelection(state, tr)
						}
					}
					else
					{
						let isHoveringSelected = false
						for (let tr = 0; tr < state.tracks.length; tr++)
							isHoveringSelected |= Track.hoveredIsSelected(state, tr)
						
						if (!isHoveringSelected)
							for (let tr = 0; tr < state.tracks.length; tr++)
								state = Track.selectionClear(state, tr)
						
						for (let tr = 0; tr < state.tracks.length; tr++)
						{
							state = Track.hoveredPlaySoundPreview(state, tr)
							state = Track.hoveredSelect(state, tr)
						}
					}
					
					for (let tr = 0; tr < state.tracks.length; tr++)
						state = Track.dragStart(state, tr)
					
					state = { ...state,
						mouse: { ...state.mouse,
							action: state.mouse.hover && state.mouse.hover.action,
							dragOrig: { ...state.mouse.dragOrig,
								range: Editor.selectionRange(state),
							},
						},
					}
				}
			}
		}
		
		return state
	}
	
	
	static reduce_mouseUp(state, action)
	{
		if (!state.mouse.down)
			return state

		state = Editor.reduce_clearSoundPreview(state)
		
		if (state.mouse.action == Editor.actionDraw)
		{
			for (let tr = 0; tr < state.tracks.length; tr++)
				state = Track.drawEnd(state, tr)
		}
			
		state = { ...state,
			mouse: { ...state.mouse, down: false, action: 0, dragOrig: null, drag: null },
			rectSelection: null,
		}
		
		for (let tr = 0; tr < state.tracks.length; tr++)
			state = Track.selectionRemoveConflictingBehind(state, tr)

		state = Editor.refreshProjectRange(state)
		state = Editor.undoPointAdd(state)
		
		return state
	}
	
	
	static reduce_mouseWheel(state, action)
	{
		if (Math.abs(action.deltaX) > 0)
		{
			let timeScroll = state.timeScroll + 0.01 / (state.timeScale / 100) * action.deltaX
			let lastWheelDate = new Date()
		
			return { ...state, timeScroll, mouse: { ...state.mouse, lastWheelDate } }
		}
		else if (new Date().getTime() - state.mouse.lastWheelDate.getTime() > 250)
		{
			const snap = new Rational(1, 1024)
			const prevMouseTime = Editor.timeAtX(state, state.mouse.x, snap)
			
			let timeScale = state.timeScale * (action.deltaY > 0 ? 0.8 : 1.25)
			timeScale = Math.max(4, Math.min(2048, timeScale))
			state = { ...state, timeScale }
			
			const newMouseTime = Editor.timeAtX(state, state.mouse.x, snap)
			
			const timeScroll = state.timeScroll - newMouseTime.subtract(prevMouseTime).asFloat()
			
			const timeSnapAdjustThresholdUpper = 24
			const timeSnapAdjustThresholdLower = 8
			let timeSnap = state.timeSnapBase
			
			if (timeSnap.asFloat() * timeScale > timeSnapAdjustThresholdUpper)
				while (timeSnap.asFloat() * timeScale > timeSnapAdjustThresholdUpper)
					timeSnap = timeSnap.divide(new Rational(2))
				
			else if (timeSnap.asFloat() * timeScale < timeSnapAdjustThresholdLower)
				while (timeSnap.asFloat() * timeScale < timeSnapAdjustThresholdLower)
					timeSnap = timeSnap.divide(new Rational(1, 2))
				
			return { ...state, timeScroll, timeSnap }
		}
		
		return state
	}
	
	
	static reduce_clearUndoStack(state, action)
	{
		state = { ...state,
			undoData: {
				stack: [],
				pointer: -1,
			},
		}
		
		return Editor.undoPointAdd(state)
	}
	
	
	static reduce_undo(state, action)
	{
		if (state.undoData.pointer <= 0)
			return state
		
		state = Editor.handlePendingKeyCommandFinish(state)
		
		const undoData = { ...state.undoData,
			pointer: state.undoData.pointer - 1,
		}
		
		state = {
			...state,
			...undoData.stack[undoData.pointer].state,
			undoData,
		}
		
		return Editor.reduce_resize(state, { w: state.w, h: state.h })
	}
	
	
	static reduce_redo(state, action)
	{
		if (state.undoData.pointer >= state.undoData.stack.length - 1)
			return state
		
		state = Editor.handlePendingKeyCommandFinish(state)
		
		const undoData = { ...state.undoData,
			pointer: state.undoData.pointer + 1,
		}
		
		state = {
			...state,
			...undoData.stack[undoData.pointer].state,
			undoData,
		}
		
		return Editor.reduce_resize(state, { w: state.w, h: state.h })
	}


	static handlePendingKeyCommandFinish(state)
	{
		if (!state.pendingKeyCommandFinish)
			return state

		for (let tr = 0; tr < state.tracks.length; tr++)
			state = Track.selectionRemoveConflictingBehind(state, tr)

		state = { ...state, pendingKeyCommandFinish: false }
		state = Editor.undoPointAdd(state)
		return state
	}
	
	
	static undoPointAdd(state)
	{
		let stackCutIndex = state.undoData.pointer + 1
		
		if (state.undoData.stack.length > 0 &&
			state.project === state.undoData.stack[stackCutIndex - 1].state.project)
		{
			//if (state.undoData.pointer != state.undoData.stack.length - 1)
				return state
			
			//stackCutIndex = state.undoData.pointer
		}
		
		for (let tr = 0; tr < state.tracks.length; tr++)
			state = Track.selectionRemoveConflictingBehind(state, tr)
	
		const newUndoPoint =
		{
			state: {
				project: state.project,
				cursor: state.cursor,
				tracks: state.tracks,
				timeScale: state.timeScale,
				timeScroll: state.timeScroll,
				pendingKeyCommandFinish: state.pendingKeyCommandFinish,
			},
		}
		
		const newStack =
		[
			...state.undoData.stack.slice(0, stackCutIndex),
			newUndoPoint,
		]
		
		//console.log("undoPointAdd", newStack)
		
		return { ...state,
			undoData: { ...state.undoData,
				stack: newStack,
				pointer: newStack.length - 1,
			},
		}
	}
	
	
	static canUndo(state)
	{
		return (state.undoData.pointer > 0)
	}
	
	
	static canRedo(state)
	{
		return (state.undoData.pointer < state.undoData.stack.length - 1)
	}
	
	
	static refreshProjectRange(state)
	{
		const project = state.project.withRefreshedRange()
		if (project === state.project)
			return state
		
		return { ...state, project }
	}
	
	
	static xAtTime(state, time)
	{
		return (time.asFloat() - state.timeScroll) * state.timeScale
	}
	
	
	static timeAtX(state, x, timeSnap = null)
	{
		timeSnap = timeSnap || state.timeSnap
		const time = x / state.timeScale + state.timeScroll
		return Rational.fromFloat(time, timeSnap.denominator)
	}
	
	
	static timeRangeAtX(state, x1, x2, timeSnap = null)
	{
		timeSnap = timeSnap || state.timeSnap
		return new Range(Editor.timeAtX(state, x1, timeSnap).subtract(timeSnap), Editor.timeAtX(state, x2, timeSnap).add(timeSnap))
	}
	
	
	static trackAtY(state, y)
	{	
		for (let tr = 0; tr < state.tracks.length; tr++)
			if (y < state.tracks[tr].rect.y2)
				return tr
		
		return state.tracks.length - 1
	}
	
	
	static visibleTimeRange(state)
	{
		return new Range(Editor.timeAtX(state, 0).subtract(state.timeSnap), Editor.timeAtX(state, state.w).add(state.timeSnap))
	}
	
	
	static defaultKey()
	{
		return Theory.Key.parse("C Major")
	}
	
	
	static defaultMeter()
	{
		return new Theory.Meter(4, 4)
	}


	static insertionTime(state)
	{
		return state.cursor.time1
	}


	static insertionTrack(state)
	{
		return state.cursor.track1
	}
	
	
	static scrollTimeIntoView(state, time)
	{
		const visibleTimeRange = Editor.visibleTimeRange(state)

		let timeScroll = state.timeScroll

		if (time.compare(visibleTimeRange.end.subtract(state.timeSnap.multiply(state.prefs.cursorEdgeScrollThreshold))) > 0)
			timeScroll = time.subtract(visibleTimeRange.duration).subtract(state.timeSnap).asFloat() + state.timeSnap.asFloat() * state.prefs.cursorEdgeScrollSpeed
			
		else if (time.compare(visibleTimeRange.start.add(state.timeSnap.multiply(state.prefs.cursorEdgeScrollThreshold))) < 0)
			timeScroll = time.asFloat() - state.timeSnap.asFloat() * state.prefs.cursorEdgeScrollSpeed

		return { ...state, timeScroll }
	}
	
	
	static scrollPlaybackIntoView(state, time)
	{
		const margin = state.timeSnap.multiplyByFloat(16)
		const visibleTimeRange = Editor.visibleTimeRange(state)
		
		let timeScroll = state.timeScroll

		if (time.compare(visibleTimeRange.end.subtract(margin)) > 0)
			timeScroll = time.subtract(margin).asFloat()
			
		else if (time.compare(visibleTimeRange.start.add(margin)) < 0)
			timeScroll = time.subtract(margin).asFloat()

		return { ...state, timeScroll }
	}
	

	static selectAtCursor(state)
	{
		for (let tr = 0; tr < state.tracks.length; tr++)
			state = Track.selectionClear(state, tr)
		
		const trackMin = Math.min(state.cursor.track1, state.cursor.track2)
		const trackMax = Math.max(state.cursor.track1, state.cursor.track2)
		
		if (state.cursor.time1.compare(state.cursor.time2) != 0)
			for (let tr = trackMin; tr <= trackMax; tr++)
				state = Track.selectionAddAtCursor(state, tr)
		
		return state
	}

	
	static selectionHasAny(state)
	{
		for (let tr = 0; tr < state.tracks.length; tr++)
			if (Track.selectionHasAny(state, tr))
				return true
			
		return false
	}
	
	
	static selectionClear(state)
	{
		for (let tr = 0; tr < state.tracks.length; tr++)
			state = Track.selectionClear(state, tr)
		
		return state
	}
	
	
	static selectionRange(state)
	{
		let range = null

		for (let tr = 0; tr < state.tracks.length; tr++)
			range = Range.merge(range, Track.selectionRange(state, tr))
		
		return range
	}
	
	
	static selectionDelete(state)
	{
		if (!Editor.selectionHasAny(state))
			return state
		
		const range = Editor.selectionRange(state)
		
		for (let tr = 0; tr < state.tracks.length; tr++)
			state = Track.selectionDelete(state, tr)
		
		state = Editor.Cursor.place(state, range.start, null)
		state = Editor.Cursor.setVisible(state, true)
		state = Editor.scrollTimeIntoView(state, range.start)
		
		return state
	}
	
	
	static selectionAddToClipboard(state)
	{
		for (let tr = 0; tr < state.tracks.length; tr++)
			state = Track.selectionAddToClipboard(state, tr)
		
		return state
	}


	static clipboardClear(state)
	{
		return { ...state,
			clipboard: {
				elems: new Immutable.Map(),
				range: null,
			},
		}
	}


	static clipboardAdd(state, elem)
	{
		if (state.clipboard.elems.has(elem.id))
			return state

		return { ...state,
			clipboard: { ...state.clipboard,
				elems: state.clipboard.elems.set(elem.id, elem),
				range: Range.merge(state.clipboard.range, elem.range || Range.fromPoint(elem.time)),
			},
		}
	}


	static clipboardPaste(state, elem)
	{
		state = Editor.selectionClear(state)

		if (!state.clipboard.range)
			return state

		const trackMin = Math.min(state.cursor.track1, state.cursor.track2)
		const trackMax = Math.max(state.cursor.track1, state.cursor.track2)

		const pasteData =
		{
			time: state.cursor.time1.min(state.cursor.time2),
		}

		const projectBefore = state.project
		
		for (let tr = trackMin; tr <= trackMax; tr++)
			state = Track.clipboardPaste(state, tr, pasteData)

		if (state.project === projectBefore)
			return state

		const endTime = pasteData.time.add(state.clipboard.range.duration)
		state = Editor.Cursor.setVisible(state, false)
		state = Editor.Cursor.place(state, endTime, null)
		state = Editor.scrollTimeIntoView(state, endTime)
		state = Editor.refreshProjectRange(state) 
		
		return state
	}


	static soundPreviewSet(state, soundPreview)
	{
		if (!soundPreview)
			return state
		
		if (state.soundPreviewPrev && 
			state.soundPreviewPrev.kind == soundPreview.kind)
		{
			if (soundPreview.kind == "note" &&
				state.soundPreviewPrev.pitch == soundPreview.pitch)
				return state
		}

		return { ...state, soundPreview }
	}
	
	
	static executeKeyCommand(state, command, args)
	{
		for (let tr = 0; tr < state.tracks.length; tr++)
			state = Track["keyCommand" + command](state, tr, args)
		
		return state
	}
	
	
	static previousAnchor(state, time, track1, track2)
	{
		let prevAnchor = null
		
		const trackMin = Math.min(track1, track2)
		const trackMax = Math.max(track1, track2)
		
		for (let tr = trackMin; tr <= trackMax; tr++)
			prevAnchor = Rational.max(prevAnchor, Track.previousAnchor(state, tr, time))
		
		if (!prevAnchor)
			return state.project.range.start
		
		return prevAnchor
	}
	
	
	static render(state, ctx)
	{
		ctx.save()
		
		ctx.fillStyle = state.prefs.backgroundColor
		ctx.fillRect(0, 0, state.w, state.h)
		
		Editor.renderBackgroundMeasures(state, ctx)
		Editor.renderCursorHighlight(state, ctx)
		
		for (let tr = 0; tr < state.tracks.length; tr++)
		{
			const track = state.tracks[tr]
			
			ctx.save()
			ctx.translate(track.rect.x, track.rect.y)
			
			ctx.strokeStyle = state.prefs.trackSeparatorColor
			ctx.lineCap = "square"
			ctx.lineWidth = 1
			
			ctx.beginPath()
			ctx.moveTo(0, 0)
			ctx.lineTo(state.w, 0)
			ctx.stroke()
			
			ctx.beginPath()
			ctx.rect(0, 0, track.rect.w, track.rect.h)
			ctx.clip()
			
			Editor.renderRectSelectionHighlight(state, ctx, tr)
			Track.render(state, tr, ctx)
			Editor.renderRectSelectionContour(state, ctx, tr)
			
			ctx.restore()
		}
		
		if (state.cursor.visible)
		{
			const timeMin = state.cursor.time1.min(state.cursor.time2)
			const timeMax = state.cursor.time1.max(state.cursor.time2)
			Editor.renderCursorBeam(state, ctx, timeMin, false)
			Editor.renderCursorBeam(state, ctx, timeMax, true)
		}

		Editor.renderPlaybackBeam(state, ctx, state.playback.time)
		
		ctx.restore()
	}
	
	
	static renderBackgroundMeasures(state, ctx)
	{
		const visibleTimeRange = Editor.visibleTimeRange(state)
		
		ctx.fillStyle = "#1b191c"
		
		const songXMin = Editor.xAtTime(state, state.project.range.start)
		const songXMax = Editor.xAtTime(state, state.project.range.end)
		
		if (songXMin > 0)
			ctx.fillRect(0, 0, songXMin, state.h)

		if (songXMax < state.w)
			ctx.fillRect(songXMax, 0, state.w - songXMax, state.h)

		for (let [meterCh1, meterCh2] of state.project.meterChanges.iterActiveAtRangePairwise(visibleTimeRange))
		{
			if (!meterCh1 && !meterCh2)
				continue

			let timeMin = (meterCh1 ? meterCh1.time : null)
			let timeMax = (meterCh2 ? meterCh2.time : visibleTimeRange.end)

			let measureAlternate = true

			if (!meterCh1)
			{
				meterCh1 = meterCh2
				timeMin = meterCh2.time
				while (timeMin.compare(visibleTimeRange.start) > 0)
				{
					timeMin = timeMin.subtract(meterCh2.meter.fullCycleDuration)

					if (meterCh2.meter.alternatingMeasureCount % 2 != 0)
						measureAlternate = !measureAlternate
				}
			}
			
			const meterCh1X = Editor.xAtTime(state, timeMin)
			const meterCh2X = Editor.xAtTime(state, timeMax)

			ctx.strokeStyle = state.prefs.meterChangeColor
			ctx.lineCap = "square"
			ctx.lineWidth = 1
			
			ctx.beginPath()
			ctx.moveTo(meterCh1X, 0)
			ctx.lineTo(meterCh1X, state.h)
			ctx.stroke()

			for (const [measureN, measureD, time1, time2] of meterCh1.meter.iterMeasuresPairwise(timeMin))
			{
				measureAlternate = !measureAlternate

				if (time2.compare(visibleTimeRange.start) < 0)
					continue

				if (time1.compare(timeMax) > 0 || time1.compare(visibleTimeRange.end) > 0)
					break

				const measureX1 = Editor.xAtTime(state, time1)
				const measureX2 = Editor.xAtTime(state, time2)

				if (measureAlternate)
				{
					const x1 = Math.max(songXMin, Math.min(songXMax, Math.min(meterCh2X, measureX1)))
					const x2 = Math.max(songXMin, Math.min(songXMax, Math.min(meterCh2X, measureX2)))
					
					ctx.fillStyle = "#cdf"
					ctx.globalAlpha = 0.1
					ctx.fillRect(x1, 0, x2 - x1, state.h)
					ctx.globalAlpha = 1
				}

				const halfSubmeasureSize = Editor.xAtTime(state, new Rational(1, measureD * 2)) - Editor.xAtTime(state, new Rational(0))
				if (halfSubmeasureSize > 16)
				{
					let halfSubmeasureTime = time1.add(new Rational(-1, measureD * 2))
					for (let sub = 1; sub <= measureN; sub++)
					{
						halfSubmeasureTime = halfSubmeasureTime.add(new Rational(2, measureD * 2))
						
						const halfSubmeasureX = Editor.xAtTime(state, halfSubmeasureTime)
						if (halfSubmeasureX >= meterCh1X && halfSubmeasureX <= meterCh2X)
						{
							ctx.strokeStyle = state.prefs.halfSubmeasureColor
							ctx.beginPath()
							ctx.moveTo(halfSubmeasureX, 0)
							ctx.lineTo(halfSubmeasureX, state.h)
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
						
						const submeasureX = Editor.xAtTime(state, submeasureTime)
						if (submeasureX >= meterCh1X && submeasureX <= meterCh2X)
						{
							ctx.strokeStyle = state.prefs.submeasureColor
							ctx.beginPath()
							ctx.moveTo(submeasureX, 0)
							ctx.lineTo(submeasureX, state.h)
							ctx.stroke()
						}
					}
				}
			}
		}
		
		for (const keyCh of state.project.keyChanges.iterAtRange(visibleTimeRange))
		{
			const keyChX = Editor.xAtTime(state, keyCh.time)
			
			ctx.strokeStyle = state.prefs.keyChangeColor
			ctx.lineCap = "square"
			ctx.lineWidth = 1
			
			ctx.beginPath()
			ctx.moveTo(keyChX, 0)
			ctx.lineTo(keyChX, state.h)
			ctx.stroke()
		}
	}
	
	
	static renderPlaybackBeam(state, ctx, time)
	{
		if (!state.playback.playing)
			return
		
		const trackMin = 0
		const trackMax = state.tracks.length - 1
		
		if (trackMin < 0 || trackMax < 0)
			return
		
		ctx.save()
		
		const x = Editor.xAtTime(state, time)
		
		ctx.strokeStyle = state.prefs.playbackCursorColor
		ctx.lineCap = "round"
		ctx.lineWidth = 2
		
		const trackMinRect = state.tracks[trackMin].rect
		const trackMaxRect = state.tracks[trackMax].rect
		
		ctx.beginPath()
		ctx.moveTo(trackMinRect.x1 + x, trackMinRect.y1)
		ctx.lineTo(trackMinRect.x1 + x, trackMinRect.y1)
		ctx.lineTo(trackMaxRect.x1 + x, trackMaxRect.y2)
		ctx.lineTo(trackMaxRect.x1 + x, trackMaxRect.y2)
		ctx.stroke()
		
		ctx.restore()
	}
	
	
	static renderCursorBeam(state, ctx, time, tipOffsetSide)
	{
		if (state.playback.playing)
			return
		
		if (state.rectSelection)
			return
		
		const trackMin = Math.min(state.cursor.track1, state.cursor.track2)
		const trackMax = Math.max(state.cursor.track1, state.cursor.track2)
		
		if (trackMin < 0 || trackMax < 0)
			return
		
		ctx.save()
		
		const x = Editor.xAtTime(state, time)
		
		ctx.strokeStyle = state.prefs.selectionCursorColor
		ctx.lineCap = "round"
		ctx.lineWidth = 2
		
		const headSize = 7 * (tipOffsetSide ? -1 : 1)
		
		const trackMinRect = state.tracks[trackMin].rect
		const trackMaxRect = state.tracks[trackMax].rect
		
		ctx.beginPath()
		ctx.moveTo(trackMinRect.x1 + x + headSize, trackMinRect.y1)
		ctx.lineTo(trackMinRect.x1 + x,            trackMinRect.y1)
		ctx.lineTo(trackMaxRect.x1 + x,            trackMaxRect.y2)
		ctx.lineTo(trackMaxRect.x1 + x + headSize, trackMaxRect.y2)
		ctx.stroke()
		
		ctx.restore()
	}
	
	
	static renderCursorHighlight(state, ctx)
	{
		if (state.playback.playing)
			return
		
		if (state.rectSelection)
			return
		
		if (!state.cursor.visible)
			return
		
		const timeMin = state.cursor.time1.min(state.cursor.time2)
		const timeMax = state.cursor.time1.max(state.cursor.time2)
		const trackMin = Math.min(state.cursor.track1, state.cursor.track2)
		const trackMax = Math.max(state.cursor.track1, state.cursor.track2)
		const trackMinRect = state.tracks[trackMin].rect
		const trackMaxRect = state.tracks[trackMax].rect
		
		ctx.save()
		
		const x1 = Editor.xAtTime(state, timeMin)
		const x2 = Editor.xAtTime(state, timeMax)
		
		ctx.fillStyle = state.prefs.selectionCursorColor
		ctx.globalAlpha = 0.3
		ctx.fillRect(x1, trackMinRect.y1, x2 - x1, trackMaxRect.y2 - trackMinRect.y1)
		
		ctx.restore()
	}
	
	
	static renderRectSelectionContour(state, ctx, trackIndex)
	{
		if (state.playback.playing)
			return
		
		if (!state.rectSelection)
			return
		
		if (trackIndex != state.rectSelection.track)
			return
		
		const timeMin = state.rectSelection.time1.min(state.rectSelection.time2)
		const timeMax = state.rectSelection.time1.max(state.rectSelection.time2)
		const y1 = Math.min(state.rectSelection.y1, state.rectSelection.y2)
		const y2 = Math.max(state.rectSelection.y1, state.rectSelection.y2) + 1
		
		ctx.save()
		
		const x1 = Editor.xAtTime(state, timeMin)
		const x2 = Editor.xAtTime(state, timeMax)
		
		ctx.strokeStyle = state.prefs.selectionCursorColor
		ctx.lineCap = "square"
		ctx.lineWidth = 2
		ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
		
		ctx.restore()
	}
	
	
	static renderRectSelectionHighlight(state, ctx, trackIndex)
	{
		if (state.playback.playing)
			return
		
		if (!state.rectSelection)
			return
		
		if (trackIndex != state.rectSelection.track)
			return
		
		const timeMin = state.rectSelection.time1.min(state.rectSelection.time2)
		const timeMax = state.rectSelection.time1.max(state.rectSelection.time2)
		const y1 = Math.min(state.rectSelection.y1, state.rectSelection.y2)
		const y2 = Math.max(state.rectSelection.y1, state.rectSelection.y2) + 1
		
		ctx.save()
		
		const x1 = Editor.xAtTime(state, timeMin)
		const x2 = Editor.xAtTime(state, timeMax)
		
		ctx.fillStyle = state.prefs.selectionCursorColor
		ctx.globalAlpha = 0.3
		ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
		
		ctx.restore()
	}


	static Cursor = class EditorCursor
	{
		static setVisible(state, visible)
		{
			return { ...state,
				cursor: { ...state.cursor,
					visible,
				},
			}
		}
		
		
		static place(state, time, trackIndex)
		{
			if (trackIndex !== null)
				trackIndex = Math.max(0, Math.min(state.tracks.length - 1, trackIndex))

			return { ...state,
				cursor: { ...state.cursor,
					time1: time === null ? state.cursor.time1 : time,
					time2: time === null ? state.cursor.time2 : time,
					track1: trackIndex === null ? state.cursor.track1 : trackIndex,
					track2: trackIndex === null ? state.cursor.track2 : trackIndex,
				},
			}
		}
		
		
		static drag(state, time, trackIndex)
		{
			if (trackIndex !== null)
				trackIndex = Math.max(0, Math.min(state.tracks.length - 1, trackIndex))

			return { ...state,
				cursor: { ...state.cursor,
					time2: time === null ? state.cursor.time2 : time,
					track2: trackIndex === null ? state.cursor.track2 : trackIndex,
				},
			}
		}
	}
}