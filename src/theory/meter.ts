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


	*iterMeasuresPairwise(time: Rational | null = null): Generator<[number, number, any, any], void, void>
	{
		time = time || new Rational(0)

		while (true)
		{
			const nextTime: Rational = time.add(new Rational(this.numerator, this.denominator))
			yield [this.numerator, this.denominator, time, nextTime]
			time = nextTime
		}
	}


	get fullCycleDuration(): Rational
	{
		return new Rational(this.numerator, this.denominator)
	}


	get alternatingMeasureCount(): number
	{
		return 1
	}


	get str(): string
	{
		return this.numerator + " / " + this.denominator
	}


	static parse(src: string): Meter
	{
		const split = src.split("/")
		if (split.length != 2)
			throw "invalid meter syntax"

		const numerator = parseInt(split[0].trim())
		const denominator = parseInt(split[1].trim())

		if (!isFinite(numerator) || !isFinite(denominator))
			throw "invalid meter syntax"

		return new Meter(numerator, denominator)
	}
}