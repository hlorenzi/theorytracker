import Rational from "../util/rational.js"
import MathUtils from "../util/math.js"
import Editor from "../editor/editor.js"


export default class PlaybackSynth
{
    static feedToSynth(project, synth, startTick, useChordPatterns = true)
    {
        const chordVolumeMul = 0.5
        
        const addNoteEvent = (tickStart, duration, instrument, pitch, volume) =>
        {
            const offsetStart = tickStart.subtract(startTick)
            
            const measuresPerSecond = (project.baseBpm / 4 / 60)
            
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
            for (const note of track.notes.iterAll())
            {
                if (note.range.end.compare(startTick) <= 0)
                    continue
                
                addNoteEvent(note.range.start, note.range.duration, 0, note.pitch, 1)
            }
        }

        // Register chords.
        for (const chord of project.chords.iterAll())
        {
            if (chord.range.end.compare(startTick) <= 0)
                continue
            
            const pitches = chord.chord.strummingPitches
                
            if (!useChordPatterns)
            {
                for (let j = 0; j < pitches.length; j++)
                    addNoteEvent(chord.range.start, chord.range.duration, 1, pitches[j], chordVolumeMul)
                
                continue
            }
                
            const meterCh = project.meterChanges.findActiveAt(chord.range.start)
            const meter = meterCh ? meterCh.meter : Editor.defaultMeter()
            const meterBeatLength = new Rational(1, meter.denominator)
            const measureBreak = null//that.forcedMeasures.findActiveAt(chord.range.start)
            
            const pattern = getChordStrummingPattern(meter)
            
            let tick = meterCh ? meterCh.time : chord.range.start
            //if (measureBreak != null)
            //	tick.max(measureBreak.tick)
            
            let skipTick = new Rational(0)
            let patternIndex = 0
            let mustPlayFirstBeat = false
            
            while (tick.compare(chord.range.end) < 0)
            {
                const patternBeat = pattern[patternIndex]
                const patternBeatKind = patternBeat[0]
                let patternBeatLength = patternBeat[1].multiply(meterBeatLength)
                patternIndex = (patternIndex + 1) % pattern.length
                
                let nextTick = tick.add(patternBeatLength)
                if (nextTick.compare(chord.range.end) > 0)
                {
                    nextTick = chord.range.end
                    patternBeatLength = nextTick.subtract(tick)
                }
                
                // Handle beats after the first one.
                if (tick.compare(chord.range.start) > 0 && skipTick.compare(new Rational(0)) <= 0)
                {
                    if (mustPlayFirstBeat)
                    {
                        mustPlayFirstBeat = false
                        for (let j = 0; j < pitches.length; j++)
                            addNoteEvent(chord.range.start, tick.subtract(chord.range.start), 1, pitches[j], chordVolumeMul)
                    }
                    
                    switch (patternBeatKind)
                    {
                        case 0:
                        {
                            for (let j = 0; j < pitches.length; j++)
                                addNoteEvent(tick, patternBeatLength, 1, pitches[j], 0.9 * chordVolumeMul)
                            break
                        }
                        case 1:
                        {
                            for (let j = 1; j < pitches.length; j++)
                                addNoteEvent(tick, patternBeatLength, 1, pitches[j], 0.5 * chordVolumeMul)
                            break
                        }
                        case 2:
                        {
                            addNoteEvent(tick, patternBeatLength, 1, pitches[0], 0.5 * chordVolumeMul)
                            break
                        }
                    }
                }
                
                skipTick = skipTick.subtract(patternBeatLength)
                
                if (tick.compare(chord.range.start) <= 0 && nextTick.compare(chord.range.start) > 0)
                {
                    mustPlayFirstBeat = true
                    
                    if (!(tick.compare(chord.range.start) == 0 && patternBeatKind == 0))
                        skipTick = pattern[0][1].multiply(meterBeatLength)
                }
                
                tick = nextTick
            }
            
            if (mustPlayFirstBeat)
            {
                mustPlayFirstBeat = false
                for (let j = 0; j < pitches.length; j++)
                    addNoteEvent(chord.range.start, tick.subtract(chord.range.start), 1, pitches[j], 0.7)
            }
        }
    }
}


function getChordStrummingPattern(meter)
{
	// [[beat kind, duration], ...]
	// Beat kinds:
	//   0: Full chord
	//   1: Full chord minus bass
	//   2: Only bass
	const one   = [[0, new Rational(1)]]
	const two   = [[0, new Rational(1)], [1, new Rational(1, 2)], [2, new Rational(1, 2)]]
	const three = [[0, new Rational(1)], [1, new Rational(1)   ], [1, new Rational(1)   ]]
	
	switch (meter.numerator)
	{
		case 2: return two
		case 3: return three
		case 4: return two.concat(two)
		case 5: return three.concat(two)
		case 6: return three.concat(three)
		case 7: return three.concat(two).concat(two)
		case 8: return two.concat(two).concat(two).concat(two)
		case 9: return three.concat(three).concat(three)
		
		default:
		{
			let pattern = []
			for (let i = 0; i < meter.numerator; i++)
				pattern = pattern.concat(one)
			return pattern
		}
	}
}
