function Callback()
{
	this.callbacks = [];
}


Callback.prototype.add = function(callback)
{
	this.callbacks.push(callback);
}


Callback.prototype.remove = function(callback)
{
	var index = this.callbacks.indexOf(callback);
	
	if (index > -1) {
		this.callbacks.splice(index, 1);
	}
}


Callback.prototype.call = function(callbackWithArgs)
{
	for (var i = 0; i < this.callbacks.length; i++)
		callbackWithArgs(this.callbacks[i]);
}