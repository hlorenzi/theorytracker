import Project from "../project/project2"
import * as Theory from "../theory/theory"
import { MidiFileReader } from "../util/midi"
import Rational from "../util/rational.js"
import Range from "../util/range.js"


export default class IoMidi
{
    static read(bytes: number[] | Buffer | Uint8Array): Project
	{
		const midi = MidiFileReader.fromBytes(bytes)
		console.log(midi)
		
		const findFirstEvent = (kind: string) =>
		{
			for (const track of midi.tracks)
				for (const ev of track.events)
					if (ev.kind == kind)
						return ev
					
			return null
		}
        
        let project = new Project()
        
		const tempoEv = findFirstEvent("setTempo")
		const msPerQuarterNote = (tempoEv ? tempoEv.msPerQuarterNote : 500000)
		project.baseBpm = Math.round(60 * 1000 * 1000 / msPerQuarterNote)
		
        const track1Id = project.nextId
        project = Project.upsertTrack(project, new Project.TrackKeyChanges())
        
        const track2Id = project.nextId
        project = Project.upsertTrack(project, new Project.TrackMeterChanges())

        project = Project.upsertTimedElement(project, new Project.KeyChange(track1Id, new Rational(0), Theory.Key.parse("D Major")))
        project = Project.upsertTimedElement(project, new Project.MeterChange(track2Id, new Rational(0), new Theory.Meter(4, 4)))

		/*for (const track of midi.tracks)
		{
			for (const ev of track.events)
			{
				if (ev.kind != "setKeySignature")
					continue
				
				const tonicPitches     = [ 0,  7,  2,  9,  4, 11, 5, 0, 7, 2, 9, 4, 11, 5, 0, 7, 2, 9, 4, 11]
				const tonicLetters     = [ 0,  4,  1,  5,  2,  6, 3, 0, 4, 1, 5, 2,  6, 3, 0, 4, 1, 5, 2,  6]
				const tonicAccidentals = [-1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0,  0, 1, 1, 1, 1, 1, 1,  1]
				const index = ev.accidentals + 7 + (ev.scale == 0 ? 0 : 2)
				
				if (index < 0 || index >= tonicPitches.length)
					continue
				
				const time = Rational.fromFloat(ev.time / midi.ticksPerQuarterNote / 4, 27720)
				song = song.upsertKeyChange(new Project.KeyChange(time,
					new Theory.Key(
						new Theory.PitchName(tonicLetters[index], tonicAccidentals[index]),
						Theory.Scale.parse(ev.scale == 0 ? "Major" : "Minor"))))
			}
		}
		
		for (const track of midi.tracks)
		{
			for (const ev of track.events)
			{
				if (ev.kind != "setTimeSignature")
					continue
				
				const time = Rational.fromFloat(ev.time / midi.ticksPerQuarterNote / 4, 27720)
				song = song.upsertMeterChange(new Project.MeterChange(time, new Theory.Meter(ev.numerator, ev.denominator)))
			}
        }*/
        
		for (const track of midi.tracks)
		{
            const trackId = project.nextId
            project = Project.upsertTrack(project, new Project.TrackNotes())
    
			for (const noteOn of track.events)
			{
				if (noteOn.kind != "noteOn" || noteOn.channel == 9 || noteOn.velocity == 0)
					continue

				let noteOff = null
				for (const ev of track.events)
				{
					if (ev.kind != "noteOn" && ev.kind != "noteOff")
						continue
					
					if (ev.time <= noteOn.time || ev.channel != noteOn.channel || ev.key != noteOn.key)
						continue
					
					if (noteOff == null || ev.time < noteOff.time)
					{
						noteOff = ev
						break
					}
				}
				
				if (!noteOff)
					continue
				
				const onTick  = Rational.fromFloat(noteOn.time  / midi.ticksPerQuarterNote / 4, 27720)
				const offTick = Rational.fromFloat(noteOff.time / midi.ticksPerQuarterNote / 4, 27720)
				
				project = Project.upsertRangedElement(project,
					new Project.Note(trackId, new Range(onTick, offTick), noteOn.key))
			}
		}
		
		/*if (!song.keyChanges.findActiveAt(new Rational(0)))
            song = song.upsertKeyChange(new Project.KeyChange(new Rational(0), Theory.Key.parse("C Major")))
    
        if (!song.meterChanges.findActiveAt(new Rational(0)))
            song = song.upsertMeterChange(new Project.MeterChange(new Rational(0), new Theory.Meter(4, 4)))
        */
		return project//.withRefreshedRange()
	}
}