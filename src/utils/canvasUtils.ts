import * as Theory from "../theory"
import * as MathUtils from "./mathUtils"


const fillPatterns = new Map()


export function fillStyleForDegree(ctx: CanvasRenderingContext2D, degree: number, external: boolean): any
{
	degree = MathUtils.mod(degree, 7)

	const colorFn = external ? Theory.Utils.degreeToColorFaded : Theory.Utils.degreeToColor

	if (Math.floor(degree) === degree)
		return colorFn(degree)

	const cacheKey = degree + (external ? 100 : 0)
	
	if (fillPatterns.has(cacheKey))
		return fillPatterns.get(cacheKey)
	
	const colorBefore = colorFn(MathUtils.mod(Math.floor(degree), 7))
	const colorAfter  = colorFn(MathUtils.mod(Math.ceil(degree), 7))
	
	const canvas = document.createElement("canvas")
	canvas.width = 24
	canvas.height = 24
	canvas.style.display = "none"
	document.body.appendChild(canvas)
	
	let ctxPatt = canvas.getContext("2d")!
	ctxPatt.fillStyle = colorBefore
	ctxPatt.fillRect(0, 0, 24, 24)
	
	ctxPatt.fillStyle = colorAfter
	ctxPatt.beginPath()
	ctxPatt.moveTo(12, 0)
	ctxPatt.lineTo(24, 0)
	ctxPatt.lineTo(0, 24)
	ctxPatt.lineTo(-12, 24)
	
	ctxPatt.moveTo(24 + 12, 0)
	ctxPatt.lineTo(24 + 24, 0)
	ctxPatt.lineTo(24 + 0, 24)
	ctxPatt.lineTo(24 - 12, 24)
	ctxPatt.fill()
	
	const pattern = ctx.createPattern(canvas, "repeat")
	fillPatterns.set(cacheKey, pattern)
	return pattern
}