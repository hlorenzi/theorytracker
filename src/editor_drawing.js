SongEditor.prototype.drawNote = function(blockIndex, pitch, tick, duration, hovering, selected)
{
	var block = this.viewBlocks[blockIndex];
	
	if (tick + duration <= block.tick ||
		tick >= block.tick + block.duration)
		return;
	
	var row = this.getNoteRow(pitch, block.key);
	var pos = this.getNotePosition(block, row, tick, duration);
	var col = this.getColorForRow(row);
	
	this.ctx.save();
	this.ctx.fillStyle = col;
	if (selected)
	{
		this.ctx.globalAlpha = 0.5;
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, 3);
		this.ctx.fillRect(pos.x1, pos.y2 - 3, pos.x2 - pos.x1, 3);
	}
	else if (hovering)
	{
		this.ctx.globalAlpha = 0.5;
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
	}
	else
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
	
	this.ctx.globalAlpha = 0.5;
	
	if (tick + duration > block.tick + block.duration && blockIndex < this.viewBlocks.length - 1)
	{
		var nextBlock = this.viewBlocks[blockIndex + 1];
		var nextRow = this.getNoteRow(pitch, nextBlock.key);
		
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
	
	// Draw blocks.
	for (var i = 0; i < this.viewBlocks.length; i++)
	{
		var block = this.viewBlocks[i];
		
		// Draw rows.
		for (var row = 0; row < 14; row++)
		{
			this.ctx.strokeStyle = (this.getNoteForRow(row, block.key) == block.key.tonicPitch ? "#bbbbbb" : "#dddddd");
			this.ctx.lineWidth = 2;
			this.ctx.beginPath();
			this.ctx.moveTo(block.x1, block.y2 - row * this.NOTE_HEIGHT);
			this.ctx.lineTo(block.x2, block.y2 - row * this.NOTE_HEIGHT);
			this.ctx.stroke();
		}
		
		// Draw measures.
		var submeasureCount = 0;
		for (var n = block.meter.tick - block.tick; n < block.duration; n += this.WHOLE_NOTE_DURATION / block.meter.denominator)
		{
			if (n >= 0)
			{
				this.ctx.strokeStyle = (submeasureCount == 0 ? "#bbbbbb" : "#dddddd");
				this.ctx.lineWidth = 2;
				this.ctx.beginPath();
				this.ctx.moveTo(block.x1 + n * this.tickZoom, block.y1);
				this.ctx.lineTo(block.x1 + n * this.tickZoom, block.y2);
				this.ctx.stroke();
			}
			
			submeasureCount = (submeasureCount + 1) % block.meter.numerator;
		}
		
		// Draw notes.
		for (var n = 0; n < block.notes.length; n++)
		{
			var noteIndex = block.notes[n].noteIndex;
			var note = this.songData.notes[noteIndex];
			
			if (this.noteSelections[noteIndex] && this.mouseDragAction != null)
			{
				var draggedNote = this.getNoteDragged(note, this.mouseDragCurrent);
				this.drawNote(i, draggedNote.pitch, draggedNote.tick, draggedNote.duration, noteIndex == this.hoverNote, true);
			}
			else
				this.drawNote(i, note.pitch, note.tick, note.duration, noteIndex == this.hoverNote, this.noteSelections[noteIndex]);
		}
		
		// Draw borders.
		this.ctx.strokeStyle = "black";
		this.ctx.lineWidth = 2;
		
		var x2 = Math.min(block.x2, this.canvasWidth - this.MARGIN_LEFT);
		this.ctx.strokeRect(block.x1, block.y1, x2 - block.x1, block.y2 - block.y1);
		this.ctx.strokeRect(block.x1, block.y2 + this.CHORDNOTE_MARGIN, x2 - block.x1, this.CHORD_HEIGHT);
	}
	
	
	// Draw key changes.
	this.ctx.font = "14px Tahoma";
	this.ctx.textAlign = "left";
	this.ctx.textBaseline = "top";
	
	for (var i = 0; i < this.viewKeyChanges.length; i++)
	{
		var keyChange = this.viewKeyChanges[i];
		var textX = keyChange.x2 + 8;
		
		if (this.keyChangeSelections[i])
		{
			if (this.mouseDragAction != null)
			{
				var draggedKeyChange = this.getKeyChangeDragged(keyChange, this.mouseDragCurrent);
				
				if (draggedKeyChange.tick == keyChange.tick)
				{
					this.ctx.fillStyle = "#eeeeee";
					this.ctx.fillRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
					this.ctx.strokeStyle = "#aaaaaa";
					this.ctx.lineWidth = 2;
					this.ctx.strokeRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
				}
				else
				{
					var x = this.getPositionForTick(draggedKeyChange.tick);
					this.ctx.strokeStyle = "#aaaaaa";
					this.ctx.lineWidth = 2;
					this.ctx.beginPath();
					this.ctx.moveTo(x, keyChange.y1);
					this.ctx.lineTo(x, keyChange.y2);
					this.ctx.stroke();
				}
			}
			else
			{
				this.ctx.fillStyle = "#eeeeee";
				this.ctx.fillRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
				this.ctx.strokeStyle = "#aaaaaa";
				this.ctx.lineWidth = 2;
				this.ctx.strokeRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
			}
		}
		else
		{
			this.ctx.strokeStyle = (this.hoverKeyChange == i ? "#cccccc" : "#aaaaaa");
			this.ctx.lineWidth = 2;
			this.ctx.strokeRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
		}
		
		this.ctx.font = "14px Tahoma";
		var songKeyChange = this.songData.keyChanges[keyChange.keyChangeIndex];
		this.ctx.fillStyle = "#aaaaaa";
		this.ctx.fillText(
			"" + theoryNoteName(songKeyChange.tonicPitch) + " " + songKeyChange.scale.name,
			textX,
			keyChange.y1);
			
		this.ctx.font = "10px Tahoma";
		for (var row = 0; row < 14; row++)
		{
			this.ctx.fillStyle = "#444444";
			this.ctx.fillText(
				"" + theoryNoteName(this.getNoteForRow(row, songKeyChange)),
				keyChange.x1 + 4,
				this.canvasHeight - this.MARGIN_BOTTOM - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN - (row + 1) * this.NOTE_HEIGHT);
		}
	}
	
	
	// Draw meter changes.
	this.ctx.font = "14px Tahoma";
	this.ctx.textAlign = "left";
	
	for (var i = 0; i < this.viewMeterChanges.length; i++)
	{
		var meterChange = this.viewMeterChanges[i];
		var textX = meterChange.x2 + 8;
		
		if (this.meterChangeSelections[i])
		{
			if (this.mouseDragAction != null)
			{
				var draggedMeterChange = this.getMeterChangeDragged(meterChange, this.mouseDragCurrent);
				
				if (draggedMeterChange.tick == meterChange.tick)
				{
					this.ctx.fillStyle = "#aaeeee";
					this.ctx.fillRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
					this.ctx.strokeStyle = "#88aaaa";
					this.ctx.lineWidth = 2;
					this.ctx.strokeRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
				}
				else
				{
					var x = this.getPositionForTick(draggedMeterChange.tick);
					this.ctx.strokeStyle = "#88aaaa";
					this.ctx.lineWidth = 2;
					this.ctx.beginPath();
					this.ctx.moveTo(x, meterChange.y1);
					this.ctx.lineTo(x, meterChange.y2);
					this.ctx.stroke();
				}
			}
			else
			{
				this.ctx.fillStyle = "#aaeeee";
				this.ctx.fillRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
				this.ctx.strokeStyle = "#88aaaa";
				this.ctx.lineWidth = 2;
				this.ctx.strokeRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
			}
		}
		else
		{
			this.ctx.strokeStyle = (this.hovermeterChange == i ? "#99cccc" : "#88aaaa");
			this.ctx.lineWidth = 2;
			this.ctx.strokeRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
		}
		
		var songMeterChange = this.songData.meterChanges[meterChange.meterChangeIndex];
		this.ctx.fillStyle = "#88aaaa";
		this.ctx.fillText(
			"" + songMeterChange.numerator + " / " + songMeterChange.denominator,
			textX,
			meterChange.y1);
	}
}