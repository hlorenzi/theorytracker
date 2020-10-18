import * as Theory from "../theory"
import MathUtils from "./mathUtils"


const fillPatterns = new Map()
export default class CanvasUtils
{
	static fillStyleForDegree(ctx: CanvasRenderingContext2D, degree: number): any
	{
		degree = MathUtils.mod(degree, 7)

		if (Math.floor(degree) == degree)
			return Theory.Utils.degreeToColor(degree)
		
		if (fillPatterns.has(degree))
			return fillPatterns.get(degree)
		
		const colorBefore = Theory.Utils.degreeToColor(MathUtils.mod(Math.floor(degree), 7))
		const colorAfter  = Theory.Utils.degreeToColor(MathUtils.mod(Math.ceil(degree), 7))
		
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
		fillPatterns.set(degree, pattern)
		return pattern
	}


	/*static drawChord(ctx, x1, y1, x2, y2, chord, key)
	{
		const w = x2 - x1
		const h = y2 - y1
		const decorH = 6
		
		ctx.fillStyle = "#ddd"
		ctx.fillRect(x1, y1, w, h)
		
		const mode = key.scale.metadata.mode
		ctx.fillStyle = fillStyleForDegree(ctx, key.degreeForMidi(chord.rootMidi + chord.rootAccidental) + mode)
		
		ctx.fillRect(x1, y1, w, decorH)
		ctx.fillRect(x1, y2 - decorH, w, decorH)

		if (w < 8)
			return
		
		const nameBase = chord.romanBase(key)
		const nameSup = chord.romanSup(key)
		const nameSub = chord.romanSub(key)
		const nameRootPitch = key.nameForMidi(chord.rootMidi).altered(chord.rootAccidental)
		
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
			ctx.fillText(nameSup, x1 + w / 2 + nameScale * (-nameTotalW / 2 + nameBaseW), y1 + h / 2 - 4 - 8, nameScale * nameSupW)
			ctx.fillText(nameSub, x1 + w / 2 + nameScale * (-nameTotalW / 2 + nameBaseW + nameSupW), y1 + h / 2 - 4 + 8, nameScale * nameSubW)
			
			ctx.font = "12px Verdana"
			ctx.textAlign = "center"
			ctx.fillText(nameRootPitch.strUnicode, x1 + w / 2, y1 + h / 2 + 16, w - 6)
		}
	}*/
}