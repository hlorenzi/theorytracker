import * as Timeline from "./index"
import Rational from "../util/rational"

	
export function mouseWheel(state: Timeline.State, deltaX: number, deltaY: number)
{
    if (Math.abs(deltaX) > 0)
    {
        state.timeScroll = state.timeScroll + 0.01 / (state.timeScale / 100) * deltaX
        state.mouse.wheelDate = new Date()
    }
    else if (new Date().getTime() - state.mouse.wheelDate.getTime() > 250)
    {
        const snap = new Rational(1, 1024)
        const prevMouseTime = Timeline.timeAtX(
            state,
            state.mouse.point.pos.x,
            snap)
        
        let newTimeScale = state.timeScale * (deltaY > 0 ? 0.8 : 1.25)
        newTimeScale = Math.max(4, Math.min(2048, newTimeScale))
        state.timeScale = newTimeScale
        
        const newMouseTime = Timeline.timeAtX(
            state,
            state.mouse.point.pos.x,
            snap)
        
        const newTimeScroll = state.timeScroll - newMouseTime.subtract(prevMouseTime).asFloat()
        
        const timeSnapAdjustThresholdUpper = 24
        const timeSnapAdjustThresholdLower = 8
        let newTimeSnap = state.timeSnapBase
        
        if (newTimeSnap.asFloat() * newTimeScale > timeSnapAdjustThresholdUpper)
            while (newTimeSnap.asFloat() * newTimeScale > timeSnapAdjustThresholdUpper)
                newTimeSnap = newTimeSnap.divide(new Rational(2))
            
        else if (newTimeSnap.asFloat() * newTimeScale < timeSnapAdjustThresholdLower)
            while (newTimeSnap.asFloat() * newTimeScale < timeSnapAdjustThresholdLower)
                newTimeSnap = newTimeSnap.divide(new Rational(1, 2))
            
        state.timeScroll = newTimeScroll
        state.timeSnap = newTimeSnap
    }
}