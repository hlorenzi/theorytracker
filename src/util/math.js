function snap(x, step)
{
	return Math.round(x / step) * step;
}


function mod(x, m)
{
	return (x % m + m) % m;
}


function midiPitchToHertz(midiPitch)
{
	return Math.pow(2, (midiPitch - 69) / 12) * 440;
}


function stretch(x, pivot, origin, delta)
{
	var dist = (origin - pivot);
	var p    = (x      - pivot) / dist;
	var move = (origin + delta  - pivot) / dist;
	
	return Math.round(pivot + dist * (p * move));
}


function sliceparts(start, end, sliceStart, sliceEnd)
{
	if (sliceStart.compare(start) <= 0)
	{
		if (sliceEnd.compare(end) < 0)
			return [{ start: sliceEnd, end: end }];
		else
			return [];
	}
	else
	{
		if (sliceEnd.compare(end) >= 0)
			return [{ start: start, end: sliceStart }];
		else
			return [
				{ start: start,    end: sliceStart },
				{ start: sliceEnd, end: end        }];
	}
}