(function($) {
    function toggleListDisplay($list) {
        if ($list.children().length)
            $list.show();
        else
            $list.hide();
    }

    function initBackingSelect($select) {
        $select.hide();
    }

    function initAddSelect($select, $backingSelect) {
        $select
            .children().remove().end() //delete existing <option>s
            .append($backingSelect.children().clone().removeAttr("selected")) //copy the backing options, remove any selection
            .prepend("<option>(select to add)</option>") // default caption
            .prop("selectedIndex", 0);
    }

    function initSelectedList($list, $backingSelect, deleteSrc) {
        $list.children().remove(); //clear existing items

        //create a new list item for each selected backing list item
        $backingSelect.children(":selected").each(function() {
            addListItemFromOption($list, $(this), deleteSrc);
        });
    }

    function addListItemFromOption($list, $option, animate, deleteSrc) {
        //check to see if the item already exist
        if ($list.children().is("[data-value=" + $option.val() + "]"))
            return;

        // create a new <li>, bind according to the <option>, and add it to the list
        var $item = $("<li><span></span><input type='image' /></li>")
            .hide()
            .attr("data-value", $option.val())
            .find("span").text($option.text()).end()
            .find("input").val($option.val()).attr("src", deleteSrc).end()
            .appendTo($list);
        
        toggleListDisplay($list);

        animate ? $item.slideDown() : $item.show();
    }

    function selectOption($option, $selectedList, $backingSelect, animate, deleteSource) {
        addListItemFromOption($selectedList, $option, animate, deleteSource);
        $backingSelect.children("[value=" + $option.val() + "]").attr("selected", "selected")
    }

    function deselectListItem($listItem, $backingSelect, animate) {
        animate ? $listItem.slideUp(function() { $listItem.remove(); }) : $listItem.remove();
        $backingSelect.children("[value=" + $listItem.attr("data-value") + "]").removeAttr("selected");
        toggleListDisplay($listItem.parents("ul"));
    }

    $.fn.neatList = function(options) {
        //call a public method if a string is passed
        if (typeof(options) === "string")
            return $(this).data("methods")[options]();

        var options = $.extend({
            animate: true,
            deleteButtonSrc: ""
        }, options)

        return $(this).each(function() {
            //create supporting dom elements
            var $backingSelect = $(this),
                $containerDiv = $("<div />").addClass("neatList").insertBefore($backingSelect).append($backingSelect),
                $selectedList = $("<ul />").appendTo($containerDiv),
                $addSelect = $("<select />").appendTo($containerDiv);

            $addSelect.change(function() {
                selectOption($(this).children("option:selected"), $selectedList, $backingSelect, options.animate, options.deleteButtonSrc);
                $(this).prop("selectedIndex", 0);
            });

            $selectedList.delegate("li > input", "click", function(e) {
                e.preventDefault();
                deselectListItem($(this).parents("li"), $backingSelect, options.animate);
            });

            var init = false;

            //public methods
            var methods = {
                refresh: function() {
                    var work = function() {
                        init = true;
                        initBackingSelect($backingSelect);
                        initAddSelect($addSelect, $backingSelect);
                        initSelectedList($selectedList, $backingSelect, options.deleteButtonSrc);
                    };

                    if (options.animate && init) {
                        $containerDiv.fadeOut(function() {
                            work();
                            $containerDiv.fadeIn();
                        });
                    }
                    else
                        work();
                }
            };

            //store the public methods for later use
            $backingSelect.data("methods", methods);

            //get everything started
            methods.refresh();
        });
    };
})(jQuery);