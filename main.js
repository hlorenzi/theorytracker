var mainEditor;

function testOnLoad()
{
	var theory = new Theory();
	
	var song = new SongData(theory);
	
	song.addKeyChange(new SongDataKeyChange(960 * 2, theory.scales[0], theory.D));
	song.addMeterChange(new SongDataMeterChange(960 * 2, 3, 4));
	song.addSectionBreak(new SongSectionBreak(960 * 1.5));
	
	song.addChord(new SongDataChord(960 * 0.0, 960 / 2, theory.chords[0], theory.C));
	song.addChord(new SongDataChord(960 * 0.5, 960 / 2, theory.chords[0], theory.F));
	song.addChord(new SongDataChord(960 * 1.0, 960 / 1, theory.chords[0], theory.G));
	
	song.addNote(new SongDataNote(0, 960 / 4, theory.C + 60));
	song.addNote(new SongDataNote(960 / 4, 960 / 16, theory.D + 60));
	song.addNote(new SongDataNote(960 / 4 + 960 / 16, 960 / 16, theory.E + 60));
	song.addNote(new SongDataNote(960 / 4 + 960 / 16 * 2, 960 / 4, theory.F + 60));
	song.addNote(new SongDataNote(960 / 4 * 2 + 960 / 16 * 2, 960 / 4, theory.G + 60));
	song.addNote(new SongDataNote(960 / 4 * 3 + 960 / 16 * 2, 960 / 8, theory.A + 60));
	song.addNote(new SongDataNote(960, 960, theory.B + 60));
	
	song.addNote(new SongDataNote(960 * 2, 960 / 4, theory.C + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4, 960 / 16, theory.D + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4 + 960 / 16, 960 / 16, theory.E + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4 + 960 / 16 * 2, 960 / 4, theory.F + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4 * 2 + 960 / 16 * 2, 960 / 4, theory.G + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4 * 3 + 960 / 16 * 2, 960 / 8, theory.A + 60));
	song.addNote(new SongDataNote(960 * 2 + 960, 960 / 2, theory.B + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 + 960 / 2, 960 / 2, theory.C + 72));
	
	/*song.addKeyChange(new SongDataKeyChange(0, theory.scales[0], theory.C));
	song.addMeterChange(new SongDataMeterChange(0, 4, 4));
	song.addKeyChange(new SongDataKeyChange(960 * 2, theory.scales[8], theory.C));
	song.addKeyChange(new SongDataKeyChange(960 * 4, theory.scales[0], theory.C));
	
	song.addChord(new SongDataChord(960 * 0.0, 960 / 2, theory.chords[0], theory.C));
	song.addChord(new SongDataChord(960 * 0.5, 960 / 2, theory.chords[0], theory.F));
	song.addChord(new SongDataChord(960 * 1.0, 960 / 1, theory.chords[0], theory.G));
	song.addChord(new SongDataChord(960 * 2.0, 960 / 2, theory.chords[0], theory.C));
	song.addChord(new SongDataChord(960 * 2.5, 960 / 2, theory.chords[1], theory.F));
	song.addChord(new SongDataChord(960 * 3.0, 960 / 2, theory.chords[6], theory.C));
	song.addChord(new SongDataChord(960 * 3.5, 960 / 2, theory.chords[4], theory.G));
	song.addChord(new SongDataChord(960 * 4.0, 960 * 2, theory.chords[0], theory.C));
	
	song.addNote(new SongDataNote(0, 960 / 4, theory.C + 60));
	song.addNote(new SongDataNote(960 / 4, 960 / 16, theory.F + 60));
	song.addNote(new SongDataNote(960 / 4 + 960 / 16, 960 / 16, theory.E + 60));
	song.addNote(new SongDataNote(960 / 4 + 960 / 16 * 2, 960 / 4, theory.F + 60));
	song.addNote(new SongDataNote(960 / 4 * 2 + 960 / 16 * 2, 960 / 4, theory.E + 60));
	song.addNote(new SongDataNote(960 / 4 * 3 + 960 / 16 * 2, 960 / 8, theory.D + 60));
	song.addNote(new SongDataNote(960, 960, theory.G + 60));
	
	song.addNote(new SongDataNote(960 * 2, 960 / 4, theory.C + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4, 960 / 16, theory.F + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4 + 960 / 16, 960 / 16, theory.E + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4 + 960 / 16 * 2, 960 / 4, theory.F + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4 * 2 + 960 / 16 * 2, 960 / 4, theory.E + 60));
	song.addNote(new SongDataNote(960 * 2 + 960 / 4 * 3 + 960 / 16 * 2, 960 / 8, theory.Cs + 60));
	song.addNote(new SongDataNote(960 * 2 + 960, 960, theory.C + 60));
	
	song.addNote(new SongDataNote(960 * 2.5, 960 / 16, theory.Gs + 60));
	song.addNote(new SongDataNote(960 * 2.5 + 960 / 16, 960 / 16, theory.C + 60 + 12));
	song.addNote(new SongDataNote(960 * 2.5 + 960 / 16 * 2, 960 / 16, theory.Cs + 60 + 12));
	song.addNote(new SongDataNote(960 * 2.5 + 960 / 16 * 3, 960 / 16, theory.E + 60 + 12));*/
	
	var synth = new Synth();
	setInterval(function() { synth.process(6); }, 1000 / 60);
	
	var canvas = document.getElementById("editorCanvas");
	var editor = new SongEditor(canvas, theory, synth, song);
	editor.refreshCanvas();
	mainEditor = editor;
	var toolbox = new Toolbox(document.getElementById("toolboxDiv"), editor, theory, synth);
}