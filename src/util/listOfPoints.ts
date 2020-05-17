import Rational from "./rational"
import Range from "./range"
import BinarySearch from "./binarySearch"
import Immutable from "immutable"
import assert from "assert"


interface Element
{
    id: number
    time: Rational
}


export default class ListOfPoints<T extends Element>
{
    idMap: Immutable.Map<number, T>
    elems: T[]


	constructor()
	{
		this.idMap = Immutable.Map<number, T>()
		this.elems = []
	}
	
	
	clone(): ListOfPoints<T>
	{
		let cloned = new ListOfPoints<T>()
		cloned.idMap = this.idMap
		cloned.elems = this.elems
		return cloned
	}
	
	
	clear(): ListOfPoints<T>
	{
		return new ListOfPoints<T>()
	}
	
	
	get size(): number
	{
		return this.idMap.size
	}
	
	
	add(elem: T): ListOfPoints<T>
	{
		return this.upsert(elem)
	}
	
	
	addMany(elems: T[]): ListOfPoints<T>
	{
		let newList: ListOfPoints<T> = this
		for (const elem of elems)
			newList = newList.add(elem)
		
		return newList
	}
	
	
	update(elem: T): ListOfPoints<T>
	{
		if (!this.idMap.get(elem.id))
			return this
		
		return this.upsert(elem)
	}
	
	
	upsert(elem: T): ListOfPoints<T>
	{
		//console.log("upsert id", elem.id)
		
		let newList = this.clone()
		newList = newList.removeById(elem.id)
			
		const newElemIndex = BinarySearch.find(newList.elems, b => elem.time.compare(b.time))
		//console.log("- add at elem", newElemIndex)
			
		newList.elems =
		[
			...newList.elems.slice(0, newElemIndex),
			elem,
			...newList.elems.slice(newElemIndex)
		]
		
		newList.idMap = newList.idMap.set(elem.id, elem)
		return newList
	}
	
	
	removeById(id: number): ListOfPoints<T>
	{
		let newList: ListOfPoints<T> = this
		
		const elem = this.idMap.get(id)
		if (elem)
		{
			const elemIndex = BinarySearch.findExact(newList.elems, elem, b => elem.time.compare(b.time))
			
			if (elemIndex !== null)
			{
				newList = this.clone()
				
				//console.log("- remove at elem", elemIndex)
				
				newList.elems =
				[
					...newList.elems.slice(0, elemIndex),
					...newList.elems.slice(elemIndex + 1)
				]
				
				newList.idMap = newList.idMap.delete(id)
			}
		}
		
		return newList
	}
	
	
	findById(id: number): T | undefined
	{
		return this.idMap.get(id)
	}
	
	
	findFirst(): T | null
	{
		if (this.elems.length > 0)
			return this.elems[0]

		return null
	}
	
	
	getTotalRange(): Range | null
	{
		if (this.elems.length == 0)
			return null
		
		return Range.fromPoint(this.elems[0].time).merge(Range.fromPoint(this.elems[this.elems.length - 1].time))
	}
	
	
	*iterAll(): Generator<T, void, void>
	{
		for (let i = 0; i < this.elems.length; i++)
			yield this.elems[i]
	}
	
	
	*iterAt(point: Rational): Generator<T, void, void>
	{
		for (const i of BinarySearch.iterEqual(this.elems, b => point.compare(b.time)))
			yield this.elems[i]
	}
	
	
	*iterAtRange(range: Range): Generator<T, void, void>
	{
		let i = BinarySearch.find(this.elems, b => range.start.compare(b.time))
		
		while (i < this.elems.length)
		{
			if (range.end.compare(this.elems[i].time) <= 0)
				break
			
			if (range.overlapsPoint(this.elems[i].time))
				yield this.elems[i]
			
			i += 1
		}
	}
	
	
	*iterActiveAtRangePairwise(range: Range): Generator<[T | null, T | null], void, void>
	{
		if (this.elems.length == 0)
		{
			yield [ null, null ]
			return
		}
		
		let i = BinarySearch.findPreviousOrEqual(this.elems, b => range.start.compare(b.time))
		let prevItem = (i === null ? null : this.elems[i])
		//console.log("iterActiveAtRangePairwise", i, prevItem)
		
		if (i === null)
			i = -1
		
		while (true)
		{
			i += 1
			while (i < this.elems.length && prevItem && this.elems[i].time.compare(prevItem.time) == 0)
				i += 1
			
			if (i >= this.elems.length)
				break
			
			yield [ prevItem, this.elems[i] ]
			
			prevItem = this.elems[i]
			
			if (!range.overlapsPoint(this.elems[i].time))
				return
		}
		
		yield [ prevItem, null ]
	}
	
	
	findAt(point: Rational): T | null
	{
		for (const elem of this.iterAt(point))
			return elem
		
		return null
	}
	
	
	findActiveAt(point: Rational): T | null
	{
		const i = BinarySearch.findPreviousOrEqual(this.elems, b => point.compare(b.time))
		if (i === null)
			return null
		
		return this.elems[i]
	}
	
	
	findPreviousAnchor(fromPoint: Rational): Rational | null
	{
		const i = BinarySearch.findPreviousNotEqual(this.elems, b => fromPoint.compare(b.time))
		if (i === null)
			return null
		
		return this.elems[i].time
	}
	
	
	findPreviousDeletionAnchor(point: Rational): Rational | null
	{
		const elem = this.findActiveAt(point)
		if (elem === null)
			return null
		
		return elem.time
	}
	
	
	findNextNotEqual(fromPoint: Rational): T | null
	{
		const i = BinarySearch.findNextNotEqual(this.elems, b => fromPoint.compare(b.time))
		if (i === null)
			return null
		
		return this.elems[i]
    }
    

