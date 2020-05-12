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