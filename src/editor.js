function SongEditor(canvas, theory, synth, songData)
{
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.canvasWidth = parseFloat(canvas.width);
	this.canvasHeight = parseFloat(canvas.height);
	
	// Set up mouse/keyboard interaction.
	var that = this;
	this.canvas.onmousemove = function(ev) { that.handleMouseMove(ev); };
	this.canvas.onmousedown = function(ev) { that.handleMouseDown(ev); };
	this.canvas.onmouseup = function(ev) { that.handleMouseUp(ev); };
	window.onkeydown = function(ev) { that.handleKeyDown(ev); };
	
	// Set up callback arrays.
	this.cursorChangedCallbacks = [];
	this.selectionChangedCallbacks = [];
	
	// For each object in the song data, these arrays store a boolean
	// indicating whether the respective object is currently selected in the editor.
	this.noteSelections = [];
	this.chordSelections = [];
	this.keyChangeSelections = [];
	this.meterChangeSelections = [];
	this.selectedObjects = 0;
	
	// The scaling from ticks to pixels.
	this.tickZoom = 0.15;
	
	// The tick grid which the cursor is snapped to. 
	this.tickSnap = 960 / 16;
	
	// This stores sections' representation objects, which tell things like
	// the object positioning/layout, and where they can be interacted with the mouse.
	this.viewRegions = [];
	
	// These control scrolling.
	this.rowAtCenter = 8 * 5;
	this.xAtLeft = 0;
	
	// These control cursor (the vertical blue bar) interaction.
	this.CURSOR_ZONE_ALL = 0;
	this.CURSOR_ZONE_NOTES = 1;
	this.CURSOR_ZONE_CHORDS = 2;
	
	this.cursorTick = 0;
	this.showCursor = true;
	this.cursorZone = this.CURSOR_ZONE_ALL;
	
	// These control mouse interaction.
	this.interactionEnabled = true;
	this.mouseDown = false;
	this.mouseDragAction = null;
	this.mouseDragCurrent = { x: 0, y: 0 };
	this.mouseDragOrigin = { x: 0, y: 0 };
	this.mouseStretchPivotTick = 0;
	this.mouseStretchOriginTick = 0;
	
	// These indicate which object the mouse is currently hovering over.
	this.hoverNote = -1;
	this.hoverChord = -1;
	this.hoverKeyChange = -1;
	this.hoverMeterChange = -1;
	this.hoverStretchR = false;
	this.hoverStretchL = false;
	
	// Layout constants.
	this.MARGIN_LEFT = 16;
	this.MARGIN_RIGHT = 16;
	this.MARGIN_TOP = 4;
	this.MARGIN_BOTTOM = 8;
	this.SECTION_SEPARATION = 10;
	this.HEADER_HEIGHT = 40;
	this.NOTE_HEIGHT = 14;
	this.NOTE_MARGIN_HOR = 0.5;
	this.NOTE_MARGIN_VER = 0.5;
	this.NOTE_STRETCH_MARGIN = 2;
	this.CHORD_HEIGHT = 60;
	this.CHORD_NOTE_SEPARATION = 10;
	this.CHORD_ORNAMENT_HEIGHT = 5;
	
	// Finally, set the song data, and external dependencies.
	this.theory = theory;
	this.synth = synth;
	this.setData(songData);
}


SongEditor.prototype.setData = function(songData)
{
	this.songData = songData;
	this.refreshRepresentation();
}


SongEditor.prototype.setInteractionEnabled = function(enable)
{
	this.interactionEnabled = enable;
}


SongEditor.prototype.addOnCursorChanged = function(func)
{
	this.cursorChangedCallbacks.push(func);
}


SongEditor.prototype.addOnSelectionChanged = function(func)
{
	this.selectionChangedCallbacks.push(func);
}


SongEditor.prototype.callOnCursorChanged = function()
{
	for (var i = 0; i < this.cursorChangedCallbacks.length; i++)
		this.cursorChangedCallbacks[i]();
}


SongEditor.prototype.callOnSelectionChanged = function()
{
	for (var i = 0; i < this.selectionChangedCallbacks.length; i++)
		this.selectionChangedCallbacks[i]();
}