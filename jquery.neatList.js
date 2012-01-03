/**
 * Created by JetBrains WebStorm.
 * User: Nick Riggs
 * Date: 1/3/12
 * Time: 9:31 AM
 * To change this template use File | Settings | File Templates.
 */

(function($) {
    /*
    var render = {
        $selectListItemTemplate: $(
            "<li>" +
                "<span></span>" +
                "<input type='image'>" +
            "</li>"),

        addOptionToList: function($option, $list) {
            render.$selectListItemTemplate.clone()
                .attr("data-value", $option.val())
                .find("span").text($option.text()).end()
                .find("input")
                    .attr("name", $select.attr(name) + "-delete")
                    .val($option.val())
                .end()
                .appendTo($list);
        },

        bindSelectToList: function($select, $list) {
            $select.children(":selected").each(function() {
                render.addOptionToList($option, $(this));
            });
        }
    };
    */

    $.fn.neatList = function(options) {
        var options = $.extend({
            caption: "(select to add)"
        }, options);

        var result = [];

        $(this).each(function() {
            var $baseInput = $(this).hide(),
                $selectedList = $("<ul></ul>").insertBefore($baseInput),
                $addInput = $baseInput.clone()
                    .insertBefore($baseInput)
                    .children().removeAttr("selected").end()
                    .removeAttr("size")
                    .show();

            if (options.caption) {
                $addInput.prepend("<option>" + options.caption + "</option>");
            }

            $addInput.prop("selectedIndex", 0);

            result.push($addInput.get(0));
        });

        return $(result);
    };
})(jQuery);