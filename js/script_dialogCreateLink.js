function createDialogCreateLink() {
	$('#button_create_link').bind('click', function() {
		$('<div/>', {
			'id': 'dialog_create_link',
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
		
		if($('#dialog_create_link').dialog("isOpen")) {
			var select = $('<select/>', {
				'class' : 'selectLinkSource',
				'name' : 'selectLinkSource'
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
			select.appendTo('#dialog_create_link');
			select.combobox();
			
			var label = $('<label/>', {
				'html' : 'Source',
				'for' : 'selectLinkSource',
				'class' : 'attributes'
			}).insertBefore(select);
			
			$('<br/>').appendTo('#dialog_create_link');
			
			var selectT = $('<select/>', {
				'class' : 'selectLinkTarget',
				'name' : 'selectLinkTarget'
			});
			
			$.each(Resources, function(key, value){
				var resourceId = value["occi.core.id"];
				var title = getOcciCoreTitlebyOcciCoreId(resourceId);
				$('<option/>', {
					'html' : title,
					'value' : resourceId
				})
				.appendTo(selectT);
			});
			selectT.appendTo('#dialog_create_link');
			selectT.combobox();
			
			var label = $('<label/>', {
				'html' : 'Target',
				'for' : 'selectLinkTarget',
				'class' : 'attributes'
			}).insertBefore(selectT);
			
			$('<br/>').appendTo('#dialog_create_link');
			
			var div = $('<div/>', {
				'style' : 'text-align: center; margin-top: 10px'
			}).appendTo('#dialog_create_link');
			
			$('<button/>', {
				'html' : 'Save',
			})
			.button()
			.bind('click', function() {
				$('#dialog_create_link').remove();
	})
			.appendTo(div);
		}
	});
}