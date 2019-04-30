export class ListOfRanges
{
	constructor(getRangeFn)
	{
		this.items = []
		this.getRangeFn = getRangeFn
	}
	
	
	clonedWithItems(items)
	{
		let list = new ListOfRanges(this.getRangeFn)
		list.items = items
		list.sort()
		return list
	}
	
	
	clear()
	{
		return this.clonedWithItems([])
	}
	
	
	get length()
	{
		return this.items.length
	}
	
	
	add(item)
	{
		return this.clonedWithItems([ ...this.items, item ])
	}
	
	
	addArray(items)
	{
		return this.clonedWithItems([ ...this.items, ...items ])
	}
	
	
	removeById(id)
	{
		return this.remove(item => item.id == id)
	}
	
	
	remove(predicate)
	{
		const index = this.items.findIndex(predicate)
		if (index < 0)
			return this
		
		return this.clonedWithItems([ ...this.items.slice(0, index), ...this.items.slice(index + 1) ])
	}
	
	
	findById(id)
	{
		return this.items.find(item => item.id == id)
	}
	
	
	sort()
	{
		this.items.sort((a, b) =>
		{
			return this.getRangeFn(a).start.compare(this.getRangeFn(b).start);
		})
	}
	
	
	*enumerate()
	{
		for (let i = 0; i < this.items.length; i++)
			yield this.items[i]
	}
	
	
	*enumerateOverlappingPoint(point)
	{
		for (let i = 0; i < this.items.length; i++)
		{
			let item = this.items[i]
			let itemRange = this.getRangeFn(item)
			
			if (itemRange.overlapsPoint(point))
				yield item
		}
	}
	
	
	*enumerateOverlappingRange(range)
	{
		for (let i = 0; i < this.items.length; i++)
		{
			let item = this.items[i]
			let itemRange = this.getRangeFn(item)
			
			if (itemRange.overlapsRange(range))
				yield item
		}
	}
	
	
	*enumerateAffectingRange(range)
	{
		yield this.findActiveAt(range.start)
		
		for (let i = 0; i < this.items.length; i++)
		{
			let item = this.items[i]
			let itemRange = this.getRangeFn(item)
			
			if (itemRange.overlapsRange(range))
				yield item
		}
	}
	
	
	*enumerateAffectingRangePairwise(range)
	{
		let prevItem = this.findActiveAt(range.start)
		
		for (let i = 0; i < this.items.length; i++)
		{
			let item = this.items[i]
			let itemRange = this.getRangeFn(item)
			
			if (itemRange.overlapsRange(range))
			{
				yield [prevItem, item]
				prevItem = item
			}
		}
		
		yield [prevItem, null]
	}
	
	
	findAt(point)
	{
		for (let i = 0; i < this.items.length; i++)
		{
			let item = this.items[i]
			let itemRange = this.getRangeFn(item)
			
			if (itemRange.end.compare(point) == 0)
				return item
		}
		
		return null
	}
	
	
	findActiveAt(point)
	{
		let nearestItem = null
		let nearestPoint = null
		
		for (let i = 0; i < this.items.length; i++)
		{
			let item = this.items[i]
			let itemRange = this.getRangeFn(item)
			
			if (itemRange.end.compare(point) > 0)
				continue
			
			if (nearestPoint == null || itemRange.end.compare(nearestPoint) > 0)
			{
				nearestItem = item
				nearestPoint = itemRange.end
			}
		}
		
		return nearestItem
	}
	
	
	findPrevious(fromPoint)
	{
		let nearestItem = null
		let nearestPoint = null
		
		for (let i = 0; i < this.items.length; i++)
		{
			let item = this.items[i]
			let itemRange = this.getRangeFn(item)
			
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
		
		const anchorRange = this.getRangeFn(anchor)
		
		if (anchorRange.end.compare(fromPoint) != 0)
			return anchorRange.end
		
		let nearestPoint = anchorRange.start
		
		for (let i = 0; i < this.items.length; i++)
		{
			let item = this.items[i]
			let itemRange = this.getRangeFn(item)
			
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
		
		for (let i = 0; i < this.items.length; i++)
		{
			let item = this.items[i]
			let itemRange = this.getRangeFn(item)
			
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