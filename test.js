function testOnLoad()
{
	var song = new SongData();
	song.addKeyChange(new SongDataKeyChange(0, scaleMajor, 0));
	song.addMeterChange(new SongDataMeterChange(0, 4, 4));
	song.addKeyChange(new SongDataKeyChange(100, scaleMajor, 2));
	song.addMeterChange(new SongDataMeterChange(150, 3, 4));
	song.addKeyChange(new SongDataKeyChange(200, scaleMixolydian, 0));
	song.addKeyChange(new SongDataKeyChange(300, scalePhrygianDominant, 0));
	
	song.addNote(new SongDataNote(0, 300, 12));
	song.addNote(new SongDataNote(0, 300, 5));
	song.addNote(new SongDataNote(0, 300, 7));
	song.addNote(new SongDataNote(325, 25, 0));
	song.addNote(new SongDataNote(350, 25, 1));
	song.addNote(new SongDataNote(375, 25, 2));
	song.addNote(new SongDataNote(400, 25, 3));
	song.addNote(new SongDataNote(425, 25, 4));
	song.addNote(new SongDataNote(450, 25, 5));
	song.addNote(new SongDataNote(475, 25, 6));
	song.addNote(new SongDataNote(500, 25, 7));
	song.addNote(new SongDataNote(525, 25, 8));
	song.addNote(new SongDataNote(550, 25, 9));
	song.addNote(new SongDataNote(575, 25, 10));
	song.addNote(new SongDataNote(600, 25, 11));
	
	var canvas = document.getElementById("editorCanvas");
	var editor = new SongEditor(canvas, song);
	editor.refreshCanvas();
}