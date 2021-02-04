import Rational from "./rational"


export default class Range
{
    start: Rational
    end: Rational
    startInclusive: boolean
    endInclusive: boolean


	constructor(start: Rational, end: Rational, startInclusive: boolean = true, endInclusive: boolean = false)
	{
		this.start = start
		this.end = end
		this.startInclusive = startInclusive
		this.endInclusive = endInclusive
	}
	
	
	static fromPoint(p: Rational, startInclusive: boolean = true, endInclusive: boolean = true): Range
	{
		return new Range(p, p, startInclusive, endInclusive)
	}
	
	
	static fromStartDuration(start: Rational, duration: Rational): Range
	{
		return new Range(
			start,
			start.add(duration))
	}
	

	static dummy(): Range
	{
		return new Range(new Rational(0), new Rational(0))
	}
    

    get duration(): Rational
    {
        return this.end.subtract(this.start)
    }
	
	
	sorted(): Range
	{
		const startInclusive = this.start.lessThan(this.end)    ? this.startInclusive : this.endInclusive
		const endInclusive   = this.end.greaterThan(this.start) ? this.endInclusive   : this.startInclusive
		
		return new Range(
			this.start.min(this.end)!,
			this.start.max(this.end)!,
			startInclusive,
			endInclusive)
	}
	
	
	max(): Rational
	{
		return this.start.max(this.end)!
	}
	
	
	min(): Rational
	{
		return this.start.min(this.end)!
	}
	
	
	merge(other: Range | null): Range
	{
		return Range.merge(this, other)!
	}
	
	
	static merge(r1: Range | null, r2: Range | null): Range | null
	{
		if (r1 === null && r2 === null)
			return null
		
		if (r1 === null)
			return r2
		
		if (r2 === null)
			return r1
		
		return new Range(
			r1.start.min(r2.start)!,
			r1.end.max(r2.end)!)
	}
	
	
	intersect(other: Range | null): Range
	{
		return Range.intersect(this, other)!
	}
	
	
	static intersect(r1: Range | null, r2: Range | null): Range | null
	{
		if (r1 === null && r2 === null)
			return null
		
		if (r1 === null)
			return r2
		
		if (r2 === null)
			return r1
		
		return new Range(
			r1.start.max(r2.start)!,
			r1.end.min(r2.end)!)
	}


	atZero(): Range
	{
		return new Range(
			new Rational(0),
			this.duration,
			this.startInclusive,
			this.endInclusive)
	}
	
	
	stretch(offset: Rational, pivot: Rational, origin: Rational): Range
	{
		return new Range(
			this.start.stretch(offset, pivot, origin),
			this.end.stretch(offset, pivot, origin),
			this.startInclusive,
			this.endInclusive)
	}
	
	
	displace(offset: Rational): Range
	{
		return new Range(
			this.start.add(offset),
			this.end.add(offset),
			this.startInclusive,
			this.endInclusive)
	}
	
	
	subtract(offset: Rational): Range
	{
		return new Range(
			this.start.subtract(offset),
			this.end.subtract(offset),
			this.startInclusive,
			this.endInclusive)
	}
	
	
	grow(offset: Rational): Range
	{
		return new Range(
			this.start.subtract(offset),
			this.end.add(offset),
			this.startInclusive,
			this.endInclusive)
	}
	
	
	shrink(offset: Rational): Range
	{
		return new Range(
			this.start.add(offset),
			this.end.subtract(offset),
			this.startInclusive,
			this.endInclusive)
	}


	snap(step: Rational): Range
	{
		return new Range(
			this.start.snap(step),
			this.end.snap(step),
			this.startInclusive,
			this.endInclusive)
	}
	
	
	*iterSlices(slice: Range): Generator<Range, void, void>
	{
		if (slice.start.compare(this.start) <= 0)
		{
			if (slice.end.compare(this.end) < 0)
				yield new Range(slice.end.max(this.start), this.end)
		}
		else
		{
			if (slice.end.compare(this.end) >= 0)
				yield new Range(this.start, slice.start.min(this.end))
			else
			{
				yield new Range(this.start, slice.start.min(this.end))
				yield new Range(slice.end.max(this.start), this.end)
			}
		}
	}
	
	
	isPoint(): boolean
	{
		return this.start.equalTo(this.end)
	}
	
	
	overlapsPoint(point: Rational): boolean
	{
		const compStart = this.start.compare(point)
		const compEnd   = this.end.compare(point)
		
		const checkStart = (this.startInclusive ? (compStart <= 0) : (compStart < 0))
		const checkEnd   = (this.endInclusive   ? (compEnd   >= 0) : (compEnd   > 0))
		
		return checkStart && checkEnd
	}
	
	
	overlapsRange(range: Range): boolean
	{
		const compStart = this.start.compare(range.end)
		const compEnd   = this.end.compare(range.start)
		
		const checkStart = (this.startInclusive && range.endInclusive   ? (compStart <= 0) : (compStart < 0))
		const checkEnd   = (this.endInclusive   && range.startInclusive ? (compEnd   >= 0) : (compEnd   > 0))
		
		return checkStart && checkEnd
	}
	
	
	containsRangeCompletely(range: Range): boolean
	{
		const compStart = this.start.compare(range.start)
		const compEnd   = this.end.compare(range.end)
		
		const checkStart = (this.startInclusive ? (compStart <= 0) : (compStart < 0))
		const checkEnd   = (this.endInclusive   ? (compEnd   >= 0) : (compEnd   > 0))
		
		return checkStart && checkEnd
	}


	toJson(): [[number, number, number]] | [[number, number, number], [number, number, number]]
	{
		if (this.start.compare(this.end) == 0)
			return [this.start.toJson()]
		else
			return [this.start.toJson(), this.duration.toJson()]
	}


	static fromJson(json: [[number, number, number]] | [[number, number, number], [number, number, number]]): Range
	{
		if (json.length == 1)
			return Range.fromPoint(Rational.fromJson(json[0]))
		else
			return Range.fromStartDuration(Rational.fromJson(json[0]), Rational.fromJson(json[1]))
	}
}