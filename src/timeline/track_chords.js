function TrackChords(timeline)
{
	this.timeline = timeline;
	this.elements = new ListByTimeRange();
}


TrackChords.prototype = new Track();


TrackChords.prototype.setSong = function(song)
{
	this.elements.clear();
	this.selectedElements = [];
	
	for (var i = 0; i < song.chords.length; i++)
		this.chordAdd(song.chords[i]);
}


TrackChords.prototype.chordAdd = function(chord)
{
	this.clipRange(chord.timeRange);
		
	var elem = new Element();
	elem.track = this;
	elem.chord = chord.clone();
	
	elem.chord.timeRange.clip(0, this.timeline.length);
	if (elem.chord.timeRange.duration() <= 0)
		return null;
	
	this.elementRefresh(elem);
	this.elements.add(elem);
	this.timeline.markDirtyElement(elem);
	
	return elem;
}


TrackChords.prototype.clipRange = function(timeRange)
{
	// Check for overlapping chords and clip them.
	var overlapping = [];
	
	this.elements.enumerateOverlappingRange(timeRange, function (elem)
		{ overlapping.push(elem); });
	
	for (var i = 0; i < overlapping.length; i++)
		this.elements.remove(overlapping[i]);
	
	for (var i = 0; i < overlapping.length; i++)
	{
		var elem = overlapping[i];
		
		var parts = elem.chord.timeRange.getClippedParts(timeRange);
		for (var p = 0; p < parts.length; p++)
		{
			var clippedChord = elem.chord.clone();
			clippedChord.timeRange = parts[p];
			this.chordAdd(clippedChord);
		}
	}
}


TrackChords.prototype.applyModifications = function()
{
	for (var i = 0; i < this.modifiedElements.length; i++)
	{
		var elem = this.modifiedElements[i];
		elem.chord.timeRange.clip(0, this.timeline.length);
		this.clipRange(elem.chord.timeRange);
	}
		
	for (var i = 0; i < this.modifiedElements.length; i++)
	{
		var elem = this.modifiedElements[i];
		if (elem.chord.timeRange.duration() <= 0)
		{
			this.timeline.unselect(elem);
			continue;
		}
		
		this.elementRefresh(elem);
		this.elements.add(elem);
		this.timeline.markDirtyElement(elem);
	}
	
	this.modifiedElements = [];
}


TrackChords.prototype.elementModify = function(elem)
{
	this.elements.remove(elem);
	
	var modifiedElem = this.getModifiedElement(elem);
	
	elem.chord               = elem.chord.clone();
	elem.chord.rootMidiPitch = modifiedElem.rootMidiPitch;
	elem.chord.timeRange     =
		new TimeRange(modifiedElem.start, modifiedElem.start + modifiedElem.duration);
	
	this.modifiedElements.push(elem);
}


TrackChords.prototype.elementRefresh = function(elem)
{
	var toPixels   = this.timeline.timeToPixelsScaling;
	
	elem.timeRange         = elem.chord.timeRange.clone();
	elem.interactTimeRange = elem.chord.timeRange.clone();
	elem.interactKind      =
		this.timeline.INTERACT_MOVE_TIME      | this.timeline.INTERACT_MOVE_PITCH    |
		this.timeline.INTERACT_STRETCH_TIME_L | this.timeline.INTERACT_STRETCH_TIME_R;
	
	elem.regions = [
		{
			kind:   this.timeline.INTERACT_MOVE_TIME,
			x:      elem.chord.timeRange.start * toPixels,
			y:      0,
			width:  elem.chord.timeRange.duration() * toPixels,
			height: this.height
		},
		{
			kind:   this.timeline.INTERACT_STRETCH_TIME_L,
			x:      elem.chord.timeRange.start * toPixels - 4,
			y:      0,
			width:  4,
			height: this.height
		},
		{
			kind:   this.timeline.INTERACT_STRETCH_TIME_R,
			x:      elem.chord.timeRange.end * toPixels,
			y:      0,
			width:  4,
			height: this.height
		}
	];
}


TrackChords.prototype.relayout = function()
{
	var that = this;
	
	this.elements.enumerateAll(function (elem)
		{ that.elementRefresh(elem); });
}


