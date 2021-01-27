import * as Theory from "../theory"
import * as MathUtils from "./mathUtils"


const fillPatterns = new Map()


export function fillStyleForDegree(ctx: CanvasRenderingContext2D, degree: number, external: boolean): any
{
	degree = MathUtils.mod(degree, 7)

	const colorFn = external ? Theory.Utils.degreeToColorFaded : Theory.Utils.degreeToColor

	if (Math.floor(degree) == degree)
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


export function renderChord(
	ctx: CanvasRenderingContext2D,
	x1: number, y1: number, x2: number, y2: number,
	chord: Theory.Chord,
	key: Theory.Key)
{
	const w = x2 - x1
	const h = y2 - y1
	const decorH = 5.5
	
	ctx.fillStyle = "#ddd"
	ctx.fillRect(x1, y1, w, h)
	
	const mode = !key.scale.metadata ? 0 : key.scale.metadata.mode
	ctx.fillStyle = fillStyleForDegree(ctx, key.degreeForMidi(chord.rootChroma) + mode, false)
	
	ctx.fillRect(x1, y1, w, decorH)
	ctx.fillRect(x1, y2 - decorH, w, decorH)

	if (w < 8)
		return
	
	const nameBase = chord.romanBase(key)
	const nameSup = chord.romanSup(key)
	const nameSub = chord.romanSub(key)
	const nameRootPitch = key.nameForMidi(chord.rootChroma)
	
	ctx.fillStyle = "#000"
	ctx.textAlign = "left"
	ctx.textBaseline = "middle"
	
	ctx.font = "20px Verdana"
	const nameBaseW = ctx.measureText(nameBase).width
	ctx.font = "15px Verdana"
	const nameSupW = ctx.measureText(nameSup).width
	const nameSubW = ctx.measureText(nameSub).width
	const nameTotalW = nameBaseW + nameSupW + nameSubW
	
	const nameScale = Math.min(1, (w - 6) / nameTotalW)
	
	if (nameScale > 0)
	{
		ctx.font = "20px Verdana"
		ctx.fillText(nameBase, x1 + w / 2 + nameScale * (-nameTotalW / 2), y1 + h / 2 - 4, nameScale * nameBaseW)
		ctx.font = "15px Verdana"
		ctx.fillText(nameSup, x1 + w / 2 + nameScale * (-nameTotalW / 2 + nameBaseW), y1 + h / 2 - 4 - 4, nameScale * nameSupW)
		ctx.fillText(nameSub, x1 + w / 2 + nameScale * (-nameTotalW / 2 + nameBaseW + nameSupW), y1 + h / 2 - 4 + 12, nameScale * nameSubW)
		
		ctx.font = "10px Verdana"
		ctx.textAlign = "center"
		ctx.fillText(nameRootPitch.strUnicode, x1 + w / 2, y1 + h / 2 + 12, w - 6)
	}
}