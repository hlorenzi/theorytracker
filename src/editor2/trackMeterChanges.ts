import Editor from "./editor"
import Track from "./track"
import TrackStateManager from "./trackStateManager"
import TrackState from "./trackState"
import Rect from "../util/rect"
import Range from "../util/range"
import Project from "../project/project2"
import Rational from "../util/rational"
import CanvasUtils from "../util/canvasUtils"
import * as Theory from "../theory/theory"


type TrackMeterChangesState = TrackState


type UpdateHoverInput =
{
    mouse:
    {
        pos: { x: number, y: number }
    }
}


export default class TrackMeterChanges
{
    static knobWidth = 16
    static knobHeight = 22


    static init(state: TrackStateManager<TrackState>)
    {
        Track.init(state)
        state.mergeTrackState({
            type: "meterChanges",
        })
    }
	
	
	static updateHover(state: TrackStateManager<TrackMeterChangesState>, input: UpdateHoverInput)
	{
        const checkRange = Editor.timeRangeAtX(
            state.contentStateManager,
            input.mouse.pos.x - TrackMeterChanges.knobWidth,
            input.mouse.pos.x + TrackMeterChanges.knobWidth)

        let hover = null
        
        for (const keyCh of TrackMeterChanges.iterAtRange(state, checkRange))
        {
            const rect = TrackMeterChanges.knobRectForMeterChange(state, keyCh.time)
            if (rect.contains(input.mouse.pos))
            {
                hover =
                {
                    id: keyCh.id,
                    range: Range.fromPoint(keyCh.time),
                    action: Editor.actionDragTime,
                }
            }
        }

        state.mergeContentState({
            mouse: {
                ...state.contentState.mouse,
                hover,
            }
        })
	}
	
	
	static elemsAt(state: TrackStateManager<TrackMeterChangesState>, region: any): Project.ID[]
	{
        const elems = []

        for (const meterCh of TrackMeterChanges.iterAtRange(state, region.range))
            elems.push(meterCh.id)

        return elems
	}


    static *iterAtRange(state: TrackStateManager<TrackMeterChangesState>, range: Range): Generator<Project.MeterChange, void, void>
    {
        const trackElems = state.appState.project.timedLists.get(state.trackState.trackId)
        if (!trackElems)
            return

        for (const keyCh of trackElems.iterAtRange(range))
            yield keyCh as Project.MeterChange
    }
	
	
	static knobRectForMeterChange(state: TrackStateManager<TrackMeterChangesState>, time: Rational)
	{
        return new Rect(
            Editor.xAtTime(state.contentStateManager, time) - TrackMeterChanges.knobWidth / 2,
            0,
            TrackMeterChanges.knobWidth,
            TrackMeterChanges.knobHeight)
	}


    static render(state: TrackStateManager<TrackMeterChangesState>, ctx: CanvasRenderingContext2D)
    {
        const visibleRange = Editor.visibleTimeRange(state.contentStateManager)

		for (const meterCh of TrackMeterChanges.iterAtRange(state, visibleRange))
            TrackMeterChanges.renderMeterChange(state, ctx, meterCh)
    }
	
	
	static renderMeterChangeKnob(state: TrackStateManager<TrackMeterChangesState>, ctx: CanvasRenderingContext2D, time: Rational)
	{
		const rect = TrackMeterChanges.knobRectForMeterChange(state, time)
		
		ctx.fillStyle = state.appState.prefs.editor.meterChangeColor
		
		ctx.beginPath()
		ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		ctx.fill()
	}
	
	
	static renderMeterChange(state: TrackStateManager<TrackMeterChangesState>, ctx: CanvasRenderingContext2D, meterCh: Project.MeterChange)
	{
		const rect = TrackMeterChanges.knobRectForMeterChange(state, meterCh.time)
		
		ctx.fillStyle = state.appState.prefs.editor.meterChangeColor
		
		ctx.beginPath()
		ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		ctx.fill()
		
		ctx.font = "14px Verdana"
		ctx.textAlign = "left"
		ctx.textBaseline = "middle"
		ctx.fillText(meterCh.meter.numerator + " / " + meterCh.meter.denominator, rect.x + rect.w + 5, rect.y + rect.h / 2)
		
		if (state.appState.selection.has(meterCh.id))
		{
			ctx.globalAlpha = 0.75
			ctx.fillStyle = "#fff"
			
			ctx.beginPath()
			ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2 - 3, 0, Math.PI * 2)
			ctx.fill()
			
			ctx.globalAlpha = 1
		}
		
		const hover = state.contentState.mouse.hover
		if (hover && hover.id === meterCh.id)
		{
			ctx.globalAlpha = 0.5
			ctx.fillStyle = "#fff"
			
			ctx.beginPath()
			ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
			ctx.fill()
			
			ctx.globalAlpha = 1
		}
	}
}