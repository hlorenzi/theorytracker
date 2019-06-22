export class Rational
{
	constructor(numerator = 0, denominator = 1)
	{
		if (denominator == 0)
			throw new "denominator zero"
		
		this.numerator = numerator
		this.denominator = denominator
		this.simplifyInPlace()
	}
	
	
	static fromFloat(floatValue, maxDenominator)
	{
		const integer = Math.floor(floatValue)
		const frac = floatValue - integer
		
		return new Rational(integer * maxDenominator + Math.floor(frac * maxDenominator), maxDenominator)
	}
	
	
	asFloat()
	{
		return this.numerator / this.denominator
	}
	
	
	get integer()
	{
		return Math.floor(this.numerator / this.denominator)
	}
	
	
	get numeratorWithoutInteger()
	{
		return this.numerator % this.denominator
	}
	
	
	negate()
	{
		return new Rational(
			-this.numerator,
			this.denominator)
	}
	
	
	absolute()
	{
		if (this.numerator < 0)
			return new Rational(-this.numerator, this.denominator)
		else
			return this
	}
	
	
	add(other)
	{
		return new Rational(
			this.numerator * other.denominator + other.numerator * this.denominator,
			this.denominator * other.denominator)
	}
	
	
	subtract(other)
	{
		return new Rational(
			this.numerator * other.denominator - other.numerator * this.denominator,
			this.denominator * other.denominator)
	}
	
	
	multiply(other)
	{
		return new Rational(
			this.numerator * other.numerator,
			this.denominator * other.denominator)
	}
	
	
	divide(other)
	{
		return new Rational(
			this.numerator * other.denominator,
			this.denominator * other.numerator)
	}
	
	
	stretch(offset, pivot, origin)
	{
		let dist = origin.subtract(pivot)
		if (dist.numerator == 0)
			return this
		
		let p    = this.subtract(pivot).divide(dist)
		let move = origin.add(offset).subtract(pivot).divide(dist)
		
		return pivot.add(dist.multiply(p).multiply(move))
	}
	
	
	isZero()
	{
		return this.numerator == 0
	}
	
	
	compare(other)
	{
		let thisNumerator = this.numerator * other.denominator
		let otherNumerator = other.numerator * this.denominator
		
		if (thisNumerator < otherNumerator)
			return -1
		else if (thisNumerator > otherNumerator)
			return 1
		else
			return 0
	}
	
	
	equalTo(other)
	{
		return this.compare(other) == 0
	}
	
	
	notEqualTo(other)
	{
		return this.compare(other) != 0
	}
	
	
	lessThan(other)
	{
		return this.compare(other) < 0
	}
	
	
	lessThanOrEqual(other)
	{
		return this.compare(other) <= 0
	}
	
	
	greaterThan(other)
	{
		return this.compare(other) > 0
	}
	
	
	greaterThanOrEqual(other)
	{
		return this.compare(other) >= 0
	}
	
	
	static max(a, b)
	{
		if (a == null && b == null)
			return null
		
		if (a == null)
			return b
		
		if (b == null)
			return a
		
		return a.max(b)
	}
	
	
	static min(a, b)
	{
		if (a == null && b == null)
			return null
		
		if (a == null)
			return b
		
		if (b == null)
			return a
		
		return a.min(b)
	}


	max(other)
	{
		if (this.compare(other) < 0)
			return other
		else
			return this
	}


	min(other)
	{
		if (this.compare(other) > 0)
			return other
		else
			return this
	}
	
	
	simplifyInPlace()
	{
		this.trySimplifyInPlaceBy(2)
		this.trySimplifyInPlaceBy(3)
		this.trySimplifyInPlaceBy(5)
		this.trySimplifyInPlaceBy(7)
		this.trySimplifyInPlaceBy(11)
		this.trySimplifyInPlaceBy(13)
	}
	
	
	trySimplifyInPlaceBy(divider)
	{
		while ((this.numerator % divider) == 0 && (this.denominator % divider) == 0)
		{
			this.numerator /= divider
			this.denominator /= divider
		}
	}
	
	
	toString()
	{
		let integer = Math.floor(this.numerator / this.denominator)
		let numerator = this.numerator % this.denominator
		
		if (numerator == 0)
			return integer.toString()
		else
			return integer.toString() + " + " + numerator.toString() + "/" + this.denominator.toString()
	}
	
	
	toJSONString()
	{
		function mod(x, m)
		{
			return (x % m + m) % m
		}
		
		return "[" + Math.floor(this.numerator / this.denominator) + "," + mod(this.numerator, this.denominator) + "," + this.denominator + "]"
	}
	
	
	static fromArray(array)
	{
		return new Rational(array[0] * array[2] + array[1], array[2])
	}
}