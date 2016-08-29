Timeline.prototype.handleKeyDown = function(ev)
{
	var that = this;

	var ctrl  = ev.ctrlKey;
	var shift = ev.shiftKey;
	
	//ev.preventDefault();
	
	switch (ev.keyCode)
	{
		// Left arrow
		case 37:
		{
			if (this.selectedElements.length == 0)
			{
				this.setCursorBoth(
					this.cursorTime1 - this.timeSnap,
					this.cursorTime1 - this.timeSnap,
					this.cursorTrack1,
					this.cursorTrack2);
			}
			
			break;
		}
		
		// Right arrow
		case 39:
		{
			if (this.selectedElements.length == 0)
			{
				this.setCursorBoth(
					this.cursorTime1 + this.timeSnap,
					this.cursorTime1 + this.timeSnap,
					this.cursorTrack1,
					this.cursorTrack2);
			}
			
			break;
		}
	}
	
	this.redraw();
}