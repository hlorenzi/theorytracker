import Rational from "../util/rational.js"


export class Meter
{
	constructor(numerator, denominator)
	{
		this.numerator = numerator
		this.denominator = denominator
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new Meter(this.numerator, this.denominator), obj)
	}


	*iterMeasuresPairwise(time = null)
	{
		time = time || new Rational(0)

		while (true)
		{
			const nextTime = time.add(new Rational(this.numerator, this.denominator))
			yield [this.numerator, this.denominator, time, nextTime]
			time = nextTime
		}
	}


	get fullCycleDuration()
	{
		return new Rational(this.numerator, this.denominator)
	}


	get alternatingMeasureCount()
	{
		return 1
	}
}