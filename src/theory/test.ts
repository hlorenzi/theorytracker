import Theory from "../theory"
import assert from "assert"


export function test()
{
	const c = Theory.PitchName.parse("C")
	assert.equal(c.letter, 0)
	assert.equal(c.accidental, 0)
	assert.equal(c.str, "C")
	assert.equal(c.midi, 0)
	assert.equal(c.chroma, 0)

	const fb = Theory.PitchName.parse("Fb")
	assert.equal(fb.letter, 3)
	assert.equal(fb.accidental, -1)
	assert.equal(fb.str, "Fb")
	assert.equal(fb.midi, 4)
	assert.equal(fb.chroma, 4)

	const bsss = Theory.PitchName.parse("B###")
	assert.equal(bsss.letter, 6)
	assert.equal(bsss.accidental, 3)
	assert.equal(bsss.str, "B###")
	assert.equal(bsss.midi, 14)
	assert.equal(bsss.chroma, 2)

	const d5 = Theory.Pitch.parse("D5")
	assert.equal(d5.str, "D5")
	assert.equal(d5.name.str, "D")
	assert.equal(d5.midi, 62)
	assert.equal(d5.chroma, 2)

	const cMajorKey = Theory.Key.parse("C Major")
	assert.equal(cMajorKey.str, "C Major")
	assert.equal(cMajorKey.tonic.str, "C")
	assert.equal(cMajorKey.scale.name, "Major")
	assert.equal(cMajorKey.degreeForPitch(c), 0)
	assert.equal(cMajorKey.degreeForPitch(fb), 2)
	assert.equal(cMajorKey.degreeForPitch(bsss), 1)
	assert.equal(cMajorKey.degreeForPitch(d5), 1)
	assert.equal(cMajorKey.octavedDegreeForPitch(c), 0)
	assert.equal(cMajorKey.octavedDegreeForPitch(fb), 2)
	assert.equal(cMajorKey.octavedDegreeForPitch(bsss), 8)
	assert.equal(cMajorKey.octavedDegreeForPitch(d5), 5 * 7 + 1)
	assert.equal(cMajorKey.nameForPitch(c).str, "C")
	assert.equal(cMajorKey.nameForPitch(fb).str, "E")
	assert.equal(cMajorKey.nameForPitch(bsss).str, "D")
	assert.equal(cMajorKey.nameForPitch(d5).str, "D")
	assert.equal(cMajorKey.midiForDegree(0), 0)
	assert.equal(cMajorKey.midiForDegree(4), 7)
	assert.equal(cMajorKey.midiForDegree(6), 11)

	const fsMinorKey = Theory.Key.parse("F# Minor")
	assert.equal(fsMinorKey.str, "F# Natural Minor")
	assert.equal(fsMinorKey.tonic.str, "F#")
	assert.equal(fsMinorKey.scale.name, "Natural Minor")
	assert.equal(fsMinorKey.degreeForPitch(c), 3.5)
	assert.equal(fsMinorKey.degreeForPitch(fb), 6)
	assert.equal(fsMinorKey.degreeForPitch(bsss), 5)
	assert.equal(fsMinorKey.degreeForPitch(d5), 5)
	assert.equal(fsMinorKey.octavedDegreeForPitch(c), -3.5)
	assert.equal(fsMinorKey.octavedDegreeForPitch(fb), -1)
	assert.equal(fsMinorKey.octavedDegreeForPitch(bsss), 5)
	assert.equal(fsMinorKey.octavedDegreeForPitch(d5), 4 * 7 + 5)
	assert.equal(fsMinorKey.nameForPitch(c).str, "C")
	assert.equal(fsMinorKey.nameForPitch(fb).str, "E")
	assert.equal(fsMinorKey.nameForPitch(bsss).str, "D")
	assert.equal(fsMinorKey.nameForPitch(d5).str, "D")
	assert.equal(fsMinorKey.midiForDegree(0), 6)
	assert.equal(fsMinorKey.midiForDegree(4), 13)
	assert.equal(fsMinorKey.midiForDegree(6), 16)


	/*console.log(cMajorKey.namedPitches.map(p => p.str))
	console.log(fsMinorKey.namedPitches.map(p => p.str))
	console.log(Key.fromTonicAndScale(PitchName.parse("C##"), Scale.fromChroma([0, 1, 2, 3, 4, 5, 6])).namedPitches.map(p => p.str))

	console.log(cMajorKey.scale.alterationsFromMajor)
	console.log(fsMinorKey.scale.alterationsFromMajor)*/
	
	console.log("Theory tests passed")
}