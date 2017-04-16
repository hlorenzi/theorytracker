function Rational(integer = 0, numerator = 0, denominator = 1)
{
	if (denominator <= 0)
		throw "Rational denominator must be larger than 0";
	
	this.integer = integer;
	this.numerator = numerator;
	this.denominator = denominator;
	this.normalize();
}


Rational.prototype.clone = function()
{
	return new Rational(this.integer, this.numerator, this.denominator);
}


Rational.fromFloat = function(value, step)
{
	var rational = new Rational(Math.floor(value));
	
	while (rational.asFloat() < value)
		rational.add(step);
	
	return rational;
}


Rational.fromArray = function(arr)
{
	return new Rational(arr[0], arr[1], arr[2]);
}


Rational.prototype.toString = function()
{	
	return "[" + this.integer + ", " + this.numerator + ", " + this.denominator + "]";
}


Rational.prototype.toUserString = function()
{	
	if (this.integer == 0 && this.numerator == 0)
		return "0";
	
	var string = "";
	if (this.integer != 0)
		string += this.integer.toString();
	
	if (this.numerator != 0)
	{
		if (this.integer != 0)
			string += "+";
		
		string += this.numerator.toString() + "/" + this.denominator.toString();
	}
	
	return string;
}


Rational.prototype.normalize = function()
{
	while (this.numerator < 0)
	{
		this.numerator += this.denominator;
		this.integer -= 1;
	}
	
	while (this.numerator >= this.denominator)
	{
		this.numerator -= this.denominator;
		this.integer += 1;
	}
	
	this.trySimplifyBy(2);
	this.trySimplifyBy(3);
	this.trySimplifyBy(5);
	this.trySimplifyBy(7);
	this.trySimplifyBy(11);
	this.trySimplifyBy(13);
}


Rational.prototype.trySimplifyBy = function(divider)
{
	while ((this.numerator % divider) == 0 && (this.denominator % divider) == 0)
	{
		this.numerator /= divider;
		this.denominator /= divider;
	}
}


Rational.prototype.asFloat = function()
{
	return this.integer + this.numerator / this.denominator;
}


Rational.prototype.getAsNumerator = function(denominator)
{
	return (this.integer * denominator) + (this.numerator * (denominator / this.denominator));
}


Rational.prototype.negate = function()
{
	this.integer = -this.integer - 1;
	this.numerator = this.denominator - this.numerator;
	
	this.normalize();
	
	return this;
}


Rational.prototype.add = function(other)
{
	this.addInteger(other.integer);
	this.addFraction(other.numerator, other.denominator);
	
	return this;
}


Rational.prototype.subtract = function(other)
{
	var commonDenominator = other.denominator * this.denominator;
	
	this.numerator = this.getAsNumerator(commonDenominator) - other.getAsNumerator(commonDenominator);
	this.denominator = commonDenominator;
	this.integer = 0;
	
	this.normalize();
	
	return this;
}


Rational.prototype.subtractFrom = function(other)
{
	var commonDenominator = other.denominator * this.denominator;
	
	this.numerator = other.getAsNumerator(commonDenominator) - this.getAsNumerator(commonDenominator);
	this.denominator = commonDenominator;
	this.integer = 0;
	
	this.normalize();
	
	return this;
}


Rational.prototype.multiply = function(other)
{
	var numerator = this.integer * this.denominator + this.numerator;
	var otherNumerator = other.integer * other.denominator + other.numerator;
	
	this.integer = 0;
	this.numerator = numerator * otherNumerator;
	this.denominator = this.denominator * other.denominator;
	
	this.normalize();
	
	return this;
}


Rational.prototype.addInteger = function(value)
{
	this.integer += value;
	
	return this;
}


Rational.prototype.addFraction = function(numerator, denominator)
{
	if ((denominator % this.denominator) == 0)
	{
		var scale = denominator / this.denominator;
		this.numerator *= scale;
		this.denominator *= scale;
	}
	
	if (denominator == this.denominator)
		this.numerator += numerator;
	
	else
	{
		var commonDenominator = denominator * this.denominator;
		
		var scale1 = commonDenominator / this.denominator;
		var scale2 = commonDenominator / denominator;
		
		this.numerator *= scale1;
		this.numerator += scale2 * numerator;
		
		this.denominator = commonDenominator;
	}
	
	this.normalize();
	
	return this;
}


Rational.prototype.max = function(other)
{
	if (this.compare(other) < 0)
	{
		this.integer = other.integer;
		this.numerator = other.numerator;
		this.denominator = other.denominator;
	}
	
	return this;
}


Rational.prototype.min = function(other)
{
	if (this.compare(other) > 0)
	{
		this.integer = other.integer;
		this.numerator = other.numerator;
		this.denominator = other.denominator;
	}
	
	return this;
}


Rational.prototype.compare = function(other)
{
	if (this.integer != other.integer)
	{
		if (this.integer < other.integer)
			return -1;
		else
			return 1;
	}
	
	else
	{
		var commonDenominator = other.denominator * this.denominator;
		
		var scale1 = commonDenominator / this.denominator;
		var scale2 = commonDenominator / other.denominator;
		
		var numerator1 = this.numerator * scale1;
		var numerator2 = other.numerator * scale2;
		
		if (numerator1 < numerator2)
			return -1;
		else if (numerator1 > numerator2)
			return 1;
		else
			return 0;
	}
}