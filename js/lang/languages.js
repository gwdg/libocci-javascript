/**
 * I18N - SUPPORT
 */

/*
 * DEFINE LANGUAGES
 */
var languages = ["de", "en"];

// Load languages into #select_lang
$.each(languages, function(key, value) {
	$.ajax({
		url: "js/lang/lang_"+value+".js",
		dataType: "script",
		success: function() {
			$('#select_lang').append(
					$('<option/>', {
						'id': "lang_"+value,
						'value': value,
						html: value
						})
					)
		}
	});
});