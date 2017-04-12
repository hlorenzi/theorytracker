function byteArrayToString(array)
{
	var result = "";
	
	for (var i = 0; i < array.length; i++)
		result += String.fromCharCode(array[i]);
	
	return result;
}


function BinaryWriter()
{
	this.currentByte = 0;
	this.currentBitNum = 0;
	this.data = [];
}


BinaryWriter.prototype.writeBit = function(bit)
{
	this.currentByte = (this.currentByte << 1) | (bit & 0x1);
	this.currentBitNum += 1;
	
	if (this.currentBitNum >= 8)
	{
		this.data.push(this.currentByte);
		this.currentByte = 0;
		this.currentBitNum = 0;
	}
}


BinaryWriter.prototype.finish = function()
{
	while (this.currentBitNum > 0)
		this.writeBit(0);
	
	return this.data;
}


BinaryWriter.prototype.writeInteger = function(value, canBeNegative = true, blockSize = 5)
{
	if (canBeNegative)
	{
		if (value < 0)
		{
			this.writeBit(1);
			value = -value;
		}
		else
			this.writeBit(0);
	}
	
	while (true)
	{
		for (var i = 0; i < blockSize; i++)
		{
			this.writeBit(value & 0x1);
			value >>= 1;
		}
		
		this.writeBit(value > 0 ? 1 : 0);
		if (value == 0)
			break;
	}
}


BinaryWriter.prototype.writeRational = function(rational, canBeNegative = true)
{
	if (rational.numerator == 0)
	{
		this.writeBit(0);
		this.writeInteger(rational.integer, canBeNegative);
	}
	else
	{
		this.writeBit(1);
		this.writeInteger(rational.integer, canBeNegative);
		this.writeInteger(rational.numerator, false);
		this.writeInteger(rational.denominator, false);
	}
}


function BinaryReader(data)
{
	this.data = data;
	this.index = 0;
	this.currentBitNum = 8;
}


BinaryReader.prototype.readBit = function()
{
	if (this.index >= this.data.length)
		return 0;
	
	this.currentBitNum -= 1;
	var bit = (this.data[this.index] >> this.currentBitNum) & 0x1;
	
	if (this.currentBitNum <= 0)
	{
		this.index += 1;
		this.currentBitNum = 8;
	}
	
	return bit;
}


BinaryReader.prototype.readInteger = function(canBeNegative = true, blockSize = 5)
{
	var sign = 1;
	if (canBeNegative)
	{
		if (this.readBit() == 1)
			sign = -1;
	}
	
	var value = 0;
	var index = 0;
	while (true)
	{
		for (var i = 0; i < blockSize; i++)
		{
			value |= (this.readBit() << index);
			index += 1;
		}
		
		if (this.readBit() == 0)
			break;
	}
	
	return value * sign;
}


BinaryReader.prototype.readRational = function(canBeNegative = true)
{
	if (this.readBit() == 0)
	{
		return new Rational(this.readInteger(canBeNegative));
	}
	else
	{
		return new Rational(
			this.readInteger(canBeNegative),
			this.readInteger(false),
			this.readInteger(false));
	}
}