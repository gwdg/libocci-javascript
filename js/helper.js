function getWordAfterChar(value, char) {
//	console.debug("Value:");
//	console.debug(value);
//	console.debug("Char:");
//	console.debug(char);
//	console.debug("value.lastIndexOf(char)+1:");
//	console.debug(value.lastIndexOf(char)+1);
	return value.substr(value.lastIndexOf(char)+1, (value.length));
}

function ucwords (str) {
    return str.substr(0,1).toUpperCase()+str.substr(1);
}

function getData(url, name) {
	var out;
	$.ajax({	
		url: url,
		dataType: 'json',
		crossDomain: 'true',
		async: false,
		error: function(data) {
			$.jGrowl($.i18n._("error_getData", [name]), {sticky:true, theme:'error'});
			console.debug("Error-data:");
			console.debug(data);
		},
	    success: function(data){ 
	    	out = data;
	    }
	});
	return out;
}

$.extend({
	getUrlVars: function(){
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++)
		{
			hash = hashes[i].split('=');
			vars.push(hash[0]);
			vars[hash[0]] = hash[1];
		}
		return vars;
	},
	getUrlVar: function(name){
		return $.getUrlVars()[name];
	}
});

function getLanguageByUrl() {
	var lang = $.getUrlVar("lang");
	console.info("getUrlVal returned "+lang);
	if( lang != null)
		return lang;
	return "";
}

function getSelectedLanguage() {
	var language = "";
	language = getLanguageByUrl();
	if(language == "")
		language = defaultLanguage;
	
	if(language == "")
		language = "en";
	console.log("Setting language to: "+language);
	console.log(window[language]);
	return language;
}

function loadAndSetLanguages(callback) {
	console.log("Loading language into s application");
	$.each(languages, function(key, value) {
		$.getScript("js/lang/lang_"+value+".js", function(data, textStatus, jqxhr) {
//			   console.log(data); //data returned
			   console.log(textStatus); //success
			   console.log(jqxhr.status); //200
			   console.log('Load was performed.');
			   if(getSelectedLanguage() == value) {
				   $.i18n.setDictionary(window[getSelectedLanguage()]);
				   callback();
			   }
			});
	});
	return 1;	
}

function setSelectLanguageDefaultOption() {
	console.info("Setting first option of #select_lang");
	$('#select_lang').val($("#select_lang option:first").text($.i18n._("Your_current_language") +": "+getSelectedLanguage()));
	$('#select_lang').show();
	$('#select_lang')
	.combobox({
        selected: function(event, ui) {
        	 selectLanguage($('#select_lang').val());
        }
    })
    .addClass('selectbox');
	$('.ui-autocomplete-input').css('width','250px');
}

function loadSelectLanguages() {
	console.info("Loading language into #select_lang");
	$.each(languages, function(key, value) {
		console.info(value);
		 
		$('#select_lang').append(
			$('<option/>', {
				'id': "lang_"+value,
				'value': value,
				html: value,
			})
		);
	});
	setSelectLanguageDefaultOption();
	$('#lang_'+getSelectedLanguage()).attr('selected', "");
}

function selectLanguage(language) {
	if(language != "-1")
		window.location = $(location).attr('pathname')+"?lang="+language+"&url="+url_server;
}

function getHost() {
	console.info("getHost called");
	console.debug("1. getHost get: "+url_server);
	if(url_server != "") 
		return url_server;
	console.debug("2. getHost get: "+$.getUrlVar("url"));
	if($.getUrlVar("url"))
		return $.getUrlVar("url");
	console.debug("3. getHost get: NOTHING");
	return "";	
}