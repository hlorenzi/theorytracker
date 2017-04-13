function byteArrayToString(array)
{
	var result = "";
	
	for (var i = 0; i < array.length; i++)
		result += String.fromCharCode(array[i]);
	
	return result;
}


function BinaryWriter()
{
	this.data = [];
}


BinaryWriter.prototype.writeInteger = function(value)
{
	var negative = (value < 0);
	
	if (negative)
		value = -value;
	
	this.data.push((negative ? 0x40 : 0) | (value & 0x3f));
	value >>= 6;
	
	var spliceAt = this.data.length - 1;	
	while (value > 0)
	{
		this.data.splice(spliceAt, 0, 0x80 | (value & 0x7f));
		value >>= 7;
	}
}


BinaryWriter.prototype.writeRational = function(rational)
{
	this.writeInteger(rational.integer);
	this.writeInteger(rational.numerator);
	
	if (rational.numerator != 0)
		this.writeInteger(rational.denominator);
}


function BinaryReader(data)
{
	this.data = data;
	this.index = 0;
}


BinaryReader.prototype.readInteger = function()
{
	var value = 0;
	while (true)
	{
		if (this.index >= this.data.length)
			throw "unexpected end of binary stream";
		
		var block = this.data[this.index];
		this.index += 1;
		
		if ((block & 0x80) == 0)
		{
			value = (value << 6) | (block & 0x3f);
			
			if ((block & 0x40) != 0)
				value = -value;
			
			break;
		}
		else
			value = (value << 7) | (block & 0x7f);
	}
	
	return value;
}


BinaryReader.prototype.readRational = function()
{
	var integer = this.readInteger();
	var numerator = this.readInteger();
	var denominator = 1;
	if (numerator != 0)
		denominator = this.readInteger();
	
	return new Rational(integer, numerator, denominator);
}