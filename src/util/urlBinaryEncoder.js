import pako from "pako"


function urlSafeEncodeBase64(str)
{
	str = str.replace(/\+/g, "-")
	str = str.replace(/\//g, "_")
	str = str.replace(/\=/g, "")
	return str
}


function urlSafeDecodeBase64(str)
{
	str = str.replace(/-/g, "+")
	str = str.replace(/_/g, "/")
	
	switch (str.length % 4)
	{
		case 2: str += "=="; break;
		case 3: str += "="; break;
	}
	
	return str
}


export class URLBinaryEncoder
{
	constructor()
	{
		this.data = []
	}
	
	
	getCompressedURLSafe()
	{
		const array = new Uint8Array(this.data)
		//console.log(array)
		const compressed = pako.deflateRaw(array, { to: "string", level: 9 })
		//console.log(compressed)
		const compressedBase64 = window.btoa(new Array(compressed))
		//console.log(compressedBase64)
		const urlSafeCompressedBase64 = urlSafeEncodeBase64(compressedBase64)
		//console.log(urlSafeCompressedBase64)
		return urlSafeCompressedBase64
	}


	writeByte(value)
	{
		this.data.push(value & 0xff)
	}


	writeInteger(value)
	{
		let negative = (value < 0)
		
		if (negative)
			value = -value
		
		this.data.push((negative ? 0x40 : 0) | (value & 0x3f))
		value >>= 6
		
		let spliceAt = this.data.length - 1	
		while (value > 0)
		{
			this.data.splice(spliceAt, 0, 0x80 | (value & 0x7f))
			value >>= 7
		}
	}


	writeRational(rational)
	{
		this.writeInteger(rational.integer)
		this.writeInteger(rational.numerator)
		
		if (rational.numerator != 0)
			this.writeInteger(rational.denominator)
	}


	writeString(str)
	{
		if (str == null)
		{
			this.writeInteger(0)
		}
		else
		{
			this.writeInteger(str.length)
			for (let i = 0; i < str.length; i++)
				this.writeInteger(str.charCodeAt(i))
		}
	}
}

export class URLBinaryDecoder
{
	constructor(urlSafeCompressedBase64)
	{
		const compressedBase64 = urlSafeDecodeBase64(urlSafeCompressedBase64)
		const compressed = window.atob(compressedBase64)
		const array = pako.inflateRaw(compressed)

		this.data = array
		this.index = 0
	}


	readByte()
	{
		this.index += 1
		return this.data[this.index - 1]
	}


	readInteger()
	{
		let value = 0
		while (true)
		{
			if (this.index >= this.data.length)
				throw "unexpected end of binary stream"
			
			let block = this.data[this.index]
			this.index += 1
			
			if ((block & 0x80) == 0)
			{
				value = (value << 6) | (block & 0x3f)
				
				if ((block & 0x40) != 0)
					value = -value
				
				break
			}
			else
				value = (value << 7) | (block & 0x7f)
		}
		
		return value
	}


	readRational()
	{
		let integer = this.readInteger()
		let numerator = this.readInteger()
		let denominator = 1
		if (numerator != 0)
			denominator = this.readInteger()
		
		return new Rational(integer, numerator, denominator)
	}


	readString()
	{
		let length = this.readInteger()
		if (length == 0)
			return null
		
		let encodedStr = ""
		for (let i = 0; i < length; i++)
			encodedStr += String.fromCharCode(this.readInteger())
		
		return encodedStr
	}
}