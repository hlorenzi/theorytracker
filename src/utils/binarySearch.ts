type CompareFn<T> = (value: T) => number


export default class BinarySearch
{
    static find<T>(array: T[], compareFn: CompareFn<T>): number
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
            
            if (compareFn(array[mi]) <= 0) 
                hi = mi
            else
                lo = mi
        }
        
        return hi
    }


    static findExact<T>(array: T[], value: T, compareFn: CompareFn<T>): number | null
    {
        let i = BinarySearch.find(array, compareFn)
        
        while (i < array.length)
        {
            if (array[i] === value)
                return i
            
            i += 1
        }
        
        return null
    }
        
        
    static findPreviousOrEqual<T>(array: T[], compareFn: CompareFn<T>): number | null
    {
        if (array.length == 0)
            return null
        
        const i = BinarySearch.find(array, compareFn)
        
        if (i < array.length && compareFn(array[i]) == 0)
            return i
            
        if (i > 0)
            return i - 1
        
        return null
    }
        
        
    static findPreviousNotEqual<T>(array: T[], compareFn: CompareFn<T>): number | null
    {
        if (array.length == 0)
            return null
        
        const i = BinarySearch.find(array, compareFn)
        
        if (i > 0)
            return i - 1
        
        return null
    }
        
        
    static findNextNotEqual<T>(array: T[], compareFn: CompareFn<T>): number | null
    {
        if (array.length == 0)
            return null
        
        let i = BinarySearch.find(array, compareFn)
        
        while (i < array.length)
        {
            if (compareFn(array[i]) != 0)
                break
            
            i += 1
        }
        
        if (i < array.length)
            return i
        
        return null
    }
        
        
    static *iterEqual<T>(array: T[], compareFn: CompareFn<T>): Generator<number, void, void>
    {
        let i = BinarySearch.find(array, compareFn)
        
        while (i < array.length)
        {
            if (compareFn(array[i]) != 0)
                break
            
            yield i
            i += 1
        }
    }
}