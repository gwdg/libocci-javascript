var data_server;
var data_server_info;
var Attr;
var KindsOfServer;
var ResourcesOfServer;
var Mixin;
var Links;


if(notifications == "off") $.jGrowl = function( m , o ) {return}
$.jGrowl.defaults.position = notications_position;

loadAndSetLanguages(function() {
$(document).ready(function(){
	url_server = getHost();
	if(url_server == "")
		promptHostUrl();
	else{
		prepareData(function(){
		init();
		});
	}
});
});



function promptHostUrl(){
	console.log("Showing Dialog -INSERT HOST-");
	$('<input />', {
		'type' : 'text',
		'style' : 'margin: 5px; width: 100%',
		'id' : 'inputUrlServer',
		'value' : 'http://192.168.56.101:3000/'
	})
	.after(
			$('<input />', {
				'type' : 'button',
				'id' : 'buttonSaveUrlServer',
				'value' : $.i18n._("continue"),
			}).bind('click', function(){
				urlServerInserted($('#inputUrlServer').val());
			})
			.button()
	)
	.appendTo(
			$('<div/>', {
				'html' : $.i18n._("missing_host_text")+":",
				'id': 'dialogSetServer',
				'style' :  'float: left; text-align: left',
			})
			.dialog({
				autoOpen: true,
				modal: true,
				resizable: false,
				title: $.i18n._("define_host"),
				close: function(ev, ui) {
				    $(this).remove();
				 }
			})
	);
}

function urlServerInserted(url) {
	url_server = url;
	console.debug("Following URL was inserted:");
	console.debug(url_server);
	$('#dialogSetServer').dialog('close');
	prepareData(function(){
	init();
	});
}

function prepareData(callback) {
	/**
	 * First the two main files are "cached"
	 * 
	 * It should be auto-refreshed or something like that
	 */
	
	data_server = getData(url_server, $.i18n._("server_data"));
	data_server_info = getData(url_server+"-/", $.i18n._("discovery_interface"));

	/**
	 * After that the instantiated resources, kinds and links are set 
	 */

	Attr = getAllAttributes();

	KindsOfServer = getKindsOfServer();
	ResourcesOfServer = getResourcesOfServer();


	/**
	 * Then all the available Parameters are set
	 */

	Mixins = {};
	Links = {};

	callback();
}



function init() {
	loadSelectLanguages();
	printDashboard();
	$.jGrowl($.i18n._("welcome_text"));
}

function reload() {
	prepareData(function(){
		$('#main').remove();
		$('#div_createResourceContainer').remove();
			printDashboard();
	});
	
}


/**
 * get initiated Stuff
 * @returns {___anonymous3158_3159}
 */

function getResourcesOfServer() {
	console.log("getResourcesOfServer called");
	var Out = {};
	if(data_server.collection)
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
	console.debug("getAllLinks gibt zur�ck: ");
	console.debug(Out);
	return Out;
}

function getActionsOfType(type) {
	console.info("getActionsOfType called!");
	var actions = new Array();
	$.each(data_server_info.kinds, function(key, value) {
		if(value.term == type) {
			$.each(value.actions, function(key, value){
			actions.push(value);		
			});
		}	
	});
	console.debug("getActionsOfType returned: ");
	console.debug(actions);
	return actions;
}

function getActionsOfResource(resourceId) {
	var out;
	console.info("getActionsOfResource called!");
	console.debug("resourceId "+resourceId);
	$.each(data_server, function(key, value) {
		$.each(value, function(k, v){
			if(v.location){
				console.debug("location "+v.location);
				var id = getWordAfterChar(v.location, '/');
				if(id == resourceId){
					console.debug("match found");
					console.debug(v.actions);
					out =  v.actions;
				}
			}
		});
	});
	return out;
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
	createDialogCustomizeView();
}

function printSections() {
	
	$('<div/>', {
		'id': 'main',
		'class': 'ui-widget-content ui-corner-tl ui-corner-tr',
	}).appendTo($('#page'));
	$('<div/>', {
		'id': 'container',
	}).appendTo($('#main'));
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
					'class': 'ui-widget-content ui-corner-all',
					'text-align' : 'center'
				}).appendTo(
				$('<div/>', {
					'id': "frame-"+term,
					'style': 'text-align:center',
					'class' : 'section',
				}).appendTo($('#container'))));	
				$('#container').width($('#container').width() + 330);
			}
		}
		
	});
	$('<div/>', {
		'style': 'clear:both'
	}).appendTo($('#main'));
}


