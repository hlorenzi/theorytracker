export default class Rect
{
    x: number
    y: number
    w: number
    h: number


	constructor(x: number, y: number, w: number, h: number)
	{
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}
	
	
	static fromVertices(x1: number, y1: number, x2: number, y2: number): Rect
	{
		return new Rect(
			Math.min(x1, x2),
			Math.min(y1, y2),
			Math.abs(x2 - x1),
			Math.abs(y2 - y1))
	}


	static fromElement(elem: HTMLElement)
	{
		const clientRect = elem.getBoundingClientRect()
		return new Rect(
			clientRect.left,
			clientRect.top,
			clientRect.width,
			clientRect.height)
	}


	clone(): Rect
	{
		return new Rect(this.x, this.y, this.w, this.h)
	}
	
	
	get x1(): number
	{
		return this.x
	}
	
	
	get y1(): number
	{
		return this.y
	}
	
	
	get x2(): number
	{
		return this.x + this.w
	}
	
	
	get y2(): number
	{
		return this.y + this.h
	}
	
	
	get xCenter(): number
	{
		return (this.x1 + this.x2) / 2
	}
	
	
	get yCenter(): number
	{
		return (this.y1 + this.y2) / 2
	}


	withX(value: number): Rect
	{
		return new Rect(value, this.y, this.w, this.h)
	}


	withY(value: number): Rect
	{
		return new Rect(this.x, value, this.w, this.h)
	}


	withW(value: number): Rect
	{
		return new Rect(this.x, this.y, value, this.h)
	}


	withH(value: number): Rect
	{
		return new Rect(this.x, this.y, this.w, value)
	}


	withX1(value: number): Rect
	{
		return Rect.fromVertices(value, this.y1, this.x2, this.y2)
	}


	withY1(value: number): Rect
	{
		return Rect.fromVertices(this.x1, value, this.x2, this.y2)
	}


	withX2(value: number): Rect
	{
		return Rect.fromVertices(this.x1, this.y1, value, this.y2)
	}


	withY2(value: number): Rect
	{
		return Rect.fromVertices(this.x1, this.y1, this.x2, value)
	}


	displace(x: number, y: number): Rect
	{
		return new Rect(this.x + x, this.y + y, this.w, this.h)
	}


	expand(amount: number): Rect
	{
		return Rect.fromVertices(
			this.x1 - amount,
			this.y1 - amount,
			this.x2 + amount,
			this.y2 + amount)
	}


	expandW(amount: number): Rect
	{
		return Rect.fromVertices(
			this.x1 - amount,
			this.y1,
			this.x2 + amount,
			this.y2)
	}
	
	
	contains(p: { x: number, y: number }): boolean
	{
		return p.x >= this.x &&
			p.x < this.x2 &&
			p.y >= this.y &&
			p.y < this.y2
	}
	
	
	overlaps(other: Rect): boolean
	{
		return this.x2 >= other.x &&
			this.x < other.x2 &&
			this.y2 >= other.y &&
			this.y < other.y2
	}
}