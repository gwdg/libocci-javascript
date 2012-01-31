$.i18n.setDictionary(de);
//	.log = function() {}

//When document is ready...
$(document).ready(function(){
	loadUI();
});

var Resources = {};
var Attr = {};
var Mixins = {};

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
	    		Mixins[value.term] = Obj;
	    	});  	
	    }
	});
	return Mixins;
}

/*
 * 
 * BEGIN Prints
 * 
 */

function printDashboard(resources, links) {
	getAllMixins();
	
	printCreateResourceButton();
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
		  printActionsDialogBox(Collection.Type, resourceId);
		}).appendTo('#selectable-'+Collection.Type);
	})
}

function printActionsDialogBox(type, resourceId) {
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

function printCreateResourceButton() {
$('#page').prepend($('<div><p><a class="ui-state-default ui-corner-all button_create" id="p_a_create'+'" href="#">'+$.i18n._("Create_new_resource")+'</a></p></div>'))

$('#p_a_create').bind('click', function() {
	$('<div/>', {
		'id': 'dialog_create',
		'style' :  'float: left; text-align: center',
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
	
	if($('#dialog_create').dialog("isOpen")) {
		console.log("Platzhalter für Attribute");
		//Platzhalter für Attributes
		$('<div/>', {
			'id' : 'div_createDialog_attr',
//			'style' : 'border: 1px solid red'
		})
		.appendTo($('#dialog_create'));
		
		//Platzhalter für Mixins
		$('<div/>', {
			'id' : 'div_createDialog_mixins',
//			'style' : 'border: 1px solid red'
		})
		.appendTo($('#dialog_create'));
		
		//Platzhalter für AddCategories-Buttons
		$('<div/>', {
			'id' : 'div_addCategories',
//			'style' : 'border: 1px solid red'
		})
		.appendTo($('#dialog_create'));
		
		//selectKind
		console.log("Select Kind");
		var select = $('<select/>', {
			'id' : 'selectKind',
		})
		.prependTo($('#dialog_create'));
		$.each(kinds, function(key, value){
			$('<option/>', {
				'html' : value,
				'value' : value
			})
			.appendTo($('#selectKind'));
		});
		select.combobox({
	        selected: function(event, ui) {
	        	printCreateDialogAttributes($('#selectKind').val());
				$("#dialog_create").dialog('option', 'position', 'center');
	        }
	    });
		console.log("Attribute drucken");
		$('#selectKind')
		.ready(function() {
			printCreateDialogAttributes($('#selectKind').val());
			printCreateDialogAddCategories();
			$("#dialog_create").dialog('option', 'position', 'center');
		})
	}
});
}

function printCreateDialogAttributes(kind) {
	//Attribute-Div leeren
	$('#div_createDialog_attr').text("");
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
		.appendTo($('#div_createDialog_attr'));
	});
}

function printCreateDialogMixins() {
	var divMixin = $('<div/>', {
		'class': 'divMixin',
	});
	$('#div_createDialog_mixins').text("");
	var select = $('<select/>', {
			'class' : 'selectMixin',
	})
	
	
	
	$.each(Mixins, function(key, value){
		console.log("Each mixin: "+value)
		$('<option/>', {
			'html' : value.term,
			'value' : value.term
		})
		.appendTo(select);
	});
	
	
	
	divMixin.insertAfter($('#div_createDialog_attr'));
	
	var selectBox = $('<div/>', {
		'class': 'selectBox',
		'style' : 'text-align: left; float: left; width: 280px'
	});
	selectBox.insertAfter($('#div_createDialog_attr'));
	select.appendTo(selectBox);
	
	select
	.ready(function() {
		printCreateDialogMixinsAttributes(select.val(), divMixin);
		$("#dialog_create").dialog('option', 'position', 'center');
	});
		
	select.combobox({
        selected: function(event, ui) {
        	printCreateDialogMixinsAttributes(select.val(), divMixin);
    		$("#dialog_create").dialog('option', 'position', 'center');
        }
    });
	
	var deleteSelect = $('<button/>', {
		'class' : 'deleteSelectMixin',
		'html' : '&nbsp;',
		'style' : 'width: 38px'
	})
	.button({
        icons: {
            primary: "ui-icon-minusthick"
        }
    })
    .bind('click', function() {
    	deleteSelect.parent().next().remove();
    	deleteSelect.parent().remove();
    })
	.appendTo(selectBox);
}

function printCreateDialogMixinsAttributes(mixin, tmp) {
	//Attribute-Div leeren
	$(tmp).text("");
	var Attr = getAttributesOfMixin(mixin);
	console.log("Attr:" +Attr);
	if(Attr) {
		$.each(Attr.attributes, function(key, value){
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
			.appendTo(tmp);
		});
	}
}

function printCreateDialogAddCategories() {
	$('<button/>', {
		'id': 'addMixin',
		'style' :  'text-align: center; margin:5px;',
		'html' : "Add Mixin"
	})
	.button({
        icons: {
            secondary: "ui-icon-circle-plus"
        }
    })
    .bind('click', function() {
    	printCreateDialogMixins();
    })
	.appendTo($('#div_addCategories'));
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