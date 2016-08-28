function drawStripedRect(ctx, x, y, w, h, color1, color2)
{
	ctx.save();
	
	ctx.beginPath();
	ctx.rect(x, y, w, h);
	ctx.clip();
	
	ctx.fillStyle = color1;
	ctx.fillRect(x, y, w, h);
	
	ctx.strokeStyle = color2;
	ctx.lineWidth = 4;
	ctx.beginPath();
	
	var lineX = 0;
	while (lineX - h * 0.6 < w)
	{
		ctx.moveTo(x + lineX + 5,           y - 5);
		ctx.lineTo(x + lineX - h * 0.6 - 5, y + h + 5);
		lineX += 10;
	}
	
	ctx.stroke();
	
	ctx.restore();
}