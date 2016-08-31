function snap(x, step)
{
	return Math.round(x / step) * step;
}


function mod(x, m)
{
	return (x % m + m) % m;
}


function stretch(x, pivot, origin, delta)
{
	var dist = (origin - pivot);
	var p    = (x      - pivot) / dist;
	var move = (origin + delta  - pivot) / dist;
	
	return Math.round(pivot + dist * (p * move));
}