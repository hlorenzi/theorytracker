import Project from "./project.js"
import Theory from "../theory.ts"
import { URLBinaryEncoder, URLBinaryDecoder } from "../util/urlBinaryEncoder.js"
import Rational from "../util/rational.js"
import Range from "../util/range.js"


export default class IOCompressedStr
{
	static read(str)
	{
		let song = new Project()
		
		if (!str.startsWith("3_") &&
			!str.startsWith("4_"))
			throw "unsupported version"
		
		const r = new URLBinaryDecoder(str.substr(2))
		
		// Read header.
		const version = r.readInteger()
		song.baseBpm = r.readInteger()
		
		if (version != 3 && version != 4)
			throw "unsupported version"

		// Read note tracks.
		const trackNum = r.readInteger()
		for (let j = 0; j < trackNum; j++)
		{
			// Read note data as structure-of-arrays.
			const noteNum = r.readInteger()
			
			let noteData = []
			
			let prevNoteRangeStartInteger = 0
			for (let i = 0; i < noteNum; i++)
			{
				prevNoteRangeStartInteger += r.readInteger() // range.start.integer
				noteData[i] = [ prevNoteRangeStartInteger ]
			}
			
			for (let i = 0; i < noteNum; i++)
				noteData[i][1] = r.readInteger() // range.start.numeratorWithoutInteger
				
			for (let i = 0; i < noteNum; i++)
				noteData[i][2] = r.readInteger() // range.start.denominator
			
			for (let i = 0; i < noteNum; i++)
				noteData[i][3] = r.readInteger() // range.duration.numerator
			
			for (let i = 0; i < noteNum; i++)
				noteData[i][4] = r.readInteger() // range.duration.denominator
				
			for (let i = 0; i < noteNum; i++)
			{
				const start = Rational.fromIntegerPlusRational(noteData[i][0], noteData[i][1], noteData[i][2])
				const duration = new Rational(noteData[i][3], noteData[i][4])
					
				song = song.upsertNote(new Project.Note(
					Range.fromStartDuration(start, duration),
					r.readInteger() + 60))
			}
		}
	
		// Read chord data as structure-of-arrays.
		const chordNum = r.readInteger()
		
		let chordData = []
		
		let prevChordRangeStartInteger = 0
		for (let i = 0; i < chordNum; i++)
		{
			prevChordRangeStartInteger += r.readInteger() // range.start.integer
			chordData[i] = [ prevChordRangeStartInteger ]
		}
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][1] = r.readInteger() // range.start.numeratorWithoutInteger
			
