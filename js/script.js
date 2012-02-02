$.i18n.setDictionary(de);
//	.log = function() {}

//When document is ready...
$(document).ready(function(){
	loadUI();
});

var Resources = {};
var Attr = {};
var Mixins = {};
var Kinds = {};
var Links = {};

var kinds = new Array();

function loadUI() {
	//Set i18n texts
	$('h3#section-compute-head').text($.i18n._("compute").toUpperCase());
	$('h3#section-storage-head').text($.i18n._("storage").toUpperCase());
	$('h3#section-network-head').text($.i18n._("network").toUpperCase());
	
	//handle Response-Data
	$.ajax({	
		url: "nyren.json",
		dataType: 'json',
		async: false,
	    success: function(data){ 
	    	handleResponse(data)  	
	    }
	});
}

/*
 * 
 * BEGIN Handling
 * 
 */
function handleResponse(data) {
	var resources = new Array();
	var links = new Array();
	
	Attr = getAllAttributes();
	
	$.each(data.collection, function(key, value) {
		var entitySubType = getWordAfterChar(value.kind.related, '#');
		if(entitySubType == "resource") {
			var Resource = getResourceObj(value);
			if(jQuery.inArray(Resource.Type, kinds)==-1) {
				kinds.push(Resource.Type);
			}
			resources.push(Resource);
		}
		if(entitySubType == "link") {
			var Link = getLinkObj(value);
			links.push(Link);
		}
	});
	
	
	//Add Links to Ressources
	resources = getResourcesWithLinks(resources, links);
	printDashboard(resources, links);
}

function getResourceObj(value) {
	var resObj = value
	var Resource = {};
	Resource.Type = value.kind.term;

	var SingleAttr = jQuery.extend(Attr["entity"], Attr["resource"], Attr[Resource.Type]);
	$.each(SingleAttr, function(key, value){
		
		var attrName = getWordAfterChar(key, '.');
		attrName = ucwords(attrName);
		var resValue = resObj.attributes[key];
		
		Resource[key] = resValue;
	});
	Resources[Resource["occi.core.id"]] = Resource;
    return Resource;
}

function getLinkObj(value) {
	var Link = {}
	Link.Type = value.kind.term;
	Link.Source = getWordAfterChar(value.attributes["occi.core.source"], '/');
	Link.Target = getWordAfterChar(value.attributes["occi.core.target"], '/');
	return Link;
}

function getResourcesWithLinks(resources, links) {
	$.each(resources, function(key_r, value_r){
		var id = value_r.CoreId;
		$.each(links, function(key_l, value_l) {
			var source = value_l.Source;
			var target = value_l.Target;
			if(id == target){
				var resource = resources[key_r];
				resource.LinkedTo = source;
			};
		});
		$.each(links, function(key_l, value_l) {
			var source = value_l.Source;
			var target = value_l.Target;
			if(id == source){
				var resource = resources[key_r];
				resource.LinkedTo = target;
			};
		});
	});
	return resources;
}

function getAllAttributes() {
	$.ajax({	
		url: "all.json",
		dataType: 'json',
		async: false,
	    success: function(data){ 
	    	$.each(data.kinds, function(key, value){
	    		var Obj = {};
	    		$.each(value.attributes, function(key, value){
	    			Obj[key] = value;
	    		});
	    		Attr[value.term] = Obj;
	    	});  	
	    }
	});
	return Attr;
}

function getAttributesOfKind(kind) {
	Attr = getAllAttributes();
	return Attr[kind];
}

function getAttributesOfMixin(mixin) {
	if(mixin!=-1)
		return Mixins[mixin];
	return false;
}

function getAllMixins() {
	var Out = {}
	$.ajax({	
		url: "all.json",
		dataType: 'json',
		async: false,
	    success: function(data){ 
	    	$.each(data.mixins, function(key, value){
	    		var Obj = {};
	    		$.each(value, function(key, value){
	    			Obj[key] = value;
	    		});
	    		Out[value.term] = Obj;
	    	});  	
	    }
	});
	return Out;
}

function getAllKinds() {
	var Out = {};
	$.ajax({	
		url: "all.json",
		dataType: 'json',
		async: false,
	    success: function(data){ 
	    	$.each(data.kinds, function(key, value){
	    		var Obj = {};
	    		$.each(value, function(key, value){
	    			Obj[key] = value;
	    		});
	    		Out[value.term] = Obj;
	    	});  	
	    }
	});
	return Out;
}

