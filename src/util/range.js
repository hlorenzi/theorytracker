export class Range
{
	constructor(start, end, startInclusive = true, endInclusive = false)
	{
		this.start = start
		this.end = end
		this.startInclusive = startInclusive
		this.endInclusive = endInclusive
		this.duration = end.subtract(start)
	}
	
	
	static fromPoint(p)
	{
		return new Range(p, p, true, true)
	}
	
	
	static fromStartDuration(start, duration)
	{
		return new Range(
			start,
			start.add(duration))
	}
	
	
	sorted()
	{
		const startInclusive = this.start.lessThan(this.end)    ? this.startInclusive : this.endInclusive
		const endInclusive   = this.end.greaterThan(this.start) ? this.endInclusive   : this.startInclusive
		
		return new Range(
			this.start.min(this.end),
			this.start.max(this.end),
			startInclusive,
			endInclusive)
	}
	
	
	max(point)
	{
		return new Range(
			this.start.max(point),
			this.end.max(point))
	}
	
	
	min(point)
	{
		return new Range(
			this.start.min(point),
			this.end.min(point))
	}
	
	
	merge(other)
	{
		if (other == null)
			return this
		
		return new Range(
			this.start.min(other.start),
			this.end.max(other.end))
	}
	
	
	displace(offset)
	{
		return new Range(
			this.start.add(offset),
			this.end.add(offset),
			this.startInclusive,
			this.endInclusive)
	}
	
	
	stretch(offset, pivot, origin)
	{
		return new Range(
			this.start.stretch(offset, pivot, origin),
			this.end.stretch(offset, pivot, origin),
			this.startInclusive,
			this.endInclusive)
	}
	
	
	shrink(offset)
	{
		return new Range(
			this.start.add(offset),
			this.end.subtract(offset),
			this.startInclusive,
			this.endInclusive)
	}
	
	
	sliceBy(slice)
	{
		if (slice.start.compare(this.start) <= 0)
		{
			if (slice.end.compare(this.end) < 0)
				return [new Range(slice.end, this.end)]
			else
				return []
		}
		else
		{
			if (slice.end.compare(this.end) >= 0)
				return [new Range(this.start, slice.start)]
			else
				return [new Range(this.start, slice.start), new Range(slice.end, this.end)]
		}
	}
	
	
	isPoint()
	{
		return this.start.equalTo(this.end)
	}
	
	
	overlapsPoint(point)
	{
		const compStart = this.start.compare(point)
		const compEnd   = this.end.compare(point)
		
		const checkStart = (this.startInclusive ? (compStart <= 0) : (compStart < 0))
		const checkEnd   = (this.endInclusive   ? (compEnd   >= 0) : (compEnd   > 0))
		
		return checkStart & checkEnd
	}
	
	
	overlapsRange(range)
	{
		const compStart = this.start.compare(range.end)
		const compEnd   = this.end.compare(range.start)
		
		const checkStart = (this.startInclusive & range.endInclusive   ? (compStart <= 0) : (compStart < 0))
		const checkEnd   = (this.endInclusive   & range.startInclusive ? (compEnd   >= 0) : (compEnd   > 0))
		
		return checkStart & checkEnd
	}
}