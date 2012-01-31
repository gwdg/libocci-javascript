/**
 * creates a split button UI component using jquery ui 1.8.x's menu and button groups. See comment about potential
 * changes in jquery ui 1.9.x.
 *
 * @see http://jqueryui.com/demos/button/splitbutton.html for a non-functional example
 * @see https://raw.github.com/jquery/jquery-ui/5f4a6009e9987842b3a970c77bed0b52f7e810e2/demos/button/splitbutton.html for the code used for this plugin.
 *
 * @param options.selected closure to execute upon menu item selection (default: execute the link href)
 * @param options.showMenu closure to show context menu (default: show the menu relative to the button)
 */
(function($) {
    $.fn.splitButton = function(options) {
        var menu = null;
        var settings = {
            selected: function(event, ui) {
                document.location = ui.item.children()[0];
            },
            showMenu: function() {
                if (menu) menu.hide();
                menu = $(this).parent().next().show().position({
                    my: "left top",  at: "left bottom", of: $(this).prev()
                });
                $(document).one("click", function() {
                    menu.hide();
                });
                return false;
            }
        };
        if (options) {
            $.extend(settings, options);
        }
        var buttonConfig = {  text: false, icons: { primary: "ui-icon-triangle-1-s" }};
        return this.button().next().button(buttonConfig).click(settings.showMenu).parent().buttonset()
            // this may change to select: in jquery ui 1.9
            .next().menu({selected: settings.selected});
    };
})(jQuery);