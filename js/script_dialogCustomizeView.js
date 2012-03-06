function createDialogCustomizeView() {
	$('#button_customize_view').bind('click', function() {
		$('<div/>', {
			'id': 'dialog_customize_view',
			'style' :  'float: left; text-align: left',
		})
		.dialog({
			autoOpen: true,
			modal: true,
			title: $.i18n._("Customize_view"),
			resizable: false,
			draggable: true,
			close: function(ev, ui) {
			    $(this).remove();
			 }
		});
		
		if($('#dialog_customize_view').dialog("isOpen")) {
			$('<div/>', {
				'html' : $.i18n._('Customize_view_text')+":",
				'style' : 'clear:both',
			}).appendTo($('#dialog_customize_view'));
			
			$.each(KindsOfServer, function(key, value){
				var term = value.term;
				var related = value.related;
				if(related) {
					var entitySubType = getWordAfterChar(related, '#');
					if (entitySubType == "resource") {
						console.log("Adding "+value.term+" to CustomizeView");
						$('<input/>', {
							'type' : 'checkbox',
							'style' :  'text-align: left; margin:5px; float:left',
							'value' : value.term,
							'checked' : 'checked'
						})
						.bind('change', function(){
							$('#frame-'+$(this).val()).toggle();
							if($('#frame-'+$(this).val()).is(':visible')) {
								$('#container').width($('#container').width() + 330);
							}else{
								$('#container').width($('#container').width() - 330);
							}
						})
						.after(
						$('<div/>', {
							'style' :  'text-align: left; margin:5px; float: left',
							'html' : value.term
						}))
						.appendTo($('#dialog_customize_view'));
						$('<br/>', {
							'class' :  'clear',
						})
						.appendTo($('#dialog_customize_view'));
					}
				}
			});
		}
	});
}
