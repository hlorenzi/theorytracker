function SongEditor(canvas, songData)
{
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.canvasWidth = parseFloat(canvas.width);
	this.canvasHeight = parseFloat(canvas.height);
	
	var that = this;
	this.canvas.onmousemove = function(ev) { that.handleMouseMove(ev); };
	
	this.songData = songData;
	
	this.noteSelections = [];
	this.chordSelections = [];
	this.keyChangeSelections = [];
	this.meterChangeSelections = [];
	
	this.tickZoom = 1;
	this.viewBlocks = [];
	this.viewNotes = [];
	this.viewChords = [];
	this.viewKeyChanges = [];
	this.viewMeterChanges = [];
	this.hoverNote = -1;
	
	this.MARGIN_LEFT = 4;
	this.MARGIN_RIGHT = 4;
	this.MARGIN_TOP = 4;
	this.MARGIN_BOTTOM = 4;
	this.HEADER_MARGIN = 40;
	this.NOTE_HEIGHT = 14;
	this.CHORD_HEIGHT = 60;
	this.CHORDNOTE_MARGIN = 10;
	this.KEYCHANGE_BAR_WIDTH = 10;
	this.METERCHANGE_BAR_WIDTH = 10;
	
	this.refreshVisualization();
}


SongEditor.prototype.setData = function(songData)
{
	this.songData = songData;
}


function isPointInside(p, rect)
{
	return (
		p.x >= rect.x1 && p.x <= rect.x2 &&
		p.y >= rect.y1 && p.y <= rect.y2);
}


function transformMousePosition(elem, ev)
{
	var rect = elem.getBoundingClientRect();
	return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
}


SongEditor.prototype.handleMouseMove = function(ev)
{
	ev.preventDefault();
	var mousePos = transformMousePosition(this.canvas, ev);
	
	this.canvas.style.cursor = "default";
			
	this.hoverNote = -1;
	for (var b = 0; b < this.viewBlocks.length; b++)
	{
		if (isPointInside(mousePos, this.viewBlocks[b]))
		{	
			for (var n = 0; n < this.viewBlocks[b].notes.length; n++)
			{
				var note = this.viewBlocks[b].notes[n];
				if (isPointInside(mousePos, note))
				{
					this.hoverNote = note.noteIndex;
					
					if (mousePos.x <= note.trueX1 + 2 || mousePos.x >= note.trueX2 - 2)
						this.canvas.style.cursor = "ew-resize";
					else
						this.canvas.style.cursor = "pointer";

					break;
				}
			}
			break;
		}
	}
	
	this.refreshCanvas();
}


