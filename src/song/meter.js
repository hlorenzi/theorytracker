function SongMeterChange(tick, numerator, denominator, editorData = null)
{
	this.tick        = tick;
	this.numerator   = numerator;
	this.denominator = denominator;
	this.editorData  = editorData;
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