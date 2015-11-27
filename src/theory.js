function theoryNoteName(pitch, scale)
{
	var notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
	return notes[pitch % 12];
}