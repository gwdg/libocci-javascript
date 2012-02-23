$.i18n.setDictionary(de);

$(document).ready(function(){
	init();
});

/**
 * First the two main files are "cached"
 * 
 * It should be auto-refreshed
 */

var data_server = getData(url_server);
var data_server_info = getData(url_server_info);

/**
 * After that the instantiated resources, kinds and links are set 
 */

var Attr = getAllAttributes();

var KindsOfServer = getKindsOfServer();
var ResourcesOfServer = getResourcesOfServer();


/**
 * Then all the available Parameters are set
 */

var Mixins = {};
var Links = {};




function init() {
	setTexts();	
	printDashboard();
}


/**
 * get initiated Stuff
 * @returns {___anonymous3158_3159}
 */

function setTexts() {
	$('h3#section-compute-head').text($.i18n._("compute").toUpperCase());
	$('h3#section-storage-head').text($.i18n._("storage").toUpperCase());
	$('h3#section-network-head').text($.i18n._("network").toUpperCase());
}

function getResourcesOfServer() {
	console.log("getResourcesOfServer called");
	var Out = {};
	$.each(data_server.collection, function(key, value) {
		var res = value;
		var kind = KindsOfServer[value.kind.term];
		var related = kind.related;
		if(related) {
			var entitySubType = getWordAfterChar(related, '#');
			if(entitySubType == "resource") {
	    		var CurrResource = {};
	    		CurrResource.Type = value.kind.term;
	    		var AttributesOfKind = jQuery.extend(Attr["entity"], Attr["resource"], Attr[CurrResource.Type]);
	    		console.debug("Attributes of Kind: "+CurrResource.Type);
	    		console.debug(AttributesOfKind);
	    		$.each(AttributesOfKind, function(key, value){
	    			CurrResource[key] = res.attributes[key];
	    		});
	    		$.each(res.links, function(k,v) {
	    			CurrResource["Link("+(k+1)+")"] = v.target;
	    		});
	    		Out[CurrResource["occi.core.id"]] = CurrResource;
			}
		}
	});
	console.debug("getResourcesOfServer gibt zurueck:");
	console.debug(Out);
	return Out;
}

function getKindsOfServer() {
	console.info("getKindsOfServer called!");
	var Out = {};
	$.each(data_server_info.kinds, function(key, value) {
		var Obj = {};
		$.each(value, function(key2, value2) {
			Obj[key2] = value2;
		});
		Out[value.term] = Obj;
	});
	console.debug("getKindsOfServer gibt zurueck:");
	console.debug(Out);
	return Out;
}


//function getLinksOfServer() {
//	console.info("getLinksOfServer called");
//	var Out = new Array();
//	$.each(data_server.collection, function(key, value) {
//		var entitySubType = getWordAfterChar(value.kind.related, '#');
//		if(entitySubType == "link") {
//			var Link = {};
//			Link.Type = value.kind.term;
//			Link.Source = getWordAfterChar(value.attributes["occi.core.source"], '/');
//			Link.Target = getWordAfterChar(value.attributes["occi.core.target"], '/');
//			Out.push(Link);
//		}
//	});
//	console.debug("getLinksOfServer returned: ");
//	console.debug(Out);
//	return Out;
//}
//
//function attachLinksToResourcesOfServer(Resources) {
//	console.log("attachLinksToResourcesOfServer called");
//	var LinksOfServer = getLinksOfServer();
//	$.each(Resources, function(key, Resource){
//		$.each(LinksOfServer, function(key_l, Link){
//			if(Resource["occi.core.id"] == Link.Source) {
//				Resources[key].LinkedTo = Link.Target;
//			}
//			if(Resource["occi.core.id"] == Link.Target) {
//				Resources[key].LinkedTo = Link.Source;
//			}
//		});
//	});
//	console.debug("attachLinksToResourcesOfServer gibt zurueck:");
//	console.debug(Resources);
//	return Resources;
//}


/**
 * get available Params
 * @returns {___anonymous3158_3159}
 */
function getAllAttributes() {
	var Out = {};
	console.info("getAllAttributes aufgerufen");
	
	$.each(data_server_info.kinds, function(key, value){
		var hasAttributes  = false;
		var Obj = {};
		if(value.attributes != null)
			$.each(value.attributes, function(key, value){
				hasAttributes = true;
				Obj[key] = value;
			});
		if(hasAttributes)
			Out[value.term] = Obj;
	});  	
	console.debug("getAllAttributes gibt zurück: ");
	console.debug(Out);
	return Out;
}

