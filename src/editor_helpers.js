// Returns the row number where a note of the given pitch would be placed,
// according to the given scale.
SongEditor.prototype.getNoteRow = function(pitch, scale)
{
	var pitchInOctave = (pitch % 12);
	var pitchDegree = scale.degrees.length - 0.5;
	
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
	
	return pitchDegree + (Math.floor(pitch / 12) * scale.degrees.length);
}


// Returns the bounds of the given row's note's representation rectangle.
SongEditor.prototype.getNotePosition = function(block, row, tick, duration)
{
	var blockTick = tick - block.tick;
	return {
		resizeHandleL: block.x1 + blockTick * this.tickZoom,
		resizeHandleR: block.x1 + (blockTick + duration) * this.tickZoom,
		x1: block.x1 + Math.max(0, (blockTick * this.tickZoom) + this.NOTE_MARGIN_HOR),
		x2: block.x1 + Math.min(block.x2 - block.x1, (blockTick + duration) * this.tickZoom - this.NOTE_MARGIN_HOR),
		y1: block.y2 - (row + 1) * this.NOTE_HEIGHT + this.NOTE_MARGIN_VER,
		y2: block.y2 - (row) * this.NOTE_HEIGHT - this.NOTE_MARGIN_VER,
	};
}


// Returns a color string matching the given row.
SongEditor.prototype.getColorForRow = function(row)
{
	var colors =
	[
		"#fb3214",
		"#f7a610",
		"#f2f201",
		"#82f21e",
		"#01beca",
		"#6b16fc",
		"#ed18a8"
	];
	return colors[(row - (row % 1)) % 7];
}
