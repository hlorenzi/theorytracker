function mouseToClient(elem, ev)
{
	var rect = elem.getBoundingClientRect();
	
	return {
		x: ev.clientX - rect.left,
		y: ev.clientY - rect.top
	};
}