function getAllLinks() {
	var AllKinds = getAllKinds();
	var Out = {};
	$.each(AllKinds, function(key, value){
		if(value.related != null) 
			if(getWordAfterChar(value.related, '#') == "link")
				Out[value.term] = value;
	});
	return Out;
}

/*
 * 
 * BEGIN Prints
 * 
 */

function printDashboard(resources, links) {
	Kinds = getAllKinds();
	Links = getAllLinks();
	Mixins = getAllMixins();
	printButtonCreateResource();
	printSections(kinds);
	printResources(resources);
	
}

function printSections(kinds) {
	$.each(kinds, function(key, value) {
		$('<h3/>', {
			'id': "section-"+value+"-head",
			'class': 'ui-widget-header ui-corner-all',
			html: value.toUpperCase()
		}).add(
			$('<div/>', {
				id: "selectable-"+value,
			})
		).appendTo(
		$('<div/>', {
			'id': "section-"+value,
			'class': 'marginal ui-widget-content ui-corner-all',
		}).appendTo(
		$('<div/>', {
			'id': "frame-"+value,
			'class': 'marginal',
			'style': 'text-align:center',
		}).appendTo($('#page'))));
	});
}

function printResources(resources) {
	$.each(resources, function(key, value) {
		var Collection = value;
		var resourceId = value["occi.core.id"];
		var Resource = {};
		getOcciCoreTitlebyOcciCoreId(resourceId);
		// print Selectables
		$('<div/>', {
			'id': Collection.Type+key+'head',
			'class': 'ui-widget-content ui-corner-all selectable',
			html: getOcciCoreTitlebyOcciCoreId(resourceId)
		}).bind('click', function() {
		  $('#'+Collection.Type+key).toggle();
		  printDetails(resourceId, key);
		}).appendTo('#selectable-'+Collection.Type);
		
		
		var details = ""
			
		$('<pre/>', {
			'id': Collection.Type+key,
			'class': 'ui-widget-content ui-corner-all selectable',
			'style': 'display:none; text-align: left',
			html: details
		}).bind('click', function() {
		  printDialogActions(Collection.Type, resourceId);
		}).appendTo('#selectable-'+Collection.Type);
	})
}

function printDialogActions(type, resourceId) {
	var type2 = type; 
	var actions = getActionsOfType(type);
	var string = new Array();
	$('<div/>', {
		'id': 'dialog'+ resourceId,
		'style' :  'float: left; text-align: center',
	})
	.dialog({
		autoOpen: false,
		modal: true,
		title: $.i18n._("Actions"),
		close: function(ev, ui) {
		    $(this).remove();
		 }
	}).dialog('open');
	$.each(actions, function(key, value){
		actionName = getWordAfterChar(value, '#');
		$('<button/>', {
			'class' : 'button action ui-button ui-button-text-only ui-widget ui-state-default ui-corner-all',
			'html' : actionName,
		})
		.bind('click', function(){
			alert("Clicked");
		})
		.appendTo($('<div/>', {
			'id' : "div"+actionName+"resId",
		}))
		.appendTo($('#dialog'+resourceId))
	});
	
}

function printDetails(ResourceId, key) {
	var details = "";
	var Resource = Resources[ResourceId];
	$.each(Resource, function(key, value){
		if(value!=undefined) details += ucwords(getWordAfterChar(key, '.')) + ": "+value + "<br/>";
	});
	$('#'+Resource.Type+key).html(details);
}

/*
 * 
 * BEGIN CREATE BUTTONS
 * 
 */

