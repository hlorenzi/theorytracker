import * as Theory from "."
import assert from "assert"


export function test()
{
	const c = Theory.PitchName.parse("C")
	assert.strictEqual(c.letter, 0)
	assert.strictEqual(c.accidental, 0)
	assert.strictEqual(c.str, "C")
	assert.strictEqual(c.midi, 0)
	assert.strictEqual(c.chroma, 0)

	const fb = Theory.PitchName.parse("Fb")
	assert.strictEqual(fb.letter, 3)
	assert.strictEqual(fb.accidental, -1)
	assert.strictEqual(fb.str, "Fb")
	assert.strictEqual(fb.midi, 4)
	assert.strictEqual(fb.chroma, 4)

	const bsss = Theory.PitchName.parse("B###")
	assert.strictEqual(bsss.letter, 6)
	assert.strictEqual(bsss.accidental, 3)
	assert.strictEqual(bsss.str, "B###")
	assert.strictEqual(bsss.midi, 14)
	assert.strictEqual(bsss.chroma, 2)

	const d5 = Theory.Pitch.parse("D5")
	assert.strictEqual(d5.str, "D5")
	assert.strictEqual(d5.name.str, "D")
	assert.strictEqual(d5.midi, 62)
	assert.strictEqual(d5.chroma, 2)

	const cMajorKey = Theory.Key.parse("C Major")
	assert.strictEqual(cMajorKey.str, "C Major")
	assert.strictEqual(cMajorKey.tonic.str, "C")
	assert.strictEqual(cMajorKey.scale.name, "Major")
	assert.strictEqual(cMajorKey.degreeForPitch(c), 0)
	assert.strictEqual(cMajorKey.degreeForPitch(fb), 2)
	assert.strictEqual(cMajorKey.degreeForPitch(bsss), 1)
	assert.strictEqual(cMajorKey.degreeForPitch(d5), 1)
	assert.strictEqual(cMajorKey.octavedDegreeForPitch(c), 0)
	assert.strictEqual(cMajorKey.octavedDegreeForPitch(fb), 2)
	assert.strictEqual(cMajorKey.octavedDegreeForPitch(bsss), 8)
	assert.strictEqual(cMajorKey.octavedDegreeForPitch(d5), 5 * 7 + 1)
	assert.strictEqual(cMajorKey.nameForPitch(c).str, "C")
	assert.strictEqual(cMajorKey.nameForPitch(fb).str, "E")
	assert.strictEqual(cMajorKey.nameForPitch(bsss).str, "D")
	assert.strictEqual(cMajorKey.nameForPitch(d5).str, "D")
	assert.strictEqual(cMajorKey.midiForDegree(0), 0)
	assert.strictEqual(cMajorKey.midiForDegree(4), 7)
	assert.strictEqual(cMajorKey.midiForDegree(6), 11)

	const fsMinorKey = Theory.Key.parse("F# Minor")
	assert.strictEqual(fsMinorKey.str, "F# Natural Minor")
	assert.strictEqual(fsMinorKey.tonic.str, "F#")
	assert.strictEqual(fsMinorKey.scale.name, "Natural Minor")
	assert.strictEqual(fsMinorKey.degreeForPitch(c), 3.5)
	assert.strictEqual(fsMinorKey.degreeForPitch(fb), 6)
	assert.strictEqual(fsMinorKey.degreeForPitch(bsss), 5)
	assert.strictEqual(fsMinorKey.degreeForPitch(d5), 5)
	assert.strictEqual(fsMinorKey.octavedDegreeForPitch(c), -3.5)
	assert.strictEqual(fsMinorKey.octavedDegreeForPitch(fb), -1)
	assert.strictEqual(fsMinorKey.octavedDegreeForPitch(bsss), 5)
	assert.strictEqual(fsMinorKey.octavedDegreeForPitch(d5), 4 * 7 + 5)
	assert.strictEqual(fsMinorKey.nameForPitch(c).str, "C")
	assert.strictEqual(fsMinorKey.nameForPitch(fb).str, "E")
	assert.strictEqual(fsMinorKey.nameForPitch(bsss).str, "D")
	assert.strictEqual(fsMinorKey.nameForPitch(d5).str, "D")
	assert.strictEqual(fsMinorKey.midiForDegree(0), 6)
	assert.strictEqual(fsMinorKey.midiForDegree(4), 13)
	assert.strictEqual(fsMinorKey.midiForDegree(6), 16)


	/*console.log(cMajorKey.namedPitches.map(p => p.str))
	console.log(fsMinorKey.namedPitches.map(p => p.str))
	console.log(Key.fromTonicAndScale(PitchName.parse("C##"), Scale.fromChroma([0, 1, 2, 3, 4, 5, 6])).namedPitches.map(p => p.str))

	console.log(cMajorKey.scale.alterationsFromMajor)
	console.log(fsMinorKey.scale.alterationsFromMajor)*/
	
	console.log("Theory tests passed")
}