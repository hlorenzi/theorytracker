var mainTimeline;


function main()
{
	var div = document.getElementById("divTimeline");
	var canvas = document.getElementById("canvasTimeline");
	canvas.width = div.clientWidth;
	
	var song = new Song();
	song.keyAdd(new Key(0, 0, theory.C));
	//song.keyAdd(new Key(960, 0, theory.D));
	//song.keyAdd(new Key(1920, 0, theory.Fs));
	song.meterAdd(new Meter(0, 4, 4));
	//song.meterAdd(new Meter(720, 3, 4));
	//song.noteAdd(new Note(new TimeRange(  0, 960), new Pitch(5 * 12 + 0)));
	//song.noteAdd(new Note(new TimeRange(  0, 240), new Pitch(5 * 12 + 1)));
	//song.noteAdd(new Note(new TimeRange(240, 480), new Pitch(5 * 12 + 2)));
	//song.noteAdd(new Note(new TimeRange(480, 720), new Pitch(5 * 12 + 3)));
	//song.noteAdd(new Note(new TimeRange(720, 960), new Pitch(5 * 12 + 4)));
	song.chordAdd(new Chord(new TimeRange(960 * 0, 960 * 1), 0, theory.C));
	song.chordAdd(new Chord(new TimeRange(960 * 1, 960 * 2), 0, theory.F));
	song.chordAdd(new Chord(new TimeRange(960 * 2, 960 * 3), 0, theory.G));
	song.chordAdd(new Chord(new TimeRange(960 * 3, 960 * 4), 0, theory.C));
	
	var synth = new Synth();
	setInterval(function() { synth.process(1 / 60); }, 1000 / 60);
	
	var timeline = new Timeline(canvas, synth);
	timeline.relayout();
	timeline.setSong(song);
	timeline.redraw();
	
	mainTimeline = timeline;
}