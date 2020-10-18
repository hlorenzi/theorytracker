import Project from "./project.js"
import Theory from "../theory.ts"
import Rational from "../util/rational.js"
import Range from "../util/range.js"


export default class IOJson
{
    static write(project)
	{
		let str = "{\n"
		
		str += "\"version\": " + 4 + ",\n"
		str += "\"bpm\": " + project.baseBpm + ",\n"
		str += "\n"
		
		str += "\"tracks\":\n"
		str += "[\n"
		for (let track = 0; track < 1; track++)
		{
			str += "{\n"
			str += "\"notes\":\n"
			str += "[\n"
			let firstNote = true
			for (const note of project.notes.iterAll())
			{
				if (!firstNote)
					str += ",\n"
				
				firstNote = false
				
				str += "["
				str += note.range.start   .toJSONString() + ","
				str += note.range.duration.toJSONString() + ","
				str += note.pitch
				str += "]"
			}
			str += "\n"
			str += "]\n"
			str += "}\n"
		}
		str += "],\n"
		str += "\n"
		
		str += "\"chords\":\n"
		str += "[\n"
		let firstChord = true
		for (const chord of project.chords.iterAll())
		{
			if (!firstChord)
				str += ",\n"
			
			firstChord = false
			
			str += "["
			str += chord.range.start   .toJSONString() + ","
			str += chord.range.duration.toJSONString() + ","
			str += chord.chord.rootMidi + ","
			str += chord.chord.rootAccidental + ","
			str += "\"" + chord.chord.kindId + "\","
			str += chord.chord.inversion + ","
			str += JSON.stringify(chord.chord.modifiers)
			str += "]"
		}
		str += "\n"
		str += "],\n"
		str += "\n"
		
		str += "\"keyChanges\":\n"
		str += "[\n"
		let firstKeyChange = true
		for (const keyChange of project.keyChanges.iterAll())
		{
			if (!firstKeyChange)
				str += ",\n"
			
			firstKeyChange = false
			
			str += "["
			str += keyChange.time.toJSONString() + ","
			str += keyChange.key.tonic.letter + ","
			str += keyChange.key.tonic.accidental + ","
			str += "[" + keyChange.key.scale.chromas.join(",") + "]"
			str += "]"
		}
		str += "\n"
		str += "],\n"
		str += "\n"
		
		str += "\"meterChanges\":\n"
		str += "[\n"
		let firstMeterChange = true
		for (const meterChange of project.meterChanges.iterAll())
		{
			if (!firstMeterChange)
				str += ",\n"
			
			firstMeterChange = false
			
			str += "["
			str += meterChange.time.toJSONString() + ","
			str += meterChange.meter.numerator + ","
			str += meterChange.meter.denominator
			str += "]"
		}
		str += "\n"
		str += "]\n"
		
		str += "}"
		return str
    }
    

    static read(json)
	{
		let song = new Project()
		song.baseBpm = json.bpm
		
		for (const note of json.tracks[0].notes)
			song = song.upsertNote(new Project.Note(
				Range.fromStartDuration(Rational.fromArray(note[0]), Rational.fromArray(note[1])),
				note[2]))
		
		if (json.version >= 4)
		{
			for (const chord of json.chords)
			{
				let modifiers = []
				for (const mod of chord[6])
					modifiers.push(mod)
				
				song = song.upsertChord(new Project.Chord(
					Range.fromStartDuration(Rational.fromArray(chord[0]), Rational.fromArray(chord[1])),
					new Theory.Chord(chord[2], chord[3], Theory.Chord.kindFromId(chord[4]), chord[5], modifiers)))
			}
			
			for (const keyChange of json.keyChanges)
				song = song.upsertKeyChange(new Project.KeyChange(
					Rational.fromArray(keyChange[0]),
					new Theory.Key(
						new Theory.PitchName(keyChange[1], keyChange[2]),
						Theory.Scale.fromChromas(keyChange[3]))))
		}
		else if (json.version == 3)
		{
			for (const chord of json.chords)
			{
				song = song.upsertChord(new Project.Chord(
					Range.fromStartDuration(Rational.fromArray(chord[0]), Rational.fromArray(chord[1])),
					new Theory.Chord(chord[2], chord[3], Theory.Chord.kindFromId(chord[4]), 0, [])))
			}
			
			for (const keyChange of json.keyChanges)
				song = song.upsertKeyChange(new Project.KeyChange(
					Rational.fromArray(keyChange[0]),
					new Theory.Key(
						new Theory.PitchName(
							Theory.Utils.chromaToLetter(keyChange[1] + keyChange[2]) || 0,
							Theory.Utils.chromaToAccidental(keyChange[1] + keyChange[2]) || 0),
						Theory.Scale.fromChromas(keyChange[3]))))
		}
		else
		{
			const oldChordKinds =
				["M","m","+","o","5","6","m6","7","maj7","m7","mmaj7","+7","+maj7","o7","%7","9","maj9","m9","mmaj9","9?","+9","+maj9","o9","ob9","%9","%b9"]
			
			for (const chord of json.chords)
				song = song.upsertChord(new Project.Chord(
					Range.fromStartDuration(Rational.fromArray(chord[0]), Rational.fromArray(chord[1])),
					new Theory.Chord(chord[3], chord[4], Theory.Chord.kindFromId(oldChordKinds[chord[2]]), 0, [])))
			
			const oldScales = [ "Major", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Minor", "Locrian" ]
			
			for (const keyChange of json.keyChanges)
				song = song.upsertKeyChange(new Project.KeyChange(
					Rational.fromArray(keyChange[0]),
					new Theory.Key(
						new Theory.PitchName(
							Theory.Utils.chromaToLetter(keyChange[2] + keyChange[3]) || 0,
							Theory.Utils.chromaToAccidental(keyChange[2] + keyChange[3]) || 0),
						Theory.Scale.parse(oldScales[keyChange[1]]))))
		}
		
		for (const meterChange of json.meterChanges)
			song = song.upsertMeterChange(new Project.MeterChange(
				Rational.fromArray(meterChange[0]),
				new Theory.Meter(meterChange[1], meterChange[2])))
		
		return song.withRefreshedRange()
	}
}