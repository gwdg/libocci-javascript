function createDialogCreateResource() {
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
			
			var divKind = $('<div/>', {
				'id' : 'divKind',
				'class': 'divKind ui-widget-content ui-corner-all container',
				'style' : 'margin-top: 5px;'
			});
			
			$('<div/>', {
				'id' : 'divKindAttr',
				'style' : 'margin-top: 5px;'
			}).appendTo(divKind);
			
			//Platzhalter für Attributes
			$('<div/>', {
				'id' : 'div_createDialog_kind_attr',
			})
			.appendTo($('#dialog_create_resource'));
			
			//Platzhalter für AddCategories-Buttons
			$('<div/>', {
				'id' : 'div_add_buttons',
				'style' : 'text-align: center',
			})
			.appendTo($('#dialog_create_resource'));
			
			var selectBox = $('<div/>', {
				'class': 'selectBox',
			});
			
			var select = $('<select/>', {
				'id' : 'selectKind',
				'name' : 'selectKind',
				'style' : 'float: right'
			})
			.appendTo(selectBox);
			selectBox.prependTo(divKind);
			divKind.prependTo($('#dialog_create_resource'));
			$.each(Kinds, function(key, value){
				if(value.related != null)
					if(getWordAfterChar(value.related, '#') == "resource")
						$('<option/>', {
							'html' : value.term,
							'value' : value.term
						})
						.appendTo($('#selectKind'));
			});
			$('<label/>', {
				'html' : 'Kind',
				'for' : 'selectKind',
				'class' : 'attributes',
			}).insertBefore(select);
			select.combobox({
		        selected: function(event, ui) {
		        	printSelectKindAttributes($('#selectKind').val());
					$("#dialog_create_resource").dialog('option', 'position', 'center');
		        }
		    });
			$('#selectKind')
			.ready(function() {
				printSelectKindAttributes($('#selectKind').val());
				printButtonAddMixin();
				printButtonAddLink();
				printButtonSave();
				$("#dialog_create_resource").dialog('option', 'position', 'center');
			});
		}
	});
}

function printSelectKindAttributes(kind) {
	//Attribute-Div leeren
	$('#divKindAttr').text("");
	
	var Attr = getAttributesOfKind(kind);
	$.each(Attr, function(key, value){
		$('<div/>', {
			'id': 'key',
			'class' : 'attributes',
			'html' : ucwords(getWordAfterChar(key, '.'))
		}).after(
				$('<input/>', {
					'id': key,
					'style' :  'text-align: left; width: 110px; margin: 5px',
					'html' : ucwords(getWordAfterChar(key, '.'))
				})
		).appendTo($('#divKindAttr'));
		
	});
}

function printSelectMixin() {
	var divMixin = $('<div/>', {
		'class': 'divMixin ui-widget-content ui-corner-all container',
	});

	var selectBox = $('<div/>', {
		'class': 'selectBox',
	}).appendTo(divMixin);
	
	var select = $('<select/>', {
			'class' : 'selectMixin ui-menu ui-widget ui-widget-content ui-corner-all',
	});
	
	
	
	$.each(Mixins, function(key, value){
		$('<option/>', {
			'html' : value.term,
			'value' : value.term
		})
		.appendTo(select);
	});
	select.appendTo(selectBox);
	
	$('<label/>', {
		'html' : 'Mixin',
		'for' : 'selectKind',
		'class' : 'attributes'
	}).insertBefore(selectBox);
	
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
	
	$('<button/>', {
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
    	$(this).parent().next().remove();
    	$(this).parent().parent().remove();
    })
	.appendTo(selectBox);
}

function printSelectMixinAttributes(mixin, tmp) {
	//Attribute-Div leeren
	$(tmp).text("");
	var Attr = getAttributesOfMixin(mixin);
	if(Attr) {
		$.each(Attr.attributes, function(key, value){
			$('<div/>', {
				'id': 'key',
				'class' : 'attributes',
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



function printSelectLink() {
	var divLink = $('<div/>', {
		'class' : 'divLink ui-widget-content ui-corner-all container',
		'style' : 'text-align:left; margin-top: 5px;'
	});

	var select = 
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
		.appendTo(select);
	});
	
	
	
	divLink.insertBefore($('#div_add_buttons'));
	
	var selectBox = $('<div/>', {
		'class': 'selectBox',
	});
	selectBox.appendTo(divLink);
	select.appendTo(selectBox);
	
	$('<label/>', {
		'html' : 'Link',
		'for' : 'selectLink',
		'class' : 'attributes'
	}).insertBefore(selectBox);
	
	var divLinkAttr = $('<div/>', {
		'id' : 'divLinkAttr',
		'class': 'divLinkAttr',
	});
	divLinkAttr.appendTo(divLink);
	
	select
	.ready(function() {
		printSelectLinkAttributes($('#selectLink').val(), divLinkAttr);
		printSelectLinkTarget(divLink);
	});
		
	select.combobox({
        selected: function(event, ui) {
        	printSelectLinkAttributes($('#selectLink').val(), divLinkAttr);
        }
    });
	
	$('<button/>', {
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
    	$(this).parent().next().remove();
    	$(this).parent().parent().remove();
    })
	.appendTo(selectBox);
}

function printSelectLinkAttributes(kind, div) {
	div.text("");
	
	var Attr = getAttributesOfKind(kind);
	$.each(Attr, function(key, value){
		$('<div/>', {
			'id': 'key',
			'class' : 'attributes',
			'html' : ucwords(getWordAfterChar(key, '.'))
		}).after(
				$('<input/>', {
					'id': key,
					'style' :  'text-align: left; width: 110px; margin: 5px',
					'html' : ucwords(getWordAfterChar(key, '.'))
				})
		).appendTo(div);
		
	});
	
}

function printSelectLinkTarget(tmp) {
	var select = $('<select/>', {
		'class' : 'selectLinkTarget',
		'name' : 'selectTarget'
	});
	
	$.each(ResourcesOfServer, function(key, value){
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
	
	$('<label/>', {
		'html' : 'Target',
		'for' : 'selectTarget',
		'class' : 'attributes'
	}).insertBefore(select);
	
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

function printButtonSave() {
	$('<br/>')
	.appendTo($('#div_add_buttons'));
	$('<button/>', {
		'html' : 'Save',
		'style' : 'margin: 5px;'
	})
	.button()
	.bind('click', function() {
		$('#dialog_create_resource').remove();
		$.jGrowl($.i18n._("Resource")+" "+$.i18n._("saved")+"!");
	})
	.appendTo($('#div_add_buttons'));
}