export function find(array, value, compareFn)
{
	/*for (let i = 0; i < array.length; i++)
	{
		const comparison = compareFn(value, array[i])
		
		if (comparison <= 0)
			return i
	}
	
	return array.length*/
	
	let lo = -1
	let hi = array.length
	while (1 + lo < hi)
	{
		const mi = lo + ((hi - lo) >> 1)
		
		if (compareFn(value, array[mi]) <= 0) 
			hi = mi
		else
			lo = mi
	}
	
	return hi
}


export function findExact(array, value, compareFn)
{
	let i = find(array, value, compareFn)
	
	while (i < array.length)
	{
		if (array[i] === value)
			return i
		
		i += 1
	}
	
	return null
}
	
	
export function findPreviousOrEqual(array, value, compareFn)
{
	if (array.length == 0)
		return null
	
	const i = find(array, value, compareFn)
	
	if (i < array.length && compareFn(value, array[i]) == 0)
		return i
		
	if (i > 0)
		return i - 1
	
	return null
}
	
	
export function findPreviousNotEqual(array, value, compareFn)
{
	if (array.length == 0)
		return null
	
	const i = find(array, value, compareFn)
	
	if (i > 0)
		return i - 1
	
	return null
}
	
	
export function findNextNotEqual(array, value, compareFn)
{
	if (array.length == 0)
		return null
	
	const i = find(array, value, compareFn)
	
	while (i < array.length)
	{
		if (compareFn(value, array[i]) != 0)
			break
		
		i += 1
	}
	
	if (i < array.length)
		return i
	
	return null
}
	
	
export function *iterEqual(array, value, compareFn)
{
	let i = find(array, value, compareFn)
	
	while (i < array.length)
	{
		if (compareFn(value, array[i]) != 0)
			break
		
		yield i
		i += 1
	}
}


export default
{
	find,
	findExact,
	findPreviousOrEqual,
	findPreviousNotEqual,
	findNextNotEqual,
	iterEqual,
}