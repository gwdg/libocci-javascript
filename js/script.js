$.i18n.setDictionary(de);

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
	$.each(resources, function(key, Resource){
		$.each(links, function(key_l, Link){
			if(Resource["occi.core.id"] == Link.Source) {
				resources[key].LinkedTo = Link.Target;
			}
			if(Resource["occi.core.id"] == Link.Target) {
				resources[key].LinkedTo = Link.Source;
			}
		});
	})
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
	printButtonCreateEntity();
	createDialogCreateResource();
	createDialogCreateLink();
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

function printButtonCreateEntity() {
	
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