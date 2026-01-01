import Rational from "../utils/rational.ts"


export interface Ratio
{
	numerator: number
	denominator: number
}


export default class Meter
{
	ratios: Ratio[]


	constructor(numerator: number, denominator: number)
	{
		this.ratios = [{ numerator, denominator }]
	}


	clone()
	{
		let cloned = new Meter(0, 0)
		cloned.ratios = [...this.ratios.map(r => ({ ...r }))]
		return cloned
	}


	withNumerator(index: number, numerator: number)
	{
		let cloned = this.clone()
		cloned.ratios[index].numerator = numerator
		return cloned
	}


	withDenominator(index: number, denominator: number)
	{
		let cloned = this.clone()
		cloned.ratios[index].denominator = denominator
		return cloned
	}


	withAddedRatio()
	{
		let cloned = this.clone()
		cloned.ratios.push({ ...cloned.ratios[cloned.ratios.length - 1] })
		return cloned
	}


	withRemovedRatio(index: number)
	{
		let cloned = this.clone()
		cloned.ratios.splice(index, 1)
		return cloned
	}


	*iterMeasuresPairwise(time: Rational | null = null): Generator<[number, number, any, any], void, void>
	{
		time = time ?? new Rational(0)

		let ratioIndex = 0

		while (true)
		{
			const ratio = this.ratios[ratioIndex]
			ratioIndex = (ratioIndex + 1) % this.ratios.length
			const nextTime: Rational = time.add(new Rational(ratio.numerator, ratio.denominator))
			yield [ratio.numerator, ratio.denominator, time, nextTime]
			time = nextTime
		}
	}


	get fullCycleDuration(): Rational
	{
		let duration = new Rational(0)
		for (const ratio of this.ratios)
			duration = duration.add(new Rational(ratio.numerator, ratio.denominator))

		return duration
	}


	get alternatingMeasureCount(): number
	{
		return this.ratios.length
	}


	toJson(): [number, number][]
	{
		return this.ratios.map(r => [r.numerator, r.denominator])
	}


	static fromJson(data: [number, number][]): Meter
	{
		let meter = new Meter(data[0][0], data[0][1])
		for (let i = 1; i < data.length; i++)
		{
			meter = meter.withAddedRatio()
			meter.ratios[i].numerator = data[i][0]
			meter.ratios[i].denominator = data[i][1]
		}

		return meter
	}


	toString(): string
	{
		let str = ""
		for (const ratio of this.ratios)
		{
			if (str !== "")
				str += " -- "
			
			str += ratio.numerator + " / " + ratio.denominator
		}

		return str
	}


	static parse(src: string): Meter
	{
		const split = src.split("/")
		if (split.length !== 2)
			throw "invalid meter syntax"

		const numerator = parseInt(split[0].trim())
		const denominator = parseInt(split[1].trim())

		if (!isFinite(numerator) || !isFinite(denominator))
			throw "invalid meter syntax"

		return new Meter(numerator, denominator)
	}
}