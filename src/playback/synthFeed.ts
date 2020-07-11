import Rational from "../util/rational"
import Project from "../project/project2"
import { Synth } from "./synth"
import MathUtils from "../util/mathUtils"


export default class SynthFeed
{
    static feed(project: Project, synth: Synth, startTick: Rational, useChordPatterns = true)
    {
        const chordVolumeMul = 0.5
        
        const addNoteEvent = (tickStart: Rational, duration: Rational, instrument: number, pitch: number, volume: number) =>
        {
            const offsetStart = tickStart.subtract(startTick)
            
            const measuresPerSecond = 120 / 4 / 60//(project.baseBpm / 4 / 60)
            
            let timeStart = offsetStart.asFloat() / measuresPerSecond
            let timeDuration = duration.asFloat() / measuresPerSecond
            
            if (timeStart <= 0)
            {
                timeDuration += timeStart
                timeStart = 0
            }
            
            if (timeDuration <= 0)
                return
            
            //console.log("event note [" + pitch + "] at tick " + tickStart.toString() + " = " + timeStart + " s")
            synth.addNoteEvent(timeStart, instrument, MathUtils.midiToHertz(pitch), volume, timeDuration)
        }
        
        // Register notes.
        for (const track of project.tracks)
        {
            const rangedList = project.rangedLists.get(track.id)
            if (!rangedList)
                continue
            
            for (const elem of rangedList.iterAll())
            {
                if (elem.type != Project.ElementType.Note)
                    continue

                const note = <Project.Note>elem

                if (note.range.end.compare(startTick) <= 0)
                    continue
                
                addNoteEvent(note.range.start, note.range.duration, 0, note.pitch, 1)
            }
        }
    }
}