TrackChords.prototype.redraw = function(time1, time2)
{
	var that        = this;
	var ctx         = this.timeline.ctx;
	var toPixels    = this.timeline.timeToPixelsScaling;
	
	var xMin = Math.floor(Math.max(0, time1) * toPixels);
	var xLen = Math.floor(this.timeline.length * toPixels);
	var xMax = Math.floor(time2 * toPixels);
	
	ctx.save();
	
	ctx.beginPath();
	ctx.rect(xMin - 10, 0, xMax - xMin + 20, this.height + 1);
	ctx.clip();
	
	ctx.translate(0.5, 0.5);
	
	// Draw background.
	ctx.fillStyle = "#e4e4e4";
	ctx.fillRect(
		xMin,
		0,
		xMax,
		this.height);
	
	// Draw background after song length.
	if (time2 > this.timeline.length)
	{
		ctx.fillStyle = "#cccccc";
		ctx.fillRect(
			this.timeline.length * toPixels,
			0,
			(time2 - this.timeline.length) * toPixels,
			this.height);
	}
	
	// Draw beat lines.
	ctx.strokeStyle = "#ffffff";
	ctx.beginPath();
	this.timeline.trackMeters.enumerateBeatsAtRange(new TimeRange(time1, time2), function (time, isStrong)
	{
		var x = Math.floor(time * toPixels);
		
		ctx.moveTo(x, 0);
		ctx.lineTo(x, that.height);
		
		if (isStrong)
		{
			ctx.moveTo(x - 1, 0);
			ctx.lineTo(x - 1, that.height);
			ctx.moveTo(x + 1, 0);
			ctx.lineTo(x + 1, that.height);
		}
	});
	ctx.stroke();
		
	// Draw notes.
	this.elements.enumerateOverlappingRange(new TimeRange(time1, time2), function (elem)
		{ that.drawChord(elem); });
	
	for (var i = 0; i < this.selectedElements.length; i++)
		this.drawChord(this.selectedElements[i]);
	
	// Draw borders.
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
		ctx.moveTo(xMin, 0);
		ctx.lineTo(xMax, 0);
		
		ctx.moveTo(xMin, this.height);
		ctx.lineTo(xMax, this.height);
		
		ctx.moveTo(0, 0);
		ctx.lineTo(0, this.height);
		
		ctx.moveTo(xLen, 0);
		ctx.lineTo(xLen, this.height);
	ctx.stroke();
	
	ctx.restore();
}


TrackChords.prototype.getModifiedElement = function(elem)
{
	var timeRange     = elem.chord.timeRange.clone();
	var rootMidiPitch = elem.chord.rootMidiPitch;
	
	if (elem.selected)
	{
		if ((this.timeline.action & this.timeline.INTERACT_MOVE_TIME) != 0)
		{
			timeRange.start += this.timeline.actionMoveDeltaTime;
			timeRange.end   += this.timeline.actionMoveDeltaTime;
		}
	
		if ((this.timeline.action & this.timeline.INTERACT_MOVE_PITCH) != 0)
			rootMidiPitch = mod(rootMidiPitch + this.timeline.actionMoveDeltaPitch, 12);
		
		if ((this.timeline.action & this.timeline.INTERACT_STRETCH_TIME_L) != 0 ||
			(this.timeline.action & this.timeline.INTERACT_STRETCH_TIME_R) != 0)
		{
			timeRange.stretch(
				this.timeline.actionStretchTimePivot,
				this.timeline.actionStretchTimeOrigin,
				this.timeline.actionMoveDeltaTime);
		}
	}
	
	return {
		start:         timeRange.start,
		end:           timeRange.end,
		duration:      timeRange.duration(),
		rootMidiPitch: rootMidiPitch
	};
}


