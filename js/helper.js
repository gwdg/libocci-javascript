function getWordAfterChar(value, char) {
	return value.substr(value.lastIndexOf(char)+1, (value.length)-1);
}