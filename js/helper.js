function getWordAfterChar(value, char) {
	return value.substr(value.lastIndexOf(char)+1, (value.length));
}

function ucwords (str) {
    return str.substr(0,1).toUpperCase()+str.substr(1);
}

