function getWordAfterChar(value, char) {
	return value.substr(value.lastIndexOf(char)+1, (value.length));
}

function ucwords (str) {
    return str.substr(0,1).toUpperCase()+str.substr(1);
}

function getData(url) {
	var out;
	$.ajax({	
		url: url,
		dataType: 'json',
		async: false,
	    success: function(data){ 
	    	out = data;
	    }
	});
	return out;
}