		for (let i = 0; i < chordNum; i++)
			chordData[i][2] = r.readInteger() // range.start.denominator
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][3] = r.readInteger() // range.duration.numerator
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][4] = r.readInteger() // range.duration.denominator
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][5] = r.readInteger() // chord.rootMidi
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][6] = r.readInteger() // chord.rootAccidental
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][7] = r.readString() // chord.kindId
		
		if (version >= 4)
		{
			for (let i = 0; i < chordNum; i++)
				chordData[i][8] = r.readInteger() // chord.inversion
		}

		for (let i = 0; i < chordNum; i++)
			chordData[i][9] = r.readInteger() // chord.modifiers.length
		
		if (version >= 4)
		{
			for (let i = 0; i < chordNum; i++)
			{
				chordData[i][10] = []
				for (let mod = 0; mod < chordData[i][9]; mod++)
					chordData[i][10].push([r.readString(), r.readInteger()]) // chord.modifiers[mod]
			}
		}
		else
		{
			for (let i = 0; i < chordNum; i++)
				for (let mod = 0; mod < chordData[i][8]; mod++)
					r.readString()
		}
		
		for (let i = 0; i < chordNum; i++)
		{
			const start = Rational.fromIntegerPlusRational(chordData[i][0], chordData[i][1], chordData[i][2])
			const duration = new Rational(chordData[i][3], chordData[i][4])
			
			song = song.upsertChord(new Project.Chord(
				Range.fromStartDuration(start, duration),
				new Theory.Chord(
					chordData[i][5],
					chordData[i][6],
					Theory.Chord.kindFromId(chordData[i][7]),
					chordData[i][8],
					chordData[i][10])))
		}
		
		// Read key change data as structure-of-arrays.
		const keyChangeNum = r.readInteger()
		
		let keyChangeData = []
		
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i] = [ r.readInteger() ] // time.numerator
			
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i][1] = r.readInteger() // time.denominator
		
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i][2] = r.readInteger() // key.tonic.letter
		
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i][3] = r.readInteger() // key.tonic.accidental
		
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i][4] = r.readInteger() // key.scale.chromas.length
		
		for (let i = 0; i < keyChangeNum; i++)
		{
			keyChangeData[i][5] = []
			for (let p = 0; p < keyChangeData[i][4]; p++)
				keyChangeData[i][5][p] = r.readInteger() // key.scale.chromas[p]
		}
		
		for (let i = 0; i < keyChangeNum; i++)
		{
			const time = new Rational(keyChangeData[i][0], keyChangeData[i][1])
				
			song = song.upsertKeyChange(new Project.KeyChange(
				time,
				new Theory.Key(
					new Theory.PitchName(keyChangeData[i][2], keyChangeData[i][3]),
					Theory.Scale.fromChromas(keyChangeData[i][5]))))
		}
		
		// Read meter change data as structure-of-arrays.
		const meterChangeNum = r.readInteger()
		
		let meterChangeData = []
		
		for (let i = 0; i < meterChangeNum; i++)
			meterChangeData[i] = [ r.readInteger() ] // time.numerator
			
		for (let i = 0; i < meterChangeNum; i++)
			meterChangeData[i][1] = r.readInteger() // time.denominator
		
		for (let i = 0; i < meterChangeNum; i++)
			meterChangeData[i][2] = r.readInteger() // numerator
		
		for (let i = 0; i < meterChangeNum; i++)
			meterChangeData[i][3] = r.readInteger() // denominator
		
		for (let i = 0; i < meterChangeNum; i++)
		{
			const time = new Rational(meterChangeData[i][0], meterChangeData[i][1])
				
			song = song.upsertMeterChange(new Project.MeterChange(
				time,
				new Theory.Meter(meterChangeData[i][2], meterChangeData[i][3])))
		}
		
		return song.withRefreshedRange()
    }
    
    
	static write(project)
	{
		const song = project.withRefreshedRange()
		
		const w = new URLBinaryEncoder()

		// Write header.
		w.writeInteger(4) // Version
		w.writeInteger(project.baseBpm)
		
		// Write note tracks.
		const trackNum = 1
		w.writeInteger(trackNum)
		for (var j = 0; j < trackNum; j++)
		{
			// Write note data as a structure-of-arrays.
			w.writeInteger(project.notes.size)
			
			let prevNoteRangeStartInteger = 0
			for (const note of project.notes.iterAll())
			{
				w.writeInteger(note.range.start.integer - prevNoteRangeStartInteger)
				prevNoteRangeStartInteger = note.range.start.integer
			}
			
			for (const note of project.notes.iterAll())
				w.writeInteger(note.range.start.numeratorWithoutInteger)

			for (const note of project.notes.iterAll())
				w.writeInteger(note.range.start.denominator)

			for (const note of project.notes.iterAll())
				w.writeInteger(note.range.duration.numerator)

			for (const note of project.notes.iterAll())
				w.writeInteger(note.range.duration.denominator)

			for (const note of project.notes.iterAll())
				w.writeInteger(note.pitch - 60)
		}

		// Write chord data as a structure-of-arrays.
		w.writeInteger(project.chords.size)

		let prevChordRangeStartInteger = 0
		for (const chord of project.chords.iterAll())
		{
			w.writeInteger(chord.range.start.integer - prevChordRangeStartInteger)
			prevChordRangeStartInteger = chord.range.start.integer
		}
		
		for (const chord of project.chords.iterAll())
			w.writeInteger(chord.range.start.numeratorWithoutInteger)

		for (const chord of project.chords.iterAll())
			w.writeInteger(chord.range.start.denominator)

		for (const chord of project.chords.iterAll())
			w.writeInteger(chord.range.duration.numerator)

		for (const chord of project.chords.iterAll())
			w.writeInteger(chord.range.duration.denominator)

		for (const chord of project.chords.iterAll())
			w.writeInteger(chord.chord.rootMidi)

		for (const chord of project.chords.iterAll())
			w.writeInteger(chord.chord.rootAccidental)

		for (const chord of project.chords.iterAll())
			w.writeString(chord.chord.kindId)

		for (const chord of project.chords.iterAll())
			w.writeInteger(chord.chord.inversion)

		for (const chord of project.chords.iterAll())
			w.writeInteger(chord.chord.modifiers.length)

		for (const chord of project.chords.iterAll())
			for (const mod of chord.chord.modifiers)
			{
				w.writeString(mod[0])
				w.writeInteger(mod[1])
			}
		
		// Write key change data as a structure-of-arrays.
		w.writeInteger(project.keyChanges.size)

		for (const keyChange of project.keyChanges.iterAll())
			w.writeInteger(keyChange.time.numerator)

		for (const keyChange of project.keyChanges.iterAll())
			w.writeInteger(keyChange.time.denominator)

		for (const keyChange of project.keyChanges.iterAll())
			w.writeInteger(keyChange.key.tonic.letter)

		for (const keyChange of project.keyChanges.iterAll())
			w.writeInteger(keyChange.key.tonic.accidental)

		for (const keyChange of project.keyChanges.iterAll())
			w.writeInteger(keyChange.key.scale.chromas.length)

		for (const keyChange of project.keyChanges.iterAll())
			for (const p of keyChange.key.scale.chromas)
				w.writeInteger(p)
		
		// Write meter change data as a structure-of-arrays.
		w.writeInteger(project.meterChanges.size)

		for (const meterChange of project.meterChanges.iterAll())
			w.writeInteger(meterChange.time.numerator)

		for (const meterChange of project.meterChanges.iterAll())
			w.writeInteger(meterChange.time.denominator)

		for (const meterChange of project.meterChanges.iterAll())
			w.writeInteger(meterChange.meter.numerator)

		for (const meterChange of project.meterChanges.iterAll())
			w.writeInteger(meterChange.meter.denominator)
		
		
		console.log(w.getCompressedURLSafe().length)
		return "4_" + w.getCompressedURLSafe()
	}
}