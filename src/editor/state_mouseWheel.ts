import * as Editor from "./index"
import Rational from "../util/rational"

	
export function mouseWheel(data: Editor.EditorUpdateData, deltaX: number, deltaY: number)
{
    if (Math.abs(deltaX) > 0)
    {
        data.state.timeScroll = data.state.timeScroll + 0.01 / (data.state.timeScale / 100) * deltaX
        data.state.mouse.wheelDate = new Date()
    }
    else if (new Date().getTime() - data.state.mouse.wheelDate.getTime() > 250)
    {
        const snap = new Rational(1, 1024)
        const prevMouseTime = Editor.timeAtX(
            data,
            data.state.mouse.point.pos.x,
            snap)
        
        let newTimeScale = data.state.timeScale * (deltaY > 0 ? 0.8 : 1.25)
        newTimeScale = Math.max(4, Math.min(2048, newTimeScale))
        data.state.timeScale = newTimeScale
        
        const newMouseTime = Editor.timeAtX(
            data,
            data.state.mouse.point.pos.x,
            snap)
        
        const newTimeScroll = data.state.timeScroll - newMouseTime.subtract(prevMouseTime).asFloat()
        
        const timeSnapAdjustThresholdUpper = 24
        const timeSnapAdjustThresholdLower = 8
        let newTimeSnap = data.state.timeSnapBase
        
        if (newTimeSnap.asFloat() * newTimeScale > timeSnapAdjustThresholdUpper)
            while (newTimeSnap.asFloat() * newTimeScale > timeSnapAdjustThresholdUpper)
                newTimeSnap = newTimeSnap.divide(new Rational(2))
            
        else if (newTimeSnap.asFloat() * newTimeScale < timeSnapAdjustThresholdLower)
            while (newTimeSnap.asFloat() * newTimeScale < timeSnapAdjustThresholdLower)
                newTimeSnap = newTimeSnap.divide(new Rational(1, 2))
            
        data.state.timeScroll = newTimeScroll
        data.state.timeSnap = newTimeSnap
    }
}