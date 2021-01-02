import Rational from "./rational"
import Range from "./range"
import BinarySearch from "./binarySearch"
import Immutable from "immutable"
import assert from "assert"


interface Element
{
    id: number
    range: Range
}


class Bucket<T>
{
    start: number
    elems: T[]


    constructor(start: number)
    {
        this.start = start
        this.elems = []
    }
}


export default class ListOfRanges<T extends Element>
{
    idMap: Immutable.Map<number, T>
    buckets: Bucket<T>[]
    bucketFn: (t: Rational) => number


	constructor()
	{
		this.idMap = Immutable.Map<number, T>()
		this.buckets = []
		this.bucketFn = (t) => t.asFloat()
	}
	
	
	clone(): ListOfRanges<T>
	{
		let cloned = new ListOfRanges<T>()
		cloned.idMap = this.idMap
		cloned.buckets = this.buckets
		cloned.bucketFn = this.bucketFn
		return cloned
	}
	
	
	clear(): ListOfRanges<T>
	{
		return Object.assign(new ListOfRanges<T>(), { bucketFn: this.bucketFn })
	}
	
	
	_ensureBucketsAtRange(range: Range)
	{
		let newBuckets = [ ...this.buckets ]
		
		if (this.buckets.length == 0)
			newBuckets = [ new Bucket<T>(0) ]
		
		const start = this.bucketFn(range.start)
		while (start < newBuckets[0].start)
		{
			const newBucket = new Bucket<T>(newBuckets[0].start - 1)			
			newBuckets = [ newBucket, ...newBuckets ]
		}
		
		const end = this.bucketFn(range.end)
		while (end >= newBuckets[newBuckets.length - 1].start + 1)
		{
			const newBucket = new Bucket<T>(newBuckets[newBuckets.length - 1].start + 1)
			newBuckets = [ ...newBuckets, newBucket ]
		}
		
		const cloned = this.clone()
		cloned.buckets = newBuckets
		return cloned
	}
	
	
	*_iterBucketIndicesAtRange(range: Range): Generator<number, void, void>
	{
		const start = this.bucketFn(range.start)
		const end = this.bucketFn(range.end)

		let b = BinarySearch.find(this.buckets, (bucket) => start - bucket.start)
		
		if (b > 0 && start < this.buckets[b - 1].start + 1)
			b -= 1
		
		while (true)
		{
			if (b >= this.buckets.length || this.buckets[b].start > end)
				break
			
			yield b
			b += 1
		}
	}
	
	
	get size(): number
	{
		return this.idMap.size
	}
	
	
	update(elem: T): ListOfRanges<T>
	{
		if (!this.idMap.get(elem.id))
			return this
		
		return this.upsert(elem)
	}
	
	
	upsert(elem: T): ListOfRanges<T>
	{
		//console.log("upsert id", elem.id, "buckets", this.bucketFn(elem.range.start), this.bucketFn(elem.range.end),)
		
		let newList = this._ensureBucketsAtRange(elem.range)
		newList = newList.removeById(elem.id, false)
		
		for (const b of newList._iterBucketIndicesAtRange(elem.range))
		{
			newList.buckets[b] = Object.assign({}, newList.buckets[b])
			
			const newElemIndex = BinarySearch.find(newList.buckets[b].elems, e => elem.range.start.compare(e.range.start))
			//console.log("- add to bucket", b, "at elem", newElemIndex)
			
			newList.buckets[b].elems =
			[
				...newList.buckets[b].elems.slice(0, newElemIndex),
				elem,
				...newList.buckets[b].elems.slice(newElemIndex)
			]
		}
		
		newList.idMap = newList.idMap.set(elem.id, elem)
		return newList
	}
	
	
	upsertMany(elems: T[]): ListOfRanges<T>
	{
		let newList: ListOfRanges<T> = this
		for (const elem of elems)
			newList = newList.upsert(elem)
		
		return newList
	}
	
	
	removeById(id: number, removeId: boolean = true): ListOfRanges<T>
	{
		let newList: ListOfRanges<T> = this
		
		const elem = this.idMap.get(id)
		if (elem)
		{
			newList = this.clone()
			newList.buckets = [ ...newList.buckets ]
			
			for (const b of newList._iterBucketIndicesAtRange(elem.range))
			{
				const elemIndex = BinarySearch.findExact(newList.buckets[b].elems, elem, b => elem.range.start.compare(b.range.start))
				
				if (elemIndex === null)
					continue
				
				//console.log("- remove from bucket", b, "at elem", elemIndex)
				
				newList.buckets[b] = Object.assign({}, newList.buckets[b])
				newList.buckets[b].elems =
				[
					...newList.buckets[b].elems.slice(0, elemIndex),
					...newList.buckets[b].elems.slice(elemIndex + 1)
				]
			}
		
			if (removeId)
				newList.idMap = newList.idMap.delete(id)
		}
		
		return newList
	}
	
	
	findById(id: number): T | undefined
	{
		return this.idMap.get(id)
	}
	
	
	*iterAll(): Generator<T, void, void>
	{
		for (const bucket of this.buckets)
		for (const elem of bucket.elems)
		{
			const elemStart = this.bucketFn(elem.range.start)
			if (elemStart >= bucket.start && elemStart < bucket.start + 1)
				yield elem
		}
	}
	
	
	*iterAtRange(range: Range): Generator<T, void, void>
	{
		let firstBucket = true
		
		for (const b of this._iterBucketIndicesAtRange(range))
		{
			const bucket = this.buckets[b]
			
			for (const elem of bucket.elems)
			{
				const elemStart = this.bucketFn(elem.range.start)
				if (range.overlapsRange(elem.range) &&
					(firstBucket || (elemStart >= bucket.start && elemStart < bucket.start + 1)))
					yield elem
			}
			
			firstBucket = false
		}
	}
	
	
	*iterAtPoint(point: Rational): Generator<T, void, void>
	{
		const range = Range.fromPoint(point, true, true)
		for (const item of this.iterAtRange(range))
			yield item
	}
	
	
	*iterActiveAtRangePairwise(range: Range): Generator<[T | null, T | null], void, void>
	{
		if (this.idMap.size == 0)
		{
			yield [ null, null ]
			return
		}

		let prevItem = this.findPrevious(range.start)
		
		while (true)
		{
			const nextItem = this.findNextNotEqual(prevItem?.range.end ?? range.start)

			yield [ prevItem, nextItem ]
			
			if (!nextItem)
				break

			prevItem = nextItem
		}
	}
	
	
	getTotalRange(): Range | null
	{
		let firstElem: T | null = null
		let lastElem: T | null = null
		
		for (const bucket of this.buckets)
		{
			if (bucket.elems.length > 0)
			{
				firstElem = bucket.elems[0]
				break
			}
		}
		
		for (let b = this.buckets.length - 1; b >= 0; b--)
		{
			for (const elem of this.buckets[b].elems)
			{
				if (!lastElem || elem.range.end.compare(lastElem.range.end) > 0)
					lastElem = elem
			}
			
			if (lastElem)
				break
		}
		
		if (!firstElem || !lastElem)
			return null
		
		return firstElem.range.merge(lastElem.range)
	}


