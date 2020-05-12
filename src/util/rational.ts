function mod(x: number, m: number): number
{
	return (x % m + m) % m
}


export default class Rational
{
    numerator: number
    denominator: number


	constructor(numerator: number = 0, denominator: number = 1)
	{
		if (denominator == 0)
			throw "denominator zero"

		if (!isFinite(numerator) || !isFinite(denominator))
			throw "invalid rational"
		
		this.numerator = numerator
		this.denominator = denominator
		this.simplifyInPlace()
	}
	
	
	static fromFloat(floatValue: number, maxDenominator: number): Rational
	{
		const integer = Math.floor(floatValue)
		const frac = floatValue - integer
		
		return new Rational(integer * maxDenominator + Math.round(frac * maxDenominator), maxDenominator)
	}
	
	
	static fromIntegerPlusRational(integer: number, numeratorWithoutInteger: number, denominator: number): Rational
	{
		return new Rational(integer * denominator + numeratorWithoutInteger, denominator)
	}
	
	
	asFloat(): number
	{
		return this.numerator / this.denominator
	}
	
	
	get n(): number
	{
		return this.numerator
	}
	
	
	get d(): number
	{
		return this.denominator
	}
	
	
	get integer(): number
	{
		return Math.floor(this.numerator / this.denominator)
	}
	
	
	get numeratorWithoutInteger(): number
	{
		return mod(this.numerator, this.denominator)
	}
	
	
	negate(): Rational
	{
		return new Rational(
			-this.numerator,
			this.denominator)
	}
	
	
	absolute(): Rational
	{
		if (this.numerator < 0)
			return new Rational(-this.numerator, this.denominator)
		else
			return this
	}
	
	
	add(other: Rational): Rational
	{
		return new Rational(
			this.numerator * other.denominator + other.numerator * this.denominator,
			this.denominator * other.denominator)
	}
	
	
	subtract(other: Rational): Rational
	{
		return new Rational(
			this.numerator * other.denominator - other.numerator * this.denominator,
			this.denominator * other.denominator)
	}
	
	
	multiply(other: Rational): Rational
	{
		return new Rational(
			this.numerator * other.numerator,
			this.denominator * other.denominator)
	}
	
	
	multiplyByFloat(x: number): Rational
	{
		return new Rational(
			this.numerator * x,
			this.denominator)
	}
	
	
	divide(other: Rational): Rational
	{
		return new Rational(
			this.numerator * other.denominator,
			this.denominator * other.numerator)
	}


	snap(step: Rational): Rational
	{
		return Rational.fromFloat(this.asFloat(), step.denominator)
	}
	
	
	quantize(maxDenominator: number): Rational
	{
		if (this.denominator <= maxDenominator)
			return this
		
		return new Rational(Math.round(this.numerator / this.denominator * maxDenominator), maxDenominator)
	}
	
	
	stretch(offset: Rational, pivot: Rational, origin: Rational): Rational
	{
		let dist = origin.subtract(pivot)
		if (dist.numerator == 0)
			return this
		
		let p    = this.subtract(pivot).divide(dist)
		let move = origin.add(offset).subtract(pivot).divide(dist)
		
		return pivot.add(dist.multiply(p).multiply(move))
	}
	
	
	isZero(): boolean
	{
		return this.numerator == 0
	}
	
	
	compare(other: Rational): number
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
	
	
	equalTo(other: Rational): boolean
	{
		return this.compare(other) == 0
	}
	
	
	notEqualTo(other: Rational): boolean
	{
		return this.compare(other) != 0
	}
	
	
	lessThan(other: Rational): boolean
	{
		return this.compare(other) < 0
	}
	
	
	lessThanOrEqual(other: Rational): boolean
	{
		return this.compare(other) <= 0
	}
	
	
	greaterThan(other: Rational): boolean
	{
		return this.compare(other) > 0
	}
	
	
	greaterThanOrEqual(other: Rational): boolean
	{
		return this.compare(other) >= 0
	}
	
	
	static max(a: Rational | null, b: Rational | null): Rational | null
	{
		if (a === null && b === null)
			return null
		
		if (a === null)
			return b
		
		if (b === null)
			return a
		
		if (a.compare(b) > 0)
			return a
		else
			return b
	}
	
	
	static min(a: Rational | null, b: Rational | null): Rational | null
	{
		if (a === null && b === null)
			return null
		
		if (a === null)
			return b
		
		if (b === null)
			return a
		
		if (a.compare(b) < 0)
			return a
		else
			return b
	}


	max(other: Rational | null): Rational | null
	{
		return Rational.max(this, other)
	}


	min(other: Rational | null): Rational | null
	{
		return Rational.min(this, other)
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
	
	
	trySimplifyInPlaceBy(divider: number)
	{
		while ((this.numerator % divider) == 0 && (this.denominator % divider) == 0)
		{
			this.numerator /= divider
			this.denominator /= divider
		}
	}
	
	
	toString(): string
	{
		let integer = Math.floor(this.numerator / this.denominator)
		let numerator = this.numerator % this.denominator
		
		if (numerator == 0)
			return integer.toString()
		else
			return integer.toString() + " + " + numerator.toString() + "/" + this.denominator.toString()
	}
	
	
	toJSONString(): string
	{
		return "[" + Math.floor(this.numerator / this.denominator) + "," + mod(this.numerator, this.denominator) + "," + this.denominator + "]"
	}
	
	
	static fromArray(array: [number, number, number]): Rational
	{
		return new Rational(array[0] * array[2] + array[1], array[2])
	}
}