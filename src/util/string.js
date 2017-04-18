function replaceAll(str, find, replace)
{
	return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}


function escapeRegExp(str)
{
	return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}


function urlSafeEncodeBase64(str)
{
	str = replaceAll(str, "+", "-");
	str = replaceAll(str, "/", "_");
	str = replaceAll(str, "=", "");
	return str;
}


function urlSafeDecodeBase64(str)
{
	str = replaceAll(str, "-", "+");
	str = replaceAll(str, "_", "/");
	
	switch (str.length % 4)
	{
		case 2: str += "=="; break;
		case 3: str += "="; break;
	}
	
	return str;
}