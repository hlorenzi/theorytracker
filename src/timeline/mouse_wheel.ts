import * as Timeline from "./index.ts"
import Rational from "../utils/rational.ts"


export function mouseWheel(
    timeline: Timeline.State,
    deltaX: number,
    deltaY: number)
{
    if (Math.abs(deltaX) > 0)
    {
        timeline.timeScroll = timeline.timeScroll + 0.01 / (timeline.timeScale / 100) * deltaX
        timeline.mouse.wheelDate = new Date()
    }
    else if (new Date().getTime() - timeline.mouse.wheelDate.getTime() > 250)
    {
        const snap = new Rational(1, 1024)
        const prevMouseTime = Timeline.timeAtX(
            timeline,
            timeline.mouse.point.pos.x,
            snap)
        
        let newTimeScale = timeline.timeScale * (deltaY > 0 ? 0.8 : 1.25)
        newTimeScale = Math.max(4, Math.min(2048, newTimeScale))
        timeline.timeScale = newTimeScale
        
        const newMouseTime = Timeline.timeAtX(
            timeline,
            timeline.mouse.point.pos.x,
            snap)
        
        const newTimeScroll = timeline.timeScroll - newMouseTime.subtract(prevMouseTime).asFloat()
        
        const timeSnapAdjustThresholdUpper = 24
        const timeSnapAdjustThresholdLower = 8
        let newTimeSnap = timeline.timeSnapBase
        
        if (newTimeSnap.asFloat() * newTimeScale > timeSnapAdjustThresholdUpper)
            while (newTimeSnap.asFloat() * newTimeScale > timeSnapAdjustThresholdUpper)
                newTimeSnap = newTimeSnap.divide(new Rational(2))
            
        else if (newTimeSnap.asFloat() * newTimeScale < timeSnapAdjustThresholdLower)
            while (newTimeSnap.asFloat() * newTimeScale < timeSnapAdjustThresholdLower)
                newTimeSnap = newTimeSnap.divide(new Rational(1, 2))
            
        timeline.timeScroll = newTimeScroll
        timeline.timeSnap = newTimeSnap
    }
}