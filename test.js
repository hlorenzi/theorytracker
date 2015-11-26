function testOnLoad()
{
	var song = new SongData();
	song.addKeyChange(new SongDataKeyChange(0, scaleMajor, 0));
	song.addKeyChange(new SongDataKeyChange(100, scaleDorian, 0));
	song.addKeyChange(new SongDataKeyChange(200, scaleMajor, 0));
	song.addKeyChange(new SongDataKeyChange(300, scaleMajor, 0));
	
	song.addNote(new SongDataNote(0, 300, 0));
	song.addNote(new SongDataNote(0, 300, 3));
	song.addNote(new SongDataNote(0, 300, 8));
	
	var canvas = document.getElementById("editorCanvas");
	var editor = new SongEditor(canvas, song);
	editor.refreshCanvas();
}