	findFirst(): T | null
	{
		for (const elem of this.iterAll())
			return elem

		return null
	}


	findActiveAt(time: Rational): T | null
	{
		let result: T | null = null

		for (const elem of this.iterAll())
		{
			if (elem.range.start.compare(time) > 0)
				break

			result = elem
		}

		return result
	}
	
	
    findPreviousAnchor(fromPoint: Rational): Rational | null
	{
		let previous: Rational | null = null
		
		const end = this.bucketFn(fromPoint)
		const endB = Math.min(
			this.buckets.length - 1,
			BinarySearch.find(this.buckets, bucket => end - bucket.start))
		
		for (let b = endB; b >= 0; b--)
		{
			if (previous && this.bucketFn(previous) > this.buckets[b].start + 1)
				break
			
			for (const elem of this.buckets[b].elems)
			{
				if (elem.range.start.compare(fromPoint) < 0 &&
					(previous === null || elem.range.start.compare(previous) > 0))
					previous = elem.range.start
					
				if (elem.range.end.compare(fromPoint) < 0 &&
					(previous === null || elem.range.end.compare(previous) > 0))
					previous = elem.range.end
			}
		}
		
		return previous
	}
	
	
	findPrevious(fromPoint: Rational): T | null
	{
		let nearestItem: T | null = null
		let nearestPoint: Rational | null = null
		
		for (const item of this.iterAll())
		{
			const itemRange = item.range
			
			if (itemRange.end.compare(fromPoint) > 0)
				continue
			
			if (nearestPoint == null || itemRange.end.compare(nearestPoint) > 0)
			{
				nearestItem = item
				nearestPoint = itemRange.end
			}
		}
		
		return nearestItem
	}
	
	
	findPreviousDeletionAnchor(fromPoint: Rational): Rational | null
	{
		const anchor = this.findPrevious(fromPoint)
		if (!anchor)
			return null
		
		const anchorRange = anchor.range
		
		if (anchorRange.end.compare(fromPoint) != 0)
			return anchorRange.end
		
		let nearestPoint = anchorRange.start
		
		for (const item of this.iterAll())
		{
			const itemRange = item.range
			
			if (itemRange.end.compare(anchorRange.end) != 0)
				continue
			
			if (itemRange.start.compare(nearestPoint) > 0)
				nearestPoint = itemRange.start
		}
		
		return nearestPoint
	}
	
	
	findNextNotEqual(fromPoint: Rational): T | null
	{
		let nearestItem: T | null = null
		let nearestPoint: Rational | null= null
		
		for (const item of this.iterAll())
		{
			const itemRange = item.range
			
			if (itemRange.end.compare(fromPoint) <= 0)
				continue
			
			if (nearestPoint == null || itemRange.end.compare(nearestPoint) < 0)
			{
				nearestItem = item
				nearestPoint = itemRange.end
			}
		}
		
		return nearestItem
    }
    
    
    static test()
    {
        let list = new ListOfRanges<Element>()
        
        assert.deepEqual([ ...list.iterAll() ], [])
        assert.deepEqual(list.getTotalRange(), null)
        
        const elem1 = { id: 1, range: new Range(new Rational(2, 4), new Rational(6, 4)) }
        const elem2 = { id: 2, range: new Range(new Rational(0, 4), new Rational(3, 4)) }
        const elem3 = { id: 3, range: new Range(new Rational(-3, 4), new Rational(11, 4)) }
        const elem4 = { id: 4, range: new Range(new Rational(12, 4), new Rational(16, 4)) }
        const elem5 = { id: 5, range: new Range(new Rational(5, 4), new Rational(13, 4)) }
        
        const elem1_2 = { id: 1, range: new Range(new Rational(6, 4), new Rational(11, 4)) }
        
        list = list.upsert(elem1)
        assert.deepEqual([ ...list.iterAll() ], [ elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem1.range) ], [ elem1 ])
        assert.deepEqual(list.getTotalRange(), elem1.range)
        