TrackChords.prototype.drawChord = function(elem)
{
	var that         = this;
	var ctx          = this.timeline.ctx;
	var toPixels     = this.timeline.timeToPixelsScaling;
	var modifiedElem = this.getModifiedElement(elem);
	
	ctx.fillStyle = "#ffffff"
	ctx.globalAlpha = 0.75;
	
	// Draw chord background.
	ctx.fillRect(
		0.5 + Math.floor(modifiedElem.start * toPixels),
		0,
		Math.floor(modifiedElem.duration * toPixels - 1),
		this.height);
		
	// Draw chord parts, one for each key region it overlaps.
	this.timeline.trackKeys.enumerateKeysAtRange(
		new TimeRange(modifiedElem.start, modifiedElem.end),
		function (key, start, end)
		{
			var isLast = end == modifiedElem.end;
			var x = 0.5 + Math.floor(start * toPixels);
			var w = Math.floor((end - start) * toPixels - (isLast ? 1 : 0))
			
			var degree = theory.pitchDegreeInKey(key.scaleIndex, key.rootMidiPitch, modifiedElem.rootMidiPitch);
			if (Math.floor(degree) == degree)
			{
				ctx.fillStyle = theory.degreeColor(degree);
				ctx.fillRect(x, 0.5, w, 5);
				ctx.fillRect(x, that.height - 5, w, 5);
			}
			else
			{
				var color1 = theory.degreeColor(Math.floor(degree));
				var color2 = theory.degreeColor(Math.ceil(degree));
				drawStripedRect(ctx, x, 0.5, w, 5, color1, color2);
				drawStripedRect(ctx, x, that.height - 5, w, 5, color1, color2);
			}
			
			// Draw roman symbol.
			var mainSymbol = theory.chordSymbolInKey(
				key.scaleIndex, key.rootMidiPitch, modifiedElem.rootMidiPitch,
				theory.chords[elem.chord.chordIndex].uppercase);
			
			ctx.fillStyle = "#000000";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			
			ctx.font = "20px Tahoma";
			var supTextWidth = ctx.measureText(theory.chords[elem.chord.chordIndex].symbolSup).width;
			var subTextWidth = ctx.measureText(theory.chords[elem.chord.chordIndex].symbolSub).width;
			
			ctx.font = "30px Tahoma";
			var mainTextWidth = ctx.measureText(mainSymbol).width;
			var totalTextWidth = mainTextWidth + supTextWidth + subTextWidth;
			
			var maxTextWidth = w - 2;
			if (totalTextWidth > maxTextWidth)
			{
				var proportion = totalTextWidth / maxTextWidth;
				supTextWidth /= proportion;
				subTextWidth /= proportion;
				mainTextWidth /= proportion;
				totalTextWidth = mainTextWidth + supTextWidth + subTextWidth;
			}
			
			ctx.fillText(
				mainSymbol,
				x + w / 2 - totalTextWidth / 2 + mainTextWidth / 2,
				that.height / 2,
				maxTextWidth - supTextWidth - subTextWidth);
			
			ctx.font = "20px Tahoma";
			ctx.fillText(
				theory.chords[elem.chord.chordIndex].symbolSup,
				x + w / 2 - totalTextWidth / 2 + mainTextWidth + supTextWidth / 2,
				that.height / 2 - 10,
				maxTextWidth - mainTextWidth - subTextWidth);
				
			ctx.fillText(
				theory.chords[elem.chord.chordIndex].symbolSub,
				x + w / 2 - totalTextWidth / 2 + mainTextWidth + supTextWidth + subTextWidth / 2,
				that.height / 2 + 10,
				maxTextWidth - mainTextWidth - supTextWidth);
		});
		
	// Draw hover white-fade overlay.
	if (elem == this.timeline.hoverElement || (elem.selected && this.timeline.mouseDown))
	{
		ctx.fillStyle = "#ffffff"
		ctx.globalAlpha = 0.35;
		
		ctx.fillRect(
			0.5 + Math.floor(modifiedElem.start * toPixels),
			0,
			Math.floor(modifiedElem.duration * toPixels - 1),
			this.height);
	}
	
	// Draw selected double-stripe overlay.
	if (elem.selected)
	{
		ctx.fillStyle = "#ffffff"
		ctx.globalAlpha = 0.35;
		
		ctx.fillRect(
			0.5 + Math.floor(modifiedElem.start * toPixels),
			3,
			Math.floor(modifiedElem.duration * toPixels - 1),
			this.height - 6);
	}
	
	ctx.globalAlpha = 1;
}