function printButtonCreateResource() {
	
$('#page')
.prepend($('<div/>', {
	'id' : 'div_createEntityContainer',
	'class' : 'ui-widget-header ui-corner-all',
	'style' : 'margin: 10px 0 10px 0'
}));

$('#div_createEntityContainer')
.append($('<button/>', {
	'id' : 'button_create_resource',
	'html' : $.i18n._("Create_new_resource"),
	'style' : 'margin: 10px 0 10px 10px'
	}).button())
.append($('<button/>', {
	'id' : 'button_create_link',
	'html' : $.i18n._("Create_new_link"),
	'style' : 'margin: 10px'
	}).button())
.append($('<br/>'));


$('#button_create_resource').bind('click', function() {
	$('<div/>', {
		'id': 'dialog_create_resource',
		'style' :  'float: left; text-align: left',
	})
	.dialog({
		autoOpen: true,
		modal: true,
		title: $.i18n._("Create_new_resource"),
		resizable: false,
		draggable: true,
		close: function(ev, ui) {
		    $(this).remove();
		 }
	});
	
	if($('#dialog_create_resource').dialog("isOpen")) {
		//Platzhalter für Attributes
		$('<div/>', {
			'id' : 'div_createDialog_kind_attr',
//			'style' : 'border: 1px solid red'
		})
		.appendTo($('#dialog_create_resource'));
		
		//Platzhalter für AddCategories-Buttons
		$('<div/>', {
			'id' : 'div_add_buttons',
			'style' : 'text-align: center',
//			'style' : 'border: 1px solid red'
		})
		.appendTo($('#dialog_create_resource'));
		
		var selectBox = $('<div/>', {
			'class': 'selectBox',
		})
		
		var select = $('<select/>', {
			'id' : 'selectKind',
			'name' : 'selectKind',
			'style' : 'float: right'
		})
		.appendTo(selectBox);
		
		selectBox.prependTo($('#dialog_create_resource'));
		$.each(kinds, function(key, value){
			$('<option/>', {
				'html' : value,
				'value' : value
			})
			.appendTo($('#selectKind'));
		});
		var label = $('<label/>', {
			'html' : 'Kind',
			'for' : 'selectKind',
			'style' : 'margin:5px; width:60px',
		}).insertBefore(select);

		select.combobox({
	        selected: function(event, ui) {
	        	printCreateDialogAttributes($('#selectKind').val());
				$("#dialog_create_resource").dialog('option', 'position', 'center');
	        }
	    });
		console.log("Attribute drucken");
		$('#selectKind')
		.ready(function() {
			printCreateDialogAttributes($('#selectKind').val());
			printButtonAddMixin();
			printButtonAddLink();
			$("#dialog_create_resource").dialog('option', 'position', 'center');
		})
	}
});
}

function printCreateDialogAttributes(kind) {
	//Attribute-Div leeren
	$('#div_createDialog_kind_attr').text("");
	console.log("Kind:" +kind);
	var Attr = getAttributesOfKind(kind);
	$.each(Attr, function(key, value){
		$('<div/>', {
			'id': 'key',
			'style' :  'float: left; text-align: left; width: 120px; margin:5px',
			'html' : ucwords(getWordAfterChar(key, '.'))
		}).after(
				$('<input/>', {
					'id': key,
					'style' :  'text-align: left; width: 110px; margin: 5px',
					'html' : ucwords(getWordAfterChar(key, '.'))
				})
		)
		.appendTo($('#div_createDialog_kind_attr'));
	});
}

function printSelectMixin() {
	var divMixin = $('<div/>', {
		'class': 'divMixin ui-widget-content ui-corner-all',
		'style' : 'margin-top: 5px;'
		
	});

	var selectBox = $('<div/>', {
		'class': 'selectBox',
		'style' : 'text-align: left; float: left; width: 280px'
	}).appendTo(divMixin);
	
	var select = $('<select/>', {
			'class' : 'selectMixin ui-menu ui-widget ui-widget-content ui-corner-all',
	});
	
	$.each(Mixins, function(key, value){
		console.log("Each mixin: "+value)
		$('<option/>', {
			'html' : value.term,
			'value' : value.term
		})
		.appendTo(select);
	});
	select.appendTo(selectBox);
	divMixin.insertAfter($('#div_createDialog_kind_attr'));
	
	var divMixinAttr = $('<div/>', {
		'class': 'divMixinAttr',
	}).appendTo(divMixin);
	

	
	select
	.ready(function() {
		printSelectMixinAttributes(select.val(), divMixinAttr);
		$("#dialog_create_resource").dialog('option', 'position', 'center');
	});
		
	select.combobox({
        selected: function(event, ui) {
        	printSelectMixinAttributes(select.val(), divMixinAttr);
    		$("#dialog_create_resource").dialog('option', 'position', 'center');
        }
    });
	
	var deleteSelect = $('<button/>', {
		'class' : 'button_delete deleteSelectMixin',
		'html' : '&nbsp;',
	})
	.button({
        icons: {
            primary: "ui-icon-minusthick"
        },
        text: false,
    })
    .width("26")
    .bind('click', function() {
    	deleteSelect.parent().next().remove();
    	deleteSelect.parent().parent().remove();
    })
	.appendTo(selectBox);
}