        list = list.upsert(elem2)
        assert.deepEqual([ ...list.iterAll() ], [ elem2, elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem1.range) ], [ elem2, elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem2.range) ], [ elem2, elem1 ])
        assert.deepEqual(list.getTotalRange(), elem2.range.merge(elem1.range))
        
        list = list.upsert(elem3)
        assert.deepEqual([ ...list.iterAll() ], [ elem3, elem2, elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem1.range) ], [ elem3, elem2, elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem2.range) ], [ elem3, elem2, elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem3.range) ], [ elem3, elem2, elem1 ])
        assert.deepEqual(list.getTotalRange(), elem3.range.merge(elem1.range))
        
        list = list.upsert(elem4)
        assert.deepEqual([ ...list.iterAll() ], [ elem3, elem2, elem1, elem4 ])
        assert.deepEqual([ ...list.iterAtRange(elem1.range) ], [ elem3, elem2, elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem2.range) ], [ elem3, elem2, elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem3.range) ], [ elem3, elem2, elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem4.range) ], [ elem4 ])
        assert.deepEqual(list.getTotalRange(), elem3.range.merge(elem4.range))
        
        list = list.upsert(elem5)
        assert.deepEqual([ ...list.iterAll() ], [ elem3, elem2, elem1, elem5, elem4 ])
        assert.deepEqual([ ...list.iterAtRange(elem1.range) ], [ elem3, elem2, elem1, elem5 ])
        assert.deepEqual([ ...list.iterAtRange(elem2.range) ], [ elem3, elem2, elem1 ])
        assert.deepEqual([ ...list.iterAtRange(elem3.range) ], [ elem3, elem2, elem1, elem5 ])
        assert.deepEqual([ ...list.iterAtRange(elem4.range) ], [ elem5, elem4 ])
        assert.deepEqual([ ...list.iterAtRange(elem5.range) ], [ elem3, elem1, elem5, elem4 ])
        assert.deepEqual(list.getTotalRange(), elem3.range.merge(elem4.range))
        
        list = list.upsert(elem1_2)
        assert.deepEqual([ ...list.iterAll() ], [ elem3, elem2, elem5, elem1_2, elem4 ])
        assert.deepEqual([ ...list.iterAtRange(elem1.range) ], [ elem3, elem2, elem5 ])
        assert.deepEqual([ ...list.iterAtRange(elem2.range) ], [ elem3, elem2 ])
        assert.deepEqual([ ...list.iterAtRange(elem3.range) ], [ elem3, elem2, elem5, elem1_2 ])
        assert.deepEqual([ ...list.iterAtRange(elem4.range) ], [ elem5, elem4 ])
        assert.deepEqual([ ...list.iterAtRange(elem5.range) ], [ elem3, elem5, elem1_2, elem4 ])
        assert.deepEqual([ ...list.iterAtRange(elem1_2.range) ], [ elem3, elem5, elem1_2 ])
        assert.deepEqual(list.getTotalRange(), elem3.range.merge(elem4.range))
        
        console.log("ListOfRanges tests passed")
    }
}