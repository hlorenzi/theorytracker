function testOnLoad()
{
	var song = new SongData();
	song.addKeyChange(new SongDataKeyChange(0, 0, 0));
	song.addKeyChange(new SongDataKeyChange(100, 0, 0));
	song.addMeterChange(new SongDataMeterChange(150, 0, 0));
	song.addKeyChange(new SongDataKeyChange(220, 0, 0));
	song.addKeyChange(new SongDataKeyChange(250, 0, 0));
	song.addMeterChange(new SongDataMeterChange(250, 0, 0));
	song.addKeyChange(new SongDataKeyChange(251, 0, 0));
	song.addMeterChange(new SongDataMeterChange(251, 0, 0));
	song.addKeyChange(new SongDataKeyChange(350, 0, 0));
	
	var canvas = document.getElementById("editorCanvas");
	var editor = new SongEditor(canvas, song);
	editor.refreshCanvas();
}