    static test()
    {
        let list = new ListOfPoints()
        
        const elem1 = { id: 1, time: new Rational(0) }
        const elem2 = { id: 2, time: new Rational(1) }
        const elem3 = { id: 3, time: new Rational(2) }
        const elem4 = { id: 4, time: new Rational(4) }
        const elem5 = { id: 5, time: new Rational(5) }
        
        const elem1_2 = { id: 1, time: new Rational(3) }
        
        const range1 = new Range(new Rational(0), new Rational(0), true, false)
        const range2 = new Range(new Rational(0), new Rational(1), true, false)
        const range3 = new Range(new Rational(0), new Rational(5), true, false)
        const range4 = new Range(new Rational(-1), new Rational(6), true, false)
        const range5 = new Range(new Rational(0), new Rational(5, 2), true, false)
        
        assert.deepEqual([ ...list.iterAll() ], [])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range2) ], [ [ null, null ] ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range3) ], [ [ null, null ] ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range4) ], [ [ null, null ] ])
        assert.deepEqual(list.getTotalRange(), null)
        
        list = list.upsert(elem1)
        assert.deepEqual([ ...list.iterAll() ], [ elem1 ])
        assert.deepEqual([ ...list.iterAt(elem1.time) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAt(elem2.time) ], [])
        assert.deepEqual([ ...list.iterAtRange(range1) ], [])
        assert.deepEqual([ ...list.iterAtRange(range2) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAtRange(range5) ], [ elem1 ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range2) ], [ [ elem1, null ] ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range3) ], [ [ elem1, null ] ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range4) ], [ [ null, elem1 ], [ elem1, null ] ])
        assert.deepEqual(list.getTotalRange(), new Range(elem1.time, elem1.time, true, false))
        
        list = list.upsert(elem2)
        assert.deepEqual([ ...list.iterAll() ], [ elem1, elem2 ])
        assert.deepEqual([ ...list.iterAt(elem1.time) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAt(elem2.time) ], [ elem2 ])
        assert.deepEqual([ ...list.iterAtRange(range2) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAtRange(range3) ], [ elem1, elem2 ])
        assert.deepEqual([ ...list.iterAtRange(range5) ], [ elem1, elem2 ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range2) ], [ [ elem1, elem2 ] ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range3) ], [ [ elem1, elem2 ], [ elem2, null ] ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range4) ], [ [ null, elem1 ], [ elem1, elem2 ], [ elem2, null ] ])
        assert.deepEqual(list.getTotalRange(), new Range(elem1.time, elem2.time, true, false))
        
        list = list.upsert(elem4)
        assert.deepEqual([ ...list.iterAll() ], [ elem1, elem2, elem4 ])
        assert.deepEqual([ ...list.iterAt(elem1.time) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAt(elem2.time) ], [ elem2 ])
        assert.deepEqual([ ...list.iterAt(elem4.time) ], [ elem4 ])
        assert.deepEqual([ ...list.iterAtRange(range2) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAtRange(range3) ], [ elem1, elem2, elem4 ])
        assert.deepEqual(list.getTotalRange(), new Range(elem1.time, elem4.time, true, false))
        
        list = list.upsert(elem3)
        assert.deepEqual([ ...list.iterAll() ], [ elem1, elem2, elem3, elem4 ])
        assert.deepEqual([ ...list.iterAt(elem1.time) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAt(elem2.time) ], [ elem2 ])
        assert.deepEqual([ ...list.iterAt(elem3.time) ], [ elem3 ])
        assert.deepEqual([ ...list.iterAt(elem4.time) ], [ elem4 ])
        assert.deepEqual([ ...list.iterAtRange(range2) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAtRange(range3) ], [ elem1, elem2, elem3, elem4 ])
        assert.deepEqual(list.getTotalRange(), new Range(elem1.time, elem4.time, true, false))
        
        list = list.upsert(elem5)
        assert.deepEqual([ ...list.iterAll() ], [ elem1, elem2, elem3, elem4, elem5 ])
        assert.deepEqual([ ...list.iterAt(elem1.time) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAt(elem2.time) ], [ elem2 ])
        assert.deepEqual([ ...list.iterAt(elem3.time) ], [ elem3 ])
        assert.deepEqual([ ...list.iterAt(elem4.time) ], [ elem4 ])
        assert.deepEqual([ ...list.iterAt(elem5.time) ], [ elem5 ])
        assert.deepEqual([ ...list.iterAtRange(range2) ], [ elem1 ])
        assert.deepEqual([ ...list.iterAtRange(range3) ], [ elem1, elem2, elem3, elem4 ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range3) ], [ [ elem1, elem2 ], [ elem2, elem3 ], [ elem3, elem4 ], [ elem4, elem5 ] ])
        assert.deepEqual([ ...list.iterActiveAtRangePairwise(range4) ], [ [ null, elem1 ], [ elem1, elem2 ], [ elem2, elem3 ], [ elem3, elem4 ], [ elem4, elem5 ], [ elem5, null ] ])
        assert.deepEqual(list.getTotalRange(), new Range(elem1.time, elem5.time, true, false))
        
        list = list.upsert(elem1_2)
        assert.deepEqual([ ...list.iterAll() ], [ elem2, elem3, elem1_2, elem4, elem5 ])
        assert.deepEqual([ ...list.iterAt(elem1.time) ], [])
        assert.deepEqual([ ...list.iterAt(elem2.time) ], [ elem2 ])
        assert.deepEqual([ ...list.iterAt(elem3.time) ], [ elem3 ])
        assert.deepEqual([ ...list.iterAt(elem4.time) ], [ elem4 ])
        assert.deepEqual([ ...list.iterAt(elem5.time) ], [ elem5 ])
        assert.deepEqual([ ...list.iterAt(elem1_2.time) ], [ elem1_2 ])
        assert.deepEqual([ ...list.iterAtRange(range2) ], [])
        assert.deepEqual([ ...list.iterAtRange(range3) ], [ elem2, elem3, elem1_2, elem4 ])
        assert.deepEqual(list.getTotalRange(), new Range(elem2.time, elem5.time, true, false))
        
        console.log("ListOfPoints tests passed")
    }
}