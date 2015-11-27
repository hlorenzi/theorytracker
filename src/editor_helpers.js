// Returns the scale degree of the given pitch, according to the given key.
SongEditor.prototype.getDegreeForPitch = function(pitch, key)
{
	var pitchInOctave = ((pitch + 12 - key.tonicPitch) % 12);
	var pitchDegree = key.scale.degrees.length - 0.5;
	
	for (var i = 0; i < key.scale.degrees.length; i++)
	{
		if (key.scale.degrees[i] == pitchInOctave)
		{
			pitchDegree = i;
			break;
		}
		else if (key.scale.degrees[i] > pitchInOctave)
		{
			pitchDegree = i - 0.5;
			break;
		}
	}
	
	return pitchDegree;
}


// Returns the row index where a note of the given pitch would be placed,
// according to the given key.
SongEditor.prototype.getRowForPitch = function(pitch, key)
{
	var pitchInOctave = ((pitch + 12 - key.tonicPitch) % 12);
	var pitchDegree = key.scale.degrees.length - 0.5;
	
	var degreeOffsetFromC = 0;
	if (key.tonicPitch != 0)
	{
		var originalTonicPitch = key.tonicPitch;
		key.tonicPitch = 0;
		degreeOffsetFromC = Math.ceil(this.getRowForPitch(originalTonicPitch, key));
		key.tonicPitch = originalTonicPitch;
	}
	
	for (var i = 0; i < key.scale.degrees.length; i++)
	{
		if (key.scale.degrees[i] == pitchInOctave)
		{
			pitchDegree = i;
			break;
		}
		else if (key.scale.degrees[i] > pitchInOctave)
		{
			pitchDegree = i - 0.5;
			break;
		}
	}
	
	return pitchDegree + degreeOffsetFromC + (Math.floor((pitch - key.tonicPitch) / 12) * key.scale.degrees.length);
}


// Returns the pitch of the given row index, according to the given key.
SongEditor.prototype.getPitchForRow = function(row, key)
{
	var degreeOffsetFromC = 0;
	if (key.tonicPitch != 0)
	{
		var originalTonicPitch = key.tonicPitch;
		key.tonicPitch = 0;
		degreeOffsetFromC = Math.ceil(this.getRowForPitch(originalTonicPitch, key));
		key.tonicPitch = originalTonicPitch;
	}
	
	return key.scale.degrees[(row + key.scale.degrees.length - degreeOffsetFromC) % key.scale.degrees.length] + key.tonicPitch;
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


// Returns a color string matching the given scale degree.
SongEditor.prototype.getColorForDegree = function(degree)
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
	return colors[(degree - (degree % 1)) % 7];
}
