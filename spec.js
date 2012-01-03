describe("neatList", function() {
    var $example = $(
        "<select multiple='true' size='5'>" +
            "<option value='1'>First</option>" +
            "<option value='2' selected>Second</option>" +
            "<option value='3'>Third</option>" +
            "<option value='4' selected>Forth</option>" +
        "</select>");

    var $original = null

    beforeEach(function() {
        $("#scratchPad").children().remove().end()
            .append($example.clone());

        $original = $("#scratchPad select");
    });

    it("it should hide the original list", function() {
        var $list = $original.neatList();
        expect($original.filter(":hidden").length).toEqual(1);
    });

    it("it should copy the original list and remove the size/multiple attributes", function() {
        var $list = $original.neatList();
        expect($list.filter($original).length).toEqual(0);
        expect($original.attr("size")).toNotEqual(null);
        expect($list.attr("size")).toEqual(null);
        expect($list.attr("multiple")).toEqual(null);
    });

    it("should use the default caption and it should be selected", function() {
        var $list = $original.neatList();
        expect($list.find("option:selected").text()).toEqual("(select to add)");
    });

    it("should add an item to the selected list when selected from the drop down", function() {
        var $list = $original.neatList();

        $list.children("[value=3]").prop("selected", true);
        $list.trigger("change");

        var $selected = $list.siblings("ul");

        expect($selected.children("[data-value=3]").length).toEqual(1);
    });

    it("should mark the backing original list item to selected when selected from the drop down", function() {
        var $list = $original.neatList();

        $list.children("[value=3]").prop("selected", true);
        $list.trigger("change");

        expect($original.children("[value=3]").prop("selected")).toEqual(true);
    });

    it("should not add an item if the item is already selected", function() {
        var $list = $original.neatList();
        var $selected = $list.siblings("ul");

        expect($selected.children("[data-value=2]").length).toEqual(1);

        $list.children("[value=2]").prop("selected", true);
        $list.trigger("change");

        expect($selected.children("[data-value=2]").length).toEqual(1);
    });

    it("should mark the backing original list item as not selected with the delete button is clicked", function() {
        var $list = $original.neatList();
        var $listItem = $list.siblings("ul").children("li[data-value=2]");

        $listItem.find("input").trigger("click");

        expect($original.children("[value=2]").prop("selected")).toEqual(false);
    });

    it("should remove the item from the selected list when the delete button is clicked", function() {
        var $list = $original.neatList();
        var $selected = $list.siblings("ul")
        var $listItem = $selected.children("li[data-value=2]");

        $listItem.find("input").trigger("click");

        expect($selected.children("li[data-value=2]").length).toEqual(0);
    });
});