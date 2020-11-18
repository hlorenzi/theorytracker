export class BinaryReader
{
    bytes: number[] | Buffer | Uint8Array
    head: number


	constructor(bytes: number[] | Buffer | Uint8Array)
	{
		this.bytes = bytes
		this.head = 0
	}
	
	
	dumpNextBytes(n = 100)
	{
		console.log(this.bytes.slice(this.head, this.head + n))
	}
	
	
	getLength(): number
	{
		return this.bytes.length
	}
	
	
	getPosition(): number
	{
		return this.head
	}
	
	
	seek(index: number)
	{
		this.head = index
	}
	
	
	peekByte(): number
	{
		return this.bytes[this.head]
	}
	
	
	readByte(): number
	{
		let b = this.bytes[this.head]
		this.head += 1
		return b
	}
	
	
	readSByte(): number
	{
		let x = this.readByte()
		if ((x & 0x80) == 0)
			return x
		
		return -(0x100 - x)
	}
	
	
	readBytes(length: number): number[]
	{
		let arr = []
		for (let i = 0; i < length; i++)
			arr.push(this.readByte())
		
		return arr
	}
	
	
	readUInt16BE(): number
	{
		let b0 = this.readByte()
		let b1 = this.readByte()
		
		let result = (b0 << 8) | b1
		
		if (result < 0)
			return 0x10000 + result
		else
			return result
	}
	
	
	readUInt16LE(): number
	{
		let b1 = this.readByte()
		let b0 = this.readByte()
		
		let result = (b0 << 8) | b1
		
		if (result < 0)
			return 0x10000 + result
		else
			return result
	}
	
	
	readUInt16sBE(length: number): number[]
	{
		let arr = []
		for (let i = 0; i < length; i++)
			arr.push(this.readUInt16BE())
		
		return arr
	}
	
	
	readUInt24BE(): number
	{
		let b0 = this.readByte()
		let b1 = this.readByte()
		let b2 = this.readByte()
		
		let result = (b0 << 16) | (b1 << 8) | b2
		
		if (result < 0)
			return 0x1000000 + result
		else
			return result
	}
	
	
	readUInt32BE(): number
	{
		let b0 = this.readByte()
		let b1 = this.readByte()
		let b2 = this.readByte()
		let b3 = this.readByte()
		
		let result = (b0 << 24) | (b1 << 16) | (b2 << 8) | b3
		
		if (result < 0)
			return 0x100000000 + result
		else
			return result
	}
	
	
	readUInt32LE(): number
	{
		let b3 = this.readByte()
		let b2 = this.readByte()
		let b1 = this.readByte()
		let b0 = this.readByte()
		
		let result = (b0 << 24) | (b1 << 16) | (b2 << 8) | b3
		
		if (result < 0)
			return 0x100000000 + result
		else
			return result
	}
	
	
	readInt16BE(): number
	{
		let x = this.readUInt16BE()
		if ((x & 0x8000) == 0)
			return x
		
		return -(0x10000 - x)
	}
	
	
	readInt32BE(): number
	{
		let x = this.readUInt32BE()
		if ((x & 0x80000000) == 0)
			return x
		
		return -(0x100000000 - x)
	}
	
	
	readFloat32(): number
	{
		let b0 = this.readByte()
		let b1 = this.readByte()
		let b2 = this.readByte()
		let b3 = this.readByte()
		
		let buf = new ArrayBuffer(4)
		let view = new DataView(buf)

		view.setUint8(0, b0)
		view.setUint8(1, b1)
		view.setUint8(2, b2)
		view.setUint8(3, b3)

		return view.getFloat32(0)
	}
	
	
	readAsciiLength(length: number): string
	{
		let str = ""
		for (let i = 0; i < length; i++)
			str += String.fromCharCode(this.readByte())
		
		return str
	}
	
	
	readAsciiZeroTerminated(): string
	{
		let str = ""
		while (true)
		{
			let c = this.readByte()
			if (c == 0)
				break
			
			str += String.fromCharCode(c)
		}
		
		return str
	}
}