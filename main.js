var mainTimeline;


function main()
{
	var div = document.getElementById("divTimeline");
	var canvas = document.getElementById("canvasTimeline");
	canvas.width = div.clientWidth;
	
	var song = new Song();
	song.meterAdd(new Meter(0, 4, 4));
	song.meterAdd(new Meter(720, 3, 4));
	song.noteAdd(new Note(new TimeRange(  0, 960), new Pitch(3 * 12 + 0)));
	song.noteAdd(new Note(new TimeRange(  0, 240), new Pitch(3 * 12 + 1)));
	song.noteAdd(new Note(new TimeRange(240, 480), new Pitch(3 * 12 + 2)));
	song.noteAdd(new Note(new TimeRange(480, 720), new Pitch(3 * 12 + 3)));
	song.noteAdd(new Note(new TimeRange(720, 960), new Pitch(3 * 12 + 4)));
	
	var timeline = new Timeline(canvas);
	timeline.setSong(song);
	timeline.relayout();
	timeline.redraw();
	
	mainTimeline = timeline;
}