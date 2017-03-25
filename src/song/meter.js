function SongMeterChange(tick, numerator, denominator)
{
	this.tick        = tick;
	this.numerator   = numerator;
	this.denominator = denominator;
	this.editorData  = null;
}


SongMeterChange.prototype.clone = function()
{
	return new SongMeterChange(
		this.tick.clone(),
		this.numerator,
		this.denominator);
}


SongMeterChange.prototype.getMeasureLength = function()
{
	return new Rational(
		0,
		this.numerator,
		this.denominator);
}


SongMeterChange.prototype.getBeatLength = function()
{
	return new Rational(
		0,
		1,
		this.denominator);
}


SongMeterChange.prototype.getLabel = function()
{
	return Theory.getMeterLabel(this.numerator, this.denominator);
}