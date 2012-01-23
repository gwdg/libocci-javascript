$.i18n.setDictionary(de);

//When document is ready...
$(document).ready(function(){
	loadUI();
});


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

function handleResponse(data) {
	
	var resources = new Array();
	var links = new Array();
	var kinds = new Array();
	
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
	
	printDashboard(resources, links, kinds, printResources);
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

function printCreateButton(value, kinds) {
$('#frame-'+value).prepend($('<div><p><a class="ui-state-default ui-corner-all button_create" id="p_a_create_'+value+'" href="#">'+$.i18n._("New")+'</a></p></div>'))

$('#p_a_create_'+value).bind('click', function() {
	$('<div/>', {
		'id': 'dialog_create'+ value,
		'style' :  'float: left; text-align: center',
	})
	.dialog({
		autoOpen: false,
		title: $.i18n._("Create")+": "+$.i18n._(value),
		resizable: false,
		draggable: true,
		close: function(ev, ui) {
		    $(this).remove();
		 }
	}).dialog('open');
	if($('#dialog_create'+ value).dialog("isOpen")) {
		$('#dialog_create'+ value).one( "clickoutside", function(event){
			$('#dialog_create'+ value).dialog().parent().one( "clickoutside", function(event){
				$(this).children().remove();
				$(this).remove();
			});
			
			//selectKind
			$('<select/>', {
				'id' : 'selectKind_'+value,
			})
			.appendTo($('#dialog_create'+ value));
			$.each(kinds, function(key2, value2){
				kindName = value2;
				$('<option/>', {
					'html' : kindName,
					'value' : kindName
				})
				.appendTo($('#selectKind_'+value));
			});
			$('#selectKind_'+value).selectmenu({
				style: "popup"
			});
		});
	}
});
}

function printResources(resources) {
	$.each(resources, function(key, value) {	
		var Collection = value;
		// print Selectables
		$('<div/>', {
			'id': Collection.Type+key+'head',
			'class': 'ui-widget-content ui-corner-all selectable',
			html: $.i18n._("ressource")+ " " +key
		}).bind('click', function() {
		  $('#'+Collection.Type+key).toggle();
		}).appendTo('#selectable-'+Collection.Type);
		
	    // generate details
		var details =
			$.i18n._("type") + ": " + Collection.Type + "<br/>" + 
			$.i18n._("core-id") + ": " + Collection.CoreId + "<br/>" +
			$.i18n._("architecture") + ": " + Collection.ComputeArchitecture + "<br/>" +
			$.i18n._("speed") + ": " + Collection.ComputeSpeed + "ghz<br/>" +
			$.i18n._("memory") + ": " + Collection.ComputeMemory + "gb<br/>" +
			$.i18n._("state") + ": " + Collection.ComputeState + "<br/>" +
			$.i18n._("linkedTo") + ": " + Collection.LinkedTo + "<br/>";
			
			
		// print details
		$('<pre/>', {
			'id': Collection.Type+key,
			'class': 'ui-widget-content ui-corner-all selectable',
			'style': 'display:none; text-align: left',
			html: details
		}).bind('click', function() {
		  printDetailDialogBox(Collection.Type, key);
		}).appendTo('#selectable-'+Collection.Type);
	})
}

function getResourceObj(value) {
	var Resource = {};
	Resource.Type = value.kind.term;
	//Compute
	Resource.CoreId = value.attributes["occi.core.id"]; 
	Resource.ComputeArchitecture = value.attributes["occi.compute.architecture"]; 
	Resource.ComputeSpeed = value.attributes["occi.compute.speed"]; 
	Resource.ComputeMemory = value.attributes["occi.compute.memory"]; 
	Resource.ComputeState = value.attributes["occi.compute.state"];
    
    return Resource;
}

function getLinkObj(value) {
	var Link = {}
	Link.Type = value.kind.term;
	Link.Source = getWordAfterChar(value.attributes["occi.core.source"], '/');
	Link.Target = getWordAfterChar(value.attributes["occi.core.target"], '/');
	return Link;
}

function printDashboard(resources, links, kinds, callback) {
	printSections(kinds, printCreateButton);
	//printRessources
	callback.call(this, resources)
}

function printSections(kinds, callback) {
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
		//printCreateButton
		callback.call(this,value, kinds);
	});
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

function printDetailDialogBox(type, key) {
	var resId = key
	var actions = getActionsOfType(type);
	var string = new Array();
	$('<div/>', {
		'id': 'dialog'+ key,
		'style' :  'float: left; text-align: center',
	})
	.dialog({
		autoOpen: false,
		title: $.i18n._("Create")+": "+$.i18n._(type),
		resizable: false,
		draggable: true,
		close: function(ev, ui) {
		    $(this).remove();
		 }
	}).dialog('open');
	if($('#dialog'+resId).dialog("isOpen")) {
		$("#dialog"+key).one( "clickoutside", function(event){
			$("#dialog"+key).dialog().parent().one( "clickoutside", function(event){
				$(this).children().remove();
				$(this).remove();
			});
		});
	};
	$.each(actions, function(key, value){
		actionName = getWordAfterChar(value, '#');
		$('<button/>', {
			'class' : 'button action ui-button ui-button-text-only ui-widget ui-state-default ui-corner-all',
			'html' : actionName,
		})
		.appendTo($('<div/>', {
			'id' : "div"+actionName+"resId",
		}))
		.appendTo($('#dialog'+resId))
	});
	
}