function printSelectLink() {
	var divLink = $('<div/>', {
		'class' : 'divLink ui-widget-content ui-corner-all',
		'style' : 'text-align:left; margin-top: 5px;'
	});

	var select = $('<select/>', {
			'class' : 'selectLink',
	});
	
	$.each(Links, function(key, value){
		$('<option/>', {
			'html' : value.term,
			'value' : value.term
		})
		.appendTo(select);
	});
	
	divLink.insertBefore($('#div_add_buttons'));
	
	var selectBox = $('<div/>', {
		'class': 'selectBox',
	});
	selectBox.appendTo(divLink);
	select.appendTo(selectBox);
		
	select
	.ready(function() {
		printSelectLinkTarget(divLink);
//		$("#dialog_create_resource").dialog('option', 'position', 'center');
	});
		
	select.combobox({
        selected: function(event, ui) {
//        	printSelectLinkTarget(divLink);
//    		$("#dialog_create_resource").dialog('option', 'position', 'center');
        }
    });
	
	var deleteSelect = $('<button/>', {
		'class' : 'button_delete deleteSelectLink',
		'html' : '&nbsp;',
	})
	.button({
        icons: {
            primary: "ui-icon-minusthick"
        },
        text: false
    })
    .width("26")
    .bind('click', function() {
    	deleteSelect.parent().next().remove();
    	deleteSelect.parent().remove();
    })
	.appendTo(selectBox);
}

function printSelectMixinAttributes(mixin, tmp) {
	//Attribute-Div leeren
	$(tmp).text("");
	var Attr = getAttributesOfMixin(mixin);
	console.log("Attr:" +Attr);
	if(Attr) {
		$.each(Attr.attributes, function(key, value){
			$('<div/>', {
				'id': 'key',
				'style' :  'float: left; text-align: left; width: 120px; margin-bottom:5px',
				'html' : ucwords(getWordAfterChar(key, '.'))
			}).after(
					$('<input/>', {
						'id': key,
						'style' :  'text-align: left; width: 110px; margin: 3px 0 3px 0',
						'html' : ucwords(getWordAfterChar(key, '.'))
					})
			)
			.appendTo(tmp);
		});
	}
}

function printSelectLinkTarget(tmp) {
	var select = $('<select/>', {
		'class' : 'selectLinkTarget',
	});
	
	$.each(Resources, function(key, value){
		var resourceId = value["occi.core.id"];
		var title = getOcciCoreTitlebyOcciCoreId(resourceId);
		$('<option/>', {
			'html' : title,
			'value' : resourceId
		})
		.appendTo(select);
	});
	select.appendTo(tmp);
	select.combobox();
}

function printButtonAddMixin() {
	$('<button/>', {
		'id': 'buttonAddMixin',
		'style' :  'text-align: center; margin:5px;',
		'html' : "Add Mixin"
	})
	.button({
        icons: {
            secondary: "ui-icon-circle-plus"
        }
    })
    .bind('click', function() {
    	printSelectMixin();
    })
	.appendTo($('#div_add_buttons'));
}

function printButtonAddLink() {
	$('<button/>', {
		'id': 'buttonAddLink',
		'style' :  'text-align: center; margin:5px;',
		'html' : "Add Link"
	})
	.button({
        icons: {
            secondary: "ui-icon-circle-plus"
        }
    })
    .bind('click', function() {
    	printSelectLink();
    })
	.appendTo($('#div_add_buttons'));
}


/*
 * 
 * HELPER
 * 
 */

function getOcciCoreTitlebyOcciCoreId(occiCoreId) {
	return Resources[occiCoreId]["occi.core.title"]==undefined?$.i18n._("noname"):Resources[occiCoreId]["occi.core.title"];
}

function getActionsOfType(type) {
	var actions = new Array();
	$.ajax({	
		url: "all.json",
		dataType: 'json',
		async: false,
	    	success: function(data){ 
	     		$.each(data.kinds, function(key, value) {
				if(value.term == type) {
					$.each(value.actions, function(key, value){
					actions.push(value);		
					});
				}	
			});
		}
	});
	return actions;
	
}