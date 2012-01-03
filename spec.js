describe("neatList", function() {
    var $example = $(
        "<select size='5'>" +
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

    it("it should copy the original list and remove the size", function() {
        var $list = $original.neatList();
        expect($list.filter($original).length).toEqual(0);
        expect($original.attr("size")).toNotEqual(null);
        expect($list.attr("size")).toEqual(null);
    });

    it("should use the default caption and it should be selected", function() {
        var $list = $original.neatList();
        expect($list.find("option:selected").text()).toEqual("(select to add)");
    });
});