SongEditor.prototype.refreshVisualization = function()
{
	this.viewBlocks = [];
	this.viewNotes = [];
	this.viewChords = [];
	this.viewKeyChanges = [];
	this.viewMeterChanges = [];
	
	this.noteSelections = [];
	for (var i = 0; i < this.songData.notes.length; i++)
		this.noteSelections.push(false);
	
	var blockY1 = this.MARGIN_TOP + this.HEADER_MARGIN;
	var blockY2 = this.canvasHeight - this.MARGIN_BOTTOM - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN;
	var changeY1 = this.MARGIN_TOP;
	var chordY2 = this.canvasHeight - this.MARGIN_BOTTOM;
	
	var x = this.MARGIN_LEFT;
	var tick = 0;
	var curNote = 0;
	var curChord = 0;
	var curKeyChange = 0;
	var curMeterChange = 0;
	
	var curBlock = 0;
	this.viewBlocks.push(
	{
		tick: 0,
		duration: 0,
		key: null,
		meter: null,
		notes: [],
		x1: x,
		y1: blockY1,
		x2: x,
		y2: blockY2
	});
	
	var NEXT_IS_NONE = 0;
	var NEXT_IS_KEYCHANGE = 1;
	var NEXT_IS_METERCHANGE = 2;
	
	while (true)
	{
		// Find the tick where the current block ends.
		var nextChangeTick = this.songData.lastTick;
		var nextIsWhat = NEXT_IS_NONE;
		
		if (curKeyChange < this.songData.keyChanges.length)
		{
			var nextKeyChange = this.songData.keyChanges[curKeyChange]
			if (nextKeyChange.tick < nextChangeTick)
			{
				nextChangeTick = nextKeyChange.tick;
				nextIsWhat = NEXT_IS_KEYCHANGE;
			}
		}
		
		if (curMeterChange < this.songData.meterChanges.length)
		{
			var nextMeterChange = this.songData.meterChanges[curMeterChange]
			if (nextMeterChange.tick < nextChangeTick)
			{
				nextChangeTick = nextMeterChange.tick;
				nextIsWhat = NEXT_IS_METERCHANGE;
			}
		}
		
		// Advance draw position until the next tick.
		x += (nextChangeTick - tick) * this.tickZoom;
		tick = nextChangeTick;
		
		// If there is a key change, add its visualization and advance its iterator.
		var blockX2 = x;
		
		if (nextIsWhat == NEXT_IS_KEYCHANGE)
		{
			x += this.KEYCHANGE_BAR_WIDTH;
			
			this.viewKeyChanges.push(
			{
				keyChange: this.songData.keyChanges[curKeyChange],
				tick: nextChangeTick,
				x1: blockX2,
				y1: changeY1,
				x2: x,
				y2: chordY2
			});
			
			curKeyChange++;
		}
		// Or if there is a meter change, add its visualization and advance its iterator.
		else if (nextIsWhat == NEXT_IS_METERCHANGE)
		{
			x += this.METERCHANGE_BAR_WIDTH;
			
			this.viewMeterChanges.push(
			{
				meterChange: this.songData.meterChanges[curMeterChange],
				tick: nextChangeTick,
				x1: blockX2,
				y1: changeY1,
				x2: x,
				y2: chordY2
			});
			
			curMeterChange++;
		}
		
		// Then finish off the current block of notes.
		// If its duration would be zero, ignore it for now but prepare it for the next iteration.  
		var block = this.viewBlocks[curBlock];
		
		if (nextChangeTick == block.tick)
		{
			block.x1 = x;
			block.x2 = x;
		}
		else
		{
			block.duration = nextChangeTick - block.tick;
			block.x2 = blockX2;
			
			for (var n = 0; n < this.songData.notes.length; n++)
			{
				var note = this.songData.notes[n];
				var noteRow = this.getNoteRow(note.pitch, block.key.scale);
				var notePos = this.getNotePosition(block, noteRow, note.tick, note.duration);
				block.notes.push(
				{
					noteIndex: n,
					tick: note.tick,
					duration: note.duration,
					trueX1: notePos.trueX1,
					trueX2: notePos.trueX2,
					x1: notePos.x1,
					y1: notePos.y1,
					x2: notePos.x2,
					y2: notePos.y2
				});
			}
			
			// If this is the final block, we can stop now.
			if (nextIsWhat == NEXT_IS_NONE)
				break;
			
			// Or else, add a new block for the next iteration.
			this.viewBlocks.push(
			{
				tick: tick,
				duration: 0,
				key: block.key,
				meter: block.meter,
				notes: [],
				x1: x,
				y1: blockY1,
				x2: x,
				y2: blockY2
			});
			
			curBlock++;
		}
		
		// Apply key/meter changes to the following block.
		if (nextIsWhat == NEXT_IS_KEYCHANGE)
			this.viewBlocks[curBlock].key = this.songData.keyChanges[curKeyChange - 1];
		else if (nextIsWhat == NEXT_IS_METERCHANGE)
			this.viewBlocks[curBlock].meter = this.songData.meterChanges[curMeterChange - 1];
	}
}


// Returns the row number where a note of the given pitch would be placed,
// according to the given scale.
SongEditor.prototype.getNoteRow = function(pitch, scale)
{
	var pitchInOctave = (pitch % 12);
	var pitchDegree = 0;
	
	for (var i = 0; i < scale.degrees.length; i++)
	{
		if (scale.degrees[i] == pitchInOctave)
		{
			pitchDegree = i;
			break;
		}
		else if (scale.degrees[i] > pitchInOctave)
		{
			pitchDegree = i - 0.5;
			break;
		}
	}
	
	return pitchDegree;
}


