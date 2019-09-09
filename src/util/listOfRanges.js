import { Rational } from "./rational.js"
import { Range } from "./range.js"
import BinarySearch from "./binarySearch.js"
import { default as Immutable } from "immutable"
import assert from "assert"


export class ListOfRanges
{
	constructor()
	{
		this.idMap = new Immutable.Map()
		this.buckets = []
		this.bucketFn = (t) => t.asFloat()
	}
	
	
	clone()
	{
		let cloned = new ListOfRanges()
		cloned.idMap = this.idMap
		cloned.buckets = this.buckets
		cloned.bucketFn = this.bucketFn
		return cloned
	}
	
	
	clear()
	{
		return Object.assign(new ListOfRanges(), { bucketFn: this.bucketFn })
	}
	
	
	_ensureBucketsAtRange(range)
	{
		let newBuckets = [ ...this.buckets ]
		
		if (this.buckets.length == 0)
			newBuckets = [ { start: 0, elems: [] } ]
		
		const start = this.bucketFn(range.start)
		while (start < newBuckets[0].start)
		{
			const newBucket =
			{
				start: newBuckets[0].start - 1,
				elems: [],
			}
			
			newBuckets = [ newBucket, ...newBuckets ]
		}
		
		const end = this.bucketFn(range.end)
		while (end > newBuckets[newBuckets.length - 1].start + 1)
		{
			const newBucket =
			{
				start: newBuckets[newBuckets.length - 1].start + 1,
				elems: [],
			}
			
			newBuckets = [ ...newBuckets, newBucket ]
		}
		
		const cloned = this.clone()
		cloned.buckets = newBuckets
		return cloned
	}
	
	
	*_iterBucketIndicesAtRange(range)
	{
		const start = this.bucketFn(range.start)
		const end = this.bucketFn(range.end)
		
		let b = BinarySearch.find(this.buckets, start, (value, bucket) => value - bucket.start)
		
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
	
	
	get size()
	{
		return this.idMap.size
	}
	
	
	add(elem)
	{
		return this.upsert(elem)
	}
	
	
	addMany(elems)
	{
		let newList = this
		for (const elem of elems)
			newList = newList.add(elem)
		
		return newList
	}
	
	
	upsert(elem)
	{
		//console.log("upsert id", elem.id, "buckets", this.bucketFn(elem.range.start), this.bucketFn(elem.range.end),)
		
		let newList = this._ensureBucketsAtRange(elem.range)
		newList = newList.removeById(elem.id, false)
		
		for (const b of newList._iterBucketIndicesAtRange(elem.range))
		{
			newList.buckets[b] = Object.assign({}, newList.buckets[b])
			
			const newElemIndex = BinarySearch.find(newList.buckets[b].elems, elem, (a, b) => a.range.start.compare(b.range.start))
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
	
	
	removeById(id, removeId = true)
	{
		let newList = this
		
		const elem = this.idMap.get(id)
		if (elem)
		{
			newList = this.clone()
			newList.buckets = [ ...newList.buckets ]
			
			for (const b of newList._iterBucketIndicesAtRange(elem.range))
			{
				const elemIndex = BinarySearch.findExact(newList.buckets[b].elems, elem, (a, b) => a.range.start.compare(b.range.start))
				
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
	
	
	findById(id)
	{
		return this.idMap.get(id)
	}
	
	
	*iterAll()
	{
		for (const bucket of this.buckets)
		for (const elem of bucket.elems)
		{
			const elemStart = this.bucketFn(elem.range.start)
			if (elemStart >= bucket.start && elemStart < bucket.start + 1)
				yield elem
		}
	}
	
	
	*iterAtRange(range)
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
	
	
	getTotalRange()
	{
		let firstElem = null
		let lastElem = null
		
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
	
	
	findPrevious(fromPoint)
	{
		let nearestItem = null
		let nearestPoint = null
		
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
	
	
	findPreviousDeletionAnchor(fromPoint)
	{
		const anchor = this.findPrevious(fromPoint)
		if (anchor == null)
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
	
	
	findNextNotEqual(fromPoint)
	{
		let nearestItem = null
		let nearestPoint = null
		
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
}


export function test()
{
	let list = new ListOfRanges()
	
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


export default ListOfRanges