function printResources() {
	$.each(ResourcesOfServer, function(key, value) {
		var Collection = value;
		var resourceId = value["occi.core.id"];
		getOcciCoreTitlebyOcciCoreId(resourceId);
		
		// print Selectables
		$('<div/>', {
			'id': Collection.Type+"_"+key+"_"+'head',
			'class': 'ui-widget-content ui-corner-all selectable',
			html: getOcciCoreTitlebyOcciCoreId(resourceId),
		})
		.bind('click', function() {
			printDivDetails(resourceId, key);
			$('#'+Collection.Type+"_"+key).toggle();
			$('#'+Collection.Type+"_"+key+"_buttons").toggle();
		})
		.appendTo('#selectable-'+Collection.Type);
		
		var details = "";
			
		$('<div/>', {
			'id': Collection.Type+"_"+key,
			'class': 'ui-widget-content ui-corner-all selectable detailBox',
			'style': 'display:none; text-align: left',
			html: details
		}).bind('click', function() {
		  printDialogActions(Collection.Type, resourceId);
		})
		.droppable({
			hoverClass: "ui-state-default",
			scroll: true,
			distance: 0,
			over: function(event, ui) {
			},
			drop: function(event, ui) {
				var draggableId = getWordAfterChar(ui.draggable[0].attributes.id.value, '_');
				var droppableId = getWordAfterChar($(this).attr('id'), '_');
				
				console.debug("DraggableId:");
				console.debug(droppableId);
				console.debug("DroppableId:");
				console.debug(droppableId);
				
				printDialogChooseLinkType(draggableId, droppableId);
//				$.jGrowl($.i18n._("link_created_between", [draggableId, droppableId]));
			}
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
	var availActions = getActionsOfResource(resourceId);
	console.debug(availActions);
	$('<div/>', {
		'id': 'dialog'+"_"+ resourceId,
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
		actionType = getWordAfterChar(value.type, '#');
		actionName = value.title;
		console.debug(value.uri);
		
		$.each(availActions, function(k, v){
			console.debug(v.uri);
			var b = $('<button/>', {
					'class' : 'button action',
					'html' : actionName,
					'disabled' : true
			});
				b.button()
				.bind('click', function(){
					$(this).parent().dialog("close"); 
		      	  	$.jGrowl($.i18n._("action_executed", [$(this).html()])+"!");
				})
				.appendTo($('<div/>', {
					'id' : "div"+actionName+"_"+"resId",
				}))
				.appendTo($('#dialog'+"_"+resourceId));
			if(getWordAfterChar(v.uri, '?') == getWordAfterChar(value.uri, '?')) {
				b.button({ disabled: false });
			}
		});
	});
	
}

function printDivDetails(ResourceId, key) {
	
	var details = "";
	var Resource = ResourcesOfServer[ResourceId];
	$.each(Resource, function(key, value){
		//if(value!=undefined) details += ucwords(getWordAfterChar(key, '.')) + ": "+value + "<br/>";
		if(value!=undefined) details += $.i18n._(getWordAfterChar(key, '.')) + ": "+value + "<br/>";
	});
	$('#'+Resource.Type+"_"+key).html(details);
}

function printButtonsCustomizeResource(ResourceId, key) {
	var Resource = ResourcesOfServer[ResourceId];
	var detailBox = $('<div/>', {
		'id' : Resource.Type+"_"+key+"_buttons",
		'name' : 'detailBox',
		'style' : 'margin-bottom: 20px; text-align:center; display:none;'
	}).insertAfter($('#'+Resource.Type+"_"+key));
	
	$('<div/>', {
		'id' : Resource.Type+"_"+key,
		'class' : 'button_customizeResource',
	})
	.button({
        icons: {
            primary: "ui-icon-link"
        },
        text: false,
    })
    .width("26")
    .bind("click", function(){
    	$.jGrowl($.i18n._("drag_to_target"));
    })
    .appendTo(detailBox)
    .draggable({
    	opacity: 0.7, 
    	start: function(){
    		$(this).unbind('click');
    	},
    	stop: function(){
    		$(this).bind('click', function(){
    			$.jGrowl($.i18n._("drag_to_target"));
    		});
    	},
    	revert: true,
    });
	
	$('<div/>', {
		'class' : 'button_customizeResource',
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
    
	$('<div/>', {
		'class' : 'button_customizeResource',
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
			              	var res = "/"+ResourcesOfServer[key]["Type"]+"/"+ResourcesOfServer[key]["occi.core.id"];
			            	  $(this).dialog("close");
			            	  $.ajax({
								  url: res,
								  type: "DELETE",
								  success: function(){
								  	reload();
								  }
								});
			            	  
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
.append($('<div/>', {
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
.append($('<button/>', {
	'id' : 'button_customize_view',
	'html' : $.i18n._("Customize_view"),
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
		$('<br/>',{
			'class' : 'clear',
		})
		.appendTo(out);
	});
	return out;
}

/*
 * 
 * Dialogs
 * 
 */

function printDialogChooseLinkType(sourceId, targetId){
	$('<div/>', {
		'id': 'dialog_chooseLinkType',
		'style' :  'float: left; text-align: left',
	})
	.dialog({
		autoOpen: true,
		modal: true,
		title: $.i18n._("Create_new_link"),
		resizable: false,
		draggable: true,
		close: function(ev, ui) {
		    $(this).remove();
		 }
	});
	
	if($('#dialog_chooseLinkType').dialog("isOpen")) {
		
		var selectBox1 = $('<div/>', {
			'class' : 'selectBox1',
			'name' : 'selectBox1'
		});
		
		
		
		var inputS = $('<input/>', {
			'class' : 'inputLink',
			'disabled' : 'disabled',
			'name' : 'inputLinkTarget',
			'id' : 'inputLinkTarget',
			'value' : sourceId	
		});
		
		
		
		inputS.appendTo(selectBox1);
		selectBox1.appendTo('#dialog_chooseLinkType');
		
		$('<label/>', {
			'html' : 'Target',
			'for' : 'selectLinkTarget',
			'class' : 'attributes'
		}).insertBefore(inputS);
		
		$('<br/>').appendTo('#dialog_chooseLinkType');
		
		var selectBox2 = $('<div/>', {
			'class' : 'selectBox2',
			'name' : 'selectBox2'
		});
		
		var selectL = 
			$('<select/>', {
				'id' : 'selectLink',
				'class' : 'selectLink',
				'name' : 'selectLink'
			});
			
			$.each(Links, function(key, value){
				$('<option/>', {
					'html' : value.term,
					'value' : value.term
				})
				.appendTo(selectL);
			});
		
		selectL.appendTo(selectBox2);
		selectL.combobox({
	        selected: function(event, ui) {
	        	printLinkAttr(selectL.val(), selectLinkAttr);
				$("#dialog_chooseLinkType").dialog('option', 'position', 'center');
	        }
	     });
		
		selectBox2.appendTo('#dialog_chooseLinkType');
		
		$('<label/>', {
			'html' : 'Link',
			'for' : 'selectLink',
			'class' : 'attributes'
		}).insertBefore(selectL);
		
		
		var selectLinkAttr = $('<div/>', {
			'class' : 'selectLinkAttr, divAttr',
			'name' : 'selectLinkAttr'
		});
		
		selectLinkAttr.appendTo('#dialog_chooseLinkType');
		
		selectL
		.ready(function(key, value){
			printLinkAttr(selectL.val(), selectLinkAttr);
		});
		
		
		
		$('<br/>').appendTo('#dialog_chooseLinkType');
		
		var selectBox3 = $('<div/>', {
			'class' : 'selectBox3',
			'name' : 'selectBox3'
		});
		
		
		
		var inputT = $('<input/>', {
			'class' : 'inputLink',
			'disabled' : 'disabled',
			'name' : 'inputLinkTarget',
			'id' : 'inputLinkTarget',
			'value' : targetId	
		});
		
		
		
		inputT.appendTo(selectBox3);
		selectBox3.appendTo('#dialog_chooseLinkType');
		
		$('<label/>', {
			'html' : 'Target',
			'for' : 'selectLinkTarget',
			'class' : 'attributes'
		}).insertBefore(inputT);
		
		$('<br/>').appendTo('#dialog_chooseLinkType');
		
		var div = $('<div/>', {
			'style' : 'text-align: center; margin-top: 10px'
		}).appendTo('#dialog_chooseLinkType');
		
		$('<button/>', {
			'html' : 'Save',
		})
		.button()
		.bind('click', function() {
			$('#dialog_chooseLinkType').remove();
			$.jGrowl($.i18n._("Link")+" "+$.i18n._("saved")+"!");
})
		.appendTo(div);
	}
	
}
/*
 * 
 * HELPER
 * 
 */

function getOcciCoreTitlebyOcciCoreId(occiCoreId) {
	return ResourcesOfServer[occiCoreId]["occi.core.title"]==undefined?$.i18n._("noname"):ResourcesOfServer[occiCoreId]["occi.core.title"];
}