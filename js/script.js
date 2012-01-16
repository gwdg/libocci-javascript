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

function printResources(resources) {
	$.each(resources, function(key, value) {
		//console.log(value);
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
	printSections(kinds);
	callback.call(this, resources)
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
		}).appendTo($('#page')));
	});
}