function getAttributesOfKind(kind) {
	return Attr[kind];
}

function getAttributesOfMixin(mixin) {
	if(mixin!=-1)
		return Mixins[mixin];
	return false;
}

function getAllMixins() {
	console.info("getAllMixins aufgerufen");
	var Out = {};
	$.each(data_server_info.mixins, function(key, value){
		var Obj = {};
		$.each(value, function(key, value){
			Obj[key] = value;
		});
		Out[value.term] = Obj;
	});  	
	console.debug("getAllMixins gibt zurück: ");
	console.debug(Out);
	return Out;
}

function getAllKinds() {
	console.info("getAllKinds aufgerufen");
	var Out = {};
	$.each(data_server_info.kinds, function(key, value){
		var Obj = {};
		$.each(value, function(key, value){
			Obj[key] = value;
		});
		Out[value.term] = Obj;
	});  	
	console.debug("getAllKinds gibt zurück: ");
	console.debug(Out);
	return Out;
}

function getAllLinks() {
	console.info("getAllLinks aufgerufen");
	var AllKinds = getAllKinds();
	var Out = {};
	$.each(AllKinds, function(key, value){
		if(value.related != null) 
			if(getWordAfterChar(value.related, '#') == "link")
				Out[value.term] = value;
	});
	console.debug("getAllLinks gibt zurück: ");
	console.debug(Out);
	return Out;
}

function getActionsOfType(type) {
	var actions = new Array();
	$.each(data_server_info.kinds, function(key, value) {
		if(value.term == type) {
			$.each(value.actions, function(key, value){
			actions.push(value);		
			});
		}	
	});
	return actions;
}

/*
 * 
 * BEGIN Prints
 * 
 */

function printDashboard() {

	Links = getAllLinks();
	Mixins = getAllMixins();
	
	printButtonCreateResourceAndLink();
	
	printSections();
	printResources();
	
	createDialogCreateResource();
	createDialogCreateLink();
}

function printSections() {
	$.each(KindsOfServer, function(key, value) {
		var term = value.term;
		var related = value.related;
		if(related) {
			var entitySubType = getWordAfterChar(related, '#');
			if (entitySubType == "resource") {
				$('<h3/>', {
					'id': "section-"+term+"-head",
					'class': 'ui-widget-header ui-corner-all',
					'html': term.toUpperCase()
				}).add(
					$('<div/>', {
						id: "selectable-"+term,
					})
				).appendTo(
				$('<div/>', {
					'id': "section-"+term,
					'class': 'section marginal ui-widget-content ui-corner-all',
					'text-align' : 'center'
				}).appendTo(
				$('<div/>', {
					'id': "frame-"+term,
					'class': 'marginal',
					'style': 'text-align:center',
				}).appendTo($('#page'))));	
			}
		}
	});
}

function printResources() {
	$.each(ResourcesOfServer, function(key, value) {
		var Collection = value;
		var resourceId = value["occi.core.id"];
		getOcciCoreTitlebyOcciCoreId(resourceId);
		
		// print Selectables
		$('<div/>', {
			'id': Collection.Type+key+'head',
			'class': 'ui-widget-content ui-corner-all selectable',
			html: getOcciCoreTitlebyOcciCoreId(resourceId)
		})
		.bind('click', function() {
			printDivDetails(resourceId, key);
			$('#'+Collection.Type+key).toggle();
		})
		.appendTo('#selectable-'+Collection.Type);
		
		var details = "";
			
		$('<pre/>', {
			'id': Collection.Type+key,
			'class': 'ui-state-highlight ui-widget-content ui-corner-all selectable',
			'style': 'display:none; text-align: left',
			html: details
		}).bind('click', function() {
		  printDialogActions(Collection.Type, resourceId);
		})
		.appendTo('#selectable-'+Collection.Type);
		printButtonsCustomizeResource(resourceId, key);
		$('#'+Collection.Type+key+'head')
		.bind('click', function(){
			$('#'+Collection.Type+key+"_buttons").toggle();
		});
		
	});
}

