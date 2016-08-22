function Meter(time, numerator, denominator)
{
	this.time        = time;
	this.numerator   = numerator;
	this.denominator = denominator;
}


Meter.prototype.clone = function()
{
	return new Meter(
		this.time,
		this.numerator,
		this.denominator);
}