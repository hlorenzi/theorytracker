function testOnLoad()
{
	var song = new SongData();
	song.addKeyChange(new SongDataKeyChange(0, scaleMajor, 0));
	song.addKeyChange(new SongDataKeyChange(100, scaleDorian, 0));
	song.addKeyChange(new SongDataKeyChange(220, scaleMajor, 0));
	
	song.addNote(new SongDataNote(0, 25, 0));
	song.addNote(new SongDataNote(25, 25, 1));
	song.addNote(new SongDataNote(50, 25, 2));
	song.addNote(new SongDataNote(75, 25, 3));
	song.addNote(new SongDataNote(0, 300, 8));
	
	var canvas = document.getElementById("editorCanvas");
	var editor = new SongEditor(canvas, song);
	editor.refreshCanvas();
}