import Rational from "../util/rational"


export default class Meter
{
	numerator: number
	denominator: number


	constructor(numerator: number, denominator: number)
	{
		this.numerator = numerator
		this.denominator = denominator
	}
	
	
	withChanges(obj: any): Meter
	{
		return Object.assign(new Meter(this.numerator, this.denominator), obj)
	}


	*iterMeasuresPairwise(time: any = null): Generator<[number, number, any, any], void, void>
	{
		time = time || new Rational(0)

		while (true)
		{
			const nextTime = time.add(new Rational(this.numerator, this.denominator))
			yield [this.numerator, this.denominator, time, nextTime]
			time = nextTime
		}
	}


	get fullCycleDuration(): any
	{
		return new Rational(this.numerator, this.denominator)
	}


	get alternatingMeasureCount(): number
	{
		return 1
	}
}