// Returns a color string matching the given row.
SongEditor.prototype.getColorForRow = function(row)
{
	var colors =
	[
		"#ff0000",
		"#ff8800",
		"#eeee00",
		"#44dd33",
		"#0000ff",
		"#8800ff",
		"#ff00ff"
	];
	return colors[row - (row % 1)];
}


SongEditor.prototype.getNotePosition = function(block, row, tick, duration)
{
	var blockTick = tick - block.tick;
	return {
		trueX1: block.x1 + blockTick * this.tickZoom,
		trueX2: block.x1 + (blockTick + duration) * this.tickZoom,
		x1: block.x1 + Math.max(0, blockTick * this.tickZoom),
		x2: block.x1 + Math.min(block.x2 - block.x1, (blockTick + duration) * this.tickZoom),
		y1: block.y2 - (row + 1) * this.NOTE_HEIGHT,
		y2: block.y2 - (row) * this.NOTE_HEIGHT,
	};
}


SongEditor.prototype.drawNote = function(blockIndex, pitch, tick, duration, hovering, selected)
{
	var block = this.viewBlocks[blockIndex];
	
	if (tick + duration <= block.tick ||
		tick >= block.tick + block.duration)
		return;
	
	var row = this.getNoteRow(pitch, block.key.scale);
	var pos = this.getNotePosition(block, row, tick, duration);
	var col = this.getColorForRow(row);
	
	this.ctx.save();
	this.ctx.fillStyle = col;
	if (hovering)
	{
		this.ctx.globalAlpha = 0.5;
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, 3);
		this.ctx.fillRect(pos.x1, pos.y2 - 3, pos.x2 - pos.x1, 3);
	}
	else
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
	
	this.ctx.globalAlpha = 0.5;
	
	if (tick + duration > block.tick + block.duration && blockIndex < this.viewBlocks.length - 1)
	{
		var nextBlock = this.viewBlocks[blockIndex + 1];
		var nextRow = this.getNoteRow(pitch, nextBlock.key.scale);
		
		var nextY1 = nextBlock.y2 - (nextRow + 1) * this.NOTE_HEIGHT;
		var nextY2 = nextY1 + this.NOTE_HEIGHT;
		
		this.ctx.beginPath();
		this.ctx.moveTo(block.x2, pos.y1);
		this.ctx.lineTo(nextBlock.x1, nextY1);
		this.ctx.lineTo(nextBlock.x1, nextY2);
		this.ctx.lineTo(block.x2, pos.y2);
		this.ctx.fill();
	}
	
	this.ctx.restore();
}


SongEditor.prototype.refreshCanvas = function()
{
	this.ctx.fillStyle = "white";
	this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
	
	for (var i = 0; i < this.viewBlocks.length; i++)
	{
		var block = this.viewBlocks[i];
		
		for (var n = 0; n < block.notes.length; n++)
		{
			var note = this.songData.notes[block.notes[n].noteIndex];
			this.drawNote(i, note.pitch, note.tick, note.duration, block.notes[n].noteIndex == this.hoverNote, false);
		}
		
		this.ctx.strokeStyle = "black";
		this.ctx.lineWidth = 2;
		
		var x2 = Math.min(block.x2, this.canvasWidth - this.MARGIN_LEFT);
		this.ctx.strokeRect(block.x1, block.y1, x2 - block.x1, block.y2 - block.y1);
		this.ctx.strokeRect(block.x1, block.y2 + this.CHORDNOTE_MARGIN, x2 - block.x1, this.CHORD_HEIGHT);
	}
	
	for (var i = 0; i < this.viewKeyChanges.length; i++)
	{
		var keyChange = this.viewKeyChanges[i];
		
		this.ctx.fillStyle = "red";
		this.ctx.fillRect((keyChange.x1 + keyChange.x2) / 2 - 1, keyChange.y1, 2, keyChange.y2 - keyChange.y1);
	}
	
	for (var i = 0; i < this.viewMeterChanges.length; i++)
	{
		var meterChange = this.viewMeterChanges[i];
		
		this.ctx.fillStyle = "blue";
		this.ctx.fillRect((meterChange.x1 + meterChange.x2) / 2 - 1, meterChange.y1, 2, meterChange.y2 - meterChange.y1);
	}
}