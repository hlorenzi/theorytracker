export class BinaryWriter
{
    bytes: number[]
    head: number


	constructor()
	{
		this.bytes = []
		this.head = 0
	}
	
	
	getBytes()
	{
		return this.bytes
	}
	
	
	getLength()
	{
		return this.bytes.length
	}
	
	
	seek(index: number)
	{
		while (index > this.bytes.length)
			this.bytes.push(0)
		
		this.head = index
	}
	
	
	writeByte(b: number)
	{
		this.bytes[this.head] = (b & 0xff)
		this.head += 1
	}
	
	
	writeSByte(b: number)
	{
		if (b >= 0)
			this.writeByte(b)
		else
			this.writeByte(0x100 + b)
	}
	
	
	writeBytes(bytes: number[])
	{
		for (let i = 0; i < bytes.length; i++)
			this.writeByte(bytes[i])
	}
	
	
	writeUInt16BE(x: number)
	{
		this.writeByte(x >> 8)
		this.writeByte(x >> 0)
	}
	
	
	writeUInt24BE(x: number)
	{
		this.writeByte(x >> 16)
		this.writeByte(x >>  8)
		this.writeByte(x >>  0)
	}
	
	
	writeUInt32BE(x: number)
	{
		this.writeByte(x >> 24)
		this.writeByte(x >> 16)
		this.writeByte(x >>  8)
		this.writeByte(x >>  0)
	}
	
	
	writeInt16BE(x: number)
	{
		if (x >= 0)
			this.writeUInt16BE(x)
		else
			this.writeUInt16BE(0x10000 + x)
	}
	
	
	writeInt32BE(x: number)
	{
		if (x >= 0)
			this.writeUInt32BE(x)
		else
			this.writeUInt32BE(0x100000000 + x)
	}
	
	
	writeFloat32(x: number)
	{
		let view = new DataView(new ArrayBuffer(4))
		view.setFloat32(0, x)
		this.writeByte(view.getUint8(0))
		this.writeByte(view.getUint8(1))
		this.writeByte(view.getUint8(2))
		this.writeByte(view.getUint8(3))
	}
	
	
	writeAsciiLength(str: string, length: number)
	{
		for (let i = 0; i < Math.min(str.length, length); i++)
			this.writeByte(str.charCodeAt(i))
		
		for (let i = str.length; i < length; i++)
			this.writeByte(0)
	}
	
	
	writeAscii(str: string)
	{
		for (let i = 0; i < str.length; i++)
			this.writeByte(str.charCodeAt(i))
	}
}