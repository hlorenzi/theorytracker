import Editor from "./editor"
import Track from "./track"
import TrackStateManager from "./trackStateManager"
import TrackMeterChangesState from "./trackMeterChangesState"
import Rect from "../util/rect"
import Range from "../util/range"
import Project from "../project/project2"
import Rational from "../util/rational"
import * as Theory from "../theory/theory"


export default class TrackMeterChanges
{
    static knobWidth = 16
    static knobHeight = 22


    static init(state: TrackStateManager<TrackMeterChangesState>)
    {
        Track.init(state)
        state.mergeTrackState({
            type: "meterChanges",
        })
    }
	
	
	static hover(state: TrackStateManager<TrackMeterChangesState>)
	{
        const pos = state.contentState.mouse.trackPos

        const checkRange = Editor.timeRangeAtX(
            state.contentStateManager,
            pos.x - TrackMeterChanges.knobWidth,
            pos.x + TrackMeterChanges.knobWidth)

        let hover = null
        
        for (const keyCh of TrackMeterChanges.iterAtRange(state, checkRange))
        {
            const rect = TrackMeterChanges.knobRectForMeterChange(state, keyCh.time)
            if (rect.contains(pos))
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
            mouse: { ...state.contentState.mouse,
                hover,
            }
        })
	}
    

	static drawClear(state: TrackStateManager<TrackMeterChangesState>)
    {
        state.mergeTrackState({ draw: null })
    }
    

	static drawHover(state: TrackStateManager<TrackMeterChangesState>)
    {
        const time =  state.contentState.mouse.time

        state.mergeTrackState({ draw: { time } })
    }
	
	
	static drawDrag(state: TrackStateManager<TrackMeterChangesState>)
	{
		const draw = state.trackState.draw
		if (draw)
		{
            const time = state.contentState.mouse.time
            state.mergeTrackState({ draw: { time } })
		}
	}
	
	
	static drawEnd(state: TrackStateManager<TrackMeterChangesState>)
	{
		const draw = state.trackState.draw
		if (draw)
		{
            const meterCh = new Project.MeterChange(
                state.trackState.trackId,
                draw.time,
                Editor.defaultMeter())

            const id = state.appState.project.nextId
            state.mergeAppState({
                project: Project.upsertTimedElement(state.appState.project, meterCh),
                selection: state.appState.selection.add(id),
            })
		}
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

        const firstMeter = Editor.meterAt(state.contentStateManager, state.trackState.trackId, visibleRange.start)
        let shouldDrawFirstKey = true

        for (const meterCh of TrackMeterChanges.iterAtRange(state, visibleRange))
        {
            if (shouldDrawFirstKey)
            {
                const x = Editor.xAtTime(state.contentStateManager, meterCh.time)
                if (x > 80)
                    TrackMeterChanges.renderMeterChangeLabel(state, ctx, firstMeter)
            }

            TrackMeterChanges.renderMeterChange(state, ctx, meterCh)
            shouldDrawFirstKey = false
        }

        if (shouldDrawFirstKey)
            TrackMeterChanges.renderMeterChangeLabel(state, ctx, firstMeter)
    
            
        const draw = state.trackState.draw
        if (draw)
        {
            ctx.globalAlpha = 0.6
            TrackMeterChanges.renderMeterChangeKnob(state, ctx, draw.time)
            ctx.globalAlpha = 1
        }
    }
	
	
	static renderMeterChangeKnob(state: TrackStateManager<TrackMeterChangesState>, ctx: CanvasRenderingContext2D, time: Rational)
	{
		const rect = TrackMeterChanges.knobRectForMeterChange(state, time)
		
		ctx.fillStyle = state.appState.prefs.editor.meterChangeColor
		
		ctx.beginPath()
		ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		ctx.fill()
	}
	
	
	static renderMeterChangeLabel(state: TrackStateManager<TrackMeterChangesState>, ctx: CanvasRenderingContext2D, meter: Theory.Meter)
	{
        const rect = TrackMeterChanges.knobRectForMeterChange(state, new Rational(0))
        const x = 5
		
		ctx.fillStyle = state.appState.prefs.editor.meterChangeColor
		
		ctx.font = "14px Verdana"
		ctx.textAlign = "left"
		ctx.textBaseline = "middle"
		ctx.fillText(meter.numerator + " / " + meter.denominator, x, rect.y + rect.h / 2)
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