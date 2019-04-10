export class Rect
{
	constructor(x, y, w, h)
	{
		this.x = x
		this.y = y
		this.w = w
		this.h = h
	}
	
	
	static fromVertices(x1, y1, x2, y2)
	{
		return new Rect(
			Math.min(x1, x2),
			Math.min(y1, y2),
			Math.abs(x2 - x1),
			Math.abs(y2 - y1))
	}
	
	
	contains(p)
	{
		return p.x >= this.x &&
			p.x < this.x + this.w &&
			p.y >= this.y &&
			p.y < this.y + this.h
	}
	
	
	overlaps(other)
	{
		return this.x + this.w >= other.x &&
			this.x < other.x + other.w &&
			this.y + this.h >= other.y &&
			this.y < other.y + other.h
	}
}