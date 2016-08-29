var mainTimeline;


function main()
{
	var div = document.getElementById("divTimeline");
	var canvas = document.getElementById("canvasTimeline");
	canvas.width = div.clientWidth;
	
	var song = new Song();
	song.keyAdd(new Key(0, 0, theory.C));
	song.keyAdd(new Key(960, 0, theory.D));
	song.keyAdd(new Key(1920, 0, theory.Fs));
	song.meterAdd(new Meter(0, 4, 4));
	song.meterAdd(new Meter(720, 3, 4));
	song.noteAdd(new Note(new TimeRange(  0, 960), new Pitch(5 * 12 + 0)));
	song.noteAdd(new Note(new TimeRange(  0, 240), new Pitch(5 * 12 + 1)));
	song.noteAdd(new Note(new TimeRange(240, 480), new Pitch(5 * 12 + 2)));
	song.noteAdd(new Note(new TimeRange(480, 720), new Pitch(5 * 12 + 3)));
	song.noteAdd(new Note(new TimeRange(720, 960), new Pitch(5 * 12 + 4)));
	song.chordAdd(new Chord(new TimeRange(  0, 240), 0, theory.C));
	song.chordAdd(new Chord(new TimeRange(240, 480), 5, theory.D));
	song.chordAdd(new Chord(new TimeRange(480, 720), 10, theory.Fs));
	song.chordAdd(new Chord(new TimeRange(720, 960), 15, theory.As));
	
	var timeline = new Timeline(canvas);
	timeline.setSong(song);
	timeline.relayout();
	timeline.redraw();
	
	mainTimeline = timeline;
}