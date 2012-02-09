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
			
			var selectBox1 = $('<div/>', {
				'class' : 'selectBox1',
				'name' : 'selectBox1'
			});
			
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
			select.appendTo(selectBox1);
			select.combobox();
			selectBox1.appendTo('#dialog_create_link');
			
			
			var label = $('<label/>', {
				'html' : 'Source',
				'for' : 'selectLinkSource',
				'class' : 'attributes'
			}).insertBefore(select);
			
			$('<br/>').appendTo('#dialog_create_link');
			
			var selectBox2 = $('<div/>', {
				'class' : 'selectBox2',
				'name' : 'selectBox2'
			});
			
			var selectL = 
				$('<select/>', {
					'id' : 'selectLink',
					'class' : 'selectLink',
					'name' : 'selectLink'
				})
				
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
					$("#dialog_create_link").dialog('option', 'position', 'center');
		        }
		     });
			
			selectBox2.appendTo('#dialog_create_link');
			
			var label = $('<label/>', {
				'html' : 'Link',
				'for' : 'selectLink',
				'class' : 'attributes'
			}).insertBefore(selectL);
			
			
			var selectLinkAttr = $('<div/>', {
				'class' : 'selectLinkAttr',
				'name' : 'selectLinkAttr'
			});
			
			selectLinkAttr.appendTo('#dialog_create_link');
			
			selectL
			.ready(function(key, value){
				printLinkAttr(selectL.val(), selectLinkAttr);
			})
			
			var selectBox3 = $('<div/>', {
				'class' : 'selectBox3',
				'name' : 'selectBox3'
			});
			
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
			selectT.appendTo(selectBox3);
			selectT.combobox();
			selectBox3.appendTo('#dialog_create_link');
			
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

function printLinkAttr(kind, div) {
	div.text("");	
	var Attr = getAttributesOfKind(kind);
	if(Attr) {
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
			)
			.appendTo(div);
		});
		
		
	}
}