/**
 * Created by JetBrains WebStorm.
 * User: Nick Riggs
 * Date: 1/3/12
 * Time: 9:31 AM
 * To change this template use File | Settings | File Templates.
 */

(function($) {
    var $selectListItemTemplate = $(
        "<li>" +
            "<span></span>" +
            "<input type='image'>" +
        "</li>");

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
                    .removeAttr("multiple")
                    .show();

            if (options.caption) {
                $addInput.prepend("<option>" + options.caption + "</option>");
            }

            $addInput.prop("selectedIndex", 0);

            var addOptionToSelected = function($option) {
                $baseInput.children("option[value=" + $option.val() + "]").prop("selected", true);

                var alreadySelected = $selectedList.children().is("li[data-value=" + $option.val() + "]");

                if (alreadySelected)
                    return;

                $selectListItemTemplate.clone()
                    .attr("data-value", $option.val())
                    .find("span").text($option.text()).end()
                    .find("input")
                        .val($option.val())
                    .end()
                    .appendTo($selectedList);
            };

            var removeItemFromSelected = function ($listItem) {
                $baseInput.children("option[value=" + $listItem.attr("data-value") + "]").prop("selected", false);

                $listItem.remove();
            };

            $baseInput.children("option:selected").each(function() {
                var $option = $(this);

                addOptionToSelected($option);
            });

            $addInput.change(function() {
                addOptionToSelected($(this).children(":selected"));
                $(this).prop("selectedIndex", 0);
            });

            $selectedList.delegate("li > input", "click", function() {
                removeItemFromSelected($(this).parents("li"));
            });

            result.push($addInput.get(0));
        });

        return $(result);
    };
})(jQuery);