function printDialogActions(type, resourceId) {
	var actions = getActionsOfType(type);
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
			$(this).parent().dialog("close"); 
      	  	$.jGrowl($.i18n._("action_executed", [$(this).html()])+"!");
		})
		.appendTo($('<div/>', {
			'id' : "div"+actionName+"resId",
		}))
		.appendTo($('#dialog'+resourceId));
	});
	
}

function printDivDetails(ResourceId, key) {
	
	var details = "";
	var Resource = ResourcesOfServer[ResourceId];
	$.each(Resource, function(key, value){
		//if(value!=undefined) details += ucwords(getWordAfterChar(key, '.')) + ": "+value + "<br/>";
		if(value!=undefined) details += $.i18n._(getWordAfterChar(key, '.')) + ": "+value + "<br/>";
	});
	$('#'+Resource.Type+key).html(details);
}

function printButtonsCustomizeResource(ResourceId, key) {
	var Resource = ResourcesOfServer[ResourceId];
	var detailBox = $('<div/>', {
		'id' : Resource.Type+key+"_buttons",
		'name' : 'detailBox',
		'style' : 'text-align:center; display:none'
	}).insertAfter($('#'+Resource.Type+key));
	
	
	$('<button/>', {
		'class' : 'button_delete deleteResource',
		'html' : '&nbsp;',
	})
	.button({
        icons: {
            primary: "ui-icon-pencil"
        },
        text: false,
    })
    .width("26")
    .bind('click', function() {
    	$('<div/>', {
    		'html' : printDivEditResource(Resource)
    	})
    	.dialog({
			autoOpen: true,
    		resizable: false,
    		width:340,
    		title: $.i18n._('Edit'),
			modal: true,
			buttons: [
			          {
			              text: $.i18n._("save"),
			              click: function() {
			            	  $(this).dialog("close"); 
			            	  $.jGrowl($.i18n._("Resource")+" "+$.i18n._("saved")+"!");
			              }
			          },
			          {
			              text: $.i18n._("cancel"),
			              click: function() { $(this).dialog("close"); }
			          }
			]
		});
    })
    .appendTo(detailBox);
    
	$('<button/>', {
		'class' : 'button_delete deleteResource',
		'html' : '&nbsp;',
	})
	.button({
        icons: {
            primary: "ui-icon-trash"
        },
        text: false,
    })
    .width("26")
    .bind('click', function() {
    	$('<div/>', {
    		'html' : $.i18n._('Confirm_delete_resource_text')
    	})
    	.dialog({
			autoOpen: true,
    		resizable: false,
    		width:340,
    		title: $.i18n._("Confirm_delete"),
			height:190,
			modal: true,
			buttons: [
			          {
			              text: $.i18n._("yes"),
			              click: function() { 
			            	  $(this).dialog("close");
			            	  $.jGrowl($.i18n._("Resource")+" "+$.i18n._("deleted")+"!");
			              }
			          },
			          {
			              text: $.i18n._("cancel"),
			              click: function() { $(this).dialog("close"); }
			          }
			]
		});
    })
    .appendTo(detailBox);
}

/*
 * 
 * BEGIN PRINT CREATE BUTTONS
 * 
 */

function printButtonCreateResourceAndLink() {
	
$('#page')
.prepend($('<div/>', {
	'id' : 'div_createResourceContainer',
	'class' : 'ui-widget-header ui-corner-all',
	'style' : 'margin: 10px 0 10px 0'
}));

$('#div_createResourceContainer')
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

function printDivEditResource(Resource) {
	var out = $('<div/>');
	$.each(Resource, function(key, value){
		$('<div/>', {
			'id': 'key',
			'class' : 'attributes',
			'html' : ucwords(getWordAfterChar(key, '.'))
		}).after(
				$('<input/>', {
					'id': key,
					'value': value,
					'style' :  'text-align: left; width: 110px; margin: 5px',
					'html' : ucwords(getWordAfterChar(key, '.'))
				})
		).appendTo(out);
	});
	return out;
}
/*
 * 
 * HELPER
 * 
 */

function getOcciCoreTitlebyOcciCoreId(occiCoreId) {
	return ResourcesOfServer[occiCoreId]["occi.core.title"]==undefined?$.i18n._("noname"):ResourcesOfServer[occiCoreId]["occi.core.title"];
}