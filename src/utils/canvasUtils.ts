import * as Theory from "../theory"
import * as Prefs from "../prefs"
import * as MathUtils from "./mathUtils"
import Rect from "./rect"


const fillPatterns = new Map<string, CanvasPattern>()


function createStripedPattern(
	cacheKey: string,
	ctx: CanvasRenderingContext2D,
	color1: string,
	color2: string)
{
	if (fillPatterns.has(cacheKey))
		return fillPatterns.get(cacheKey)
	
	const canvas = document.createElement("canvas")
	canvas.width = 24
	canvas.height = 24
	canvas.style.display = "none"
	document.body.appendChild(canvas)
	
	let ctxPatt = canvas.getContext("2d")!
	ctxPatt.fillStyle = color1
	ctxPatt.fillRect(0, 0, 24, 24)
	
	ctxPatt.fillStyle = color2
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
	
	const pattern = ctx.createPattern(canvas, "repeat")!
	fillPatterns.set(cacheKey, pattern)
	return pattern
}


export function fillStyleForDegree(ctx: CanvasRenderingContext2D, degree: number, external: boolean): any
{
	degree = MathUtils.mod(degree, 7)

	const colorFn = external ?
		Theory.Utils.degreeToColorFaded :
		Theory.Utils.degreeToColor

	if (Math.floor(degree) === degree)
		return colorFn(degree)

	const cacheKey = degree.toString() + (external ? ".ext" : 0)
	
	if (fillPatterns.has(cacheKey))
		return fillPatterns.get(cacheKey)
	
	const color1 = colorFn(MathUtils.mod(Math.floor(degree), 7))
	const color2 = colorFn(MathUtils.mod(Math.ceil(degree), 7))

	return createStripedPattern(
		cacheKey,
		ctx,
		color1,
		color2)	
}


export function fillStyleForOutOfBounds(
	ctx: CanvasRenderingContext2D,
	prefs: Prefs.Prefs)
	: any
{
	return createStripedPattern(
		"oob",
		ctx,
		prefs.timeline.outOfBoundsColor1,
		prefs.timeline.outOfBoundsColor2)	
}


export function drawChord(
	ctx: CanvasRenderingContext2D,
	rect: Rect,
	prefs: Prefs.Prefs,
	chord: Theory.Chord,
	key: Theory.Key)
{
	const mode = key.scale.metadata!.mode
	const fillStyle = fillStyleForDegree(
		ctx,
		key.degreeForMidi(chord.rootChroma) + mode,
		false)
		
	const ornamentH = 6

	ctx.fillStyle = fillStyle
	
	/*ctx.save()
	ctx.beginPath()
	ctx.roundRect(
		rect.x,
		rect.y,
		rect.w,
		rect.h,
		5)
	ctx.clip()
	ctx.fillRect(
		rect.x,
		rect.y,
		rect.w,
		ornamentH)
	ctx.fillRect(
		rect.x,
		rect.y2 - ornamentH,
		rect.w,
		ornamentH)
	ctx.restore()*/

	ctx.beginPath()
	ctx.roundRect(
		rect.x,
		rect.y,
		rect.w,
		rect.h,
		5)
	ctx.fill()

	ctx.fillStyle = "#fffe"
	ctx.fillRect(
		rect.x,
		rect.y + ornamentH,
		rect.w,
		rect.h - ornamentH * 2)

	const chordStr = chord.str(key)

	const maxWidth = rect.w * 0.9

	ctx.fillStyle = "#000"
	drawChordName(
		ctx,
		`${prefs.timeline.fontWeightChord} ${rect.h * 0.5}px ${prefs.timeline.fontNameChord}`,
		`${prefs.timeline.fontWeightChord} ${rect.h * 0.25}px ${prefs.timeline.fontNameChord}`,
		chordStr.romanBase,
		chordStr.romanSup,
		chordStr.romanSub,
		rect.xCenter,
		rect.yCenter + rect.h * (0.05 - 0.1),
		rect.h * 0.5,
		rect.h * -0.15,
		rect.h * 0.05,
		maxWidth)
		
	drawChordName(
		ctx,
		`${prefs.timeline.fontWeightChord} ${rect.h * 0.2}px ${prefs.timeline.fontNameChord}`,
		`${prefs.timeline.fontWeightChord} ${rect.h * 0.15}px ${prefs.timeline.fontNameChord}`,
		chordStr.nameBase,
		chordStr.nameSup,
		chordStr.nameSub,
		rect.xCenter,
		rect.yCenter + rect.h * (0.05 + 0.22),
		rect.h * 0.5,
		rect.h * -0.05,
		rect.h * 0.05,
		maxWidth)
}


function drawChordName(
	ctx: CanvasRenderingContext2D,
	fontBase: string,
	fontSupSub: string,
	strBase: string,
	strSup: string,
	strSub: string,
	xCenter: number,
	yCenter: number,
	height: number,
	supHeightOffset: number,
	subHeightOffset: number,
	maxWidth: number)
{
	ctx.textAlign = "left"
	ctx.textBaseline = "middle"

	ctx.font = fontBase
	const baseMetrics = ctx.measureText(strBase)
	ctx.font = fontSupSub
	const supMetrics = ctx.measureText(strSup)
	const subMetrics = ctx.measureText(strSub)

	let baseWidth = baseMetrics.width
	let supSubWidth = Math.max(supMetrics.width, subMetrics.width)
	if (baseWidth + supSubWidth > maxWidth)
	{
		const supSubWidthProportion = supSubWidth / (baseWidth + supSubWidth)
		baseWidth = maxWidth * (1 - supSubWidthProportion)
		supSubWidth = maxWidth * supSubWidthProportion
	}

	const strTotalWidth = baseWidth + supSubWidth

	ctx.fillText(
		strSup,
		xCenter - strTotalWidth / 2 + baseWidth,
		yCenter + supHeightOffset,
		supSubWidth)

	ctx.fillText(
		strSub,
		xCenter - strTotalWidth / 2 + baseWidth,
		yCenter + subHeightOffset,
		supSubWidth)
	
	ctx.font = fontBase
	ctx.fillText(
		strBase,
		xCenter - strTotalWidth / 2,
		yCenter,
		baseWidth)
}