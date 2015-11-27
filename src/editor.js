function SongEditor(canvas, songData)
{
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.canvasWidth = parseFloat(canvas.width);
	this.canvasHeight = parseFloat(canvas.height);
	
	var that = this;
	this.canvas.onmousemove = function(ev) { that.handleMouseMove(ev); };
	this.canvas.onmousedown = function(ev) { that.handleMouseDown(ev); };
	this.canvas.onmouseup = function(ev) { that.handleMouseUp(ev); };
	
	this.songData = songData;
	
	this.noteSelections = [];
	this.chordSelections = [];
	this.keyChangeSelections = [];
	this.meterChangeSelections = [];
	
	this.tickZoom = 1;
	this.tickSnap = 5;
	this.viewBlocks = [];
	this.viewNotes = [];
	this.viewChords = [];
	this.viewKeyChanges = [];
	this.viewMeterChanges = [];
	this.mouseDown = false;
	this.mouseDragAction = null;
	this.mouseDragCurrent = { x: 0, y: 0 };
	this.mouseDragOrigin = { x: 0, y: 0 };
	this.mouseStretchPivotTick = 0;
	this.mouseStretchOriginTick = 0;
	this.hoverNote = -1;
	this.hoverKeyChange = -1;
	this.hoverMeterChange = -1;
	this.hoverStretchR = false;
	this.hoverStretchL = false;
	
	this.WHOLE_NOTE_DURATION = 100;
	this.MARGIN_LEFT = 4;
	this.MARGIN_RIGHT = 4;
	this.MARGIN_TOP = 4;
	this.MARGIN_BOTTOM = 4;
	this.HEADER_MARGIN = 40;
	this.NOTE_HEIGHT = 14;
	this.NOTE_MARGIN_HOR = 0.5;
	this.NOTE_MARGIN_VER = 0.5;
	this.CHORD_HEIGHT = 60;
	this.CHORDNOTE_MARGIN = 10;
	this.KEYCHANGE_BAR_WIDTH = 20;
	this.METERCHANGE_BAR_WIDTH = 4;
	
	this.refreshRepresentation();
}


SongEditor.prototype.setData = function(songData)
{
	this.songData = songData;
}