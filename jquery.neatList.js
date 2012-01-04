$(document).ready(function () {
    $("#rightmain").remove(); gt.resizeLayout();

    var selectedCategoryTemplate =
        "<script type=\"text/html\">" +
            "<div class=\"item\">" +
                "<input name=\"Filters.Categories[{{= i }}].Id\" type=\"hidden\" value\"{{= Id }}\" />" +
                "<input name=\"Filters.Categories[{{= i }}].Name\" type=\"hidden\" value\"{{= Name }}\" />" +
                "{{= Name }}" +
                "<a class=\"deleteButton\"></a>" +
            "</div>" +
        "</script>";

    var selectedTitleTemplate =
        "<script type=\"text/html\">" +
            "<div class=\"item\">" +
                "{{= Name }}" +
                "<a data-id='{{= Id }}' class=\"deleteButton\"></a>" +
            "</div>" +
        "</script>";

    $("#resultsGrid").delegate("a.sortLink", "click", function (event) {
        event.preventDefault();

        if (model.Sort.toLowerCase() == $(this).attr("href").toLowerCase())
            model.SortDesc = !model.SortDesc;
        else {
            model.SortDesc = false;
            model.Sort = $(this).attr("href");
        }

        refreshGrid();
    }).delegate("tfoot button", "click", function (event) {
        event.preventDefault();

        switch ($(this).attr("data-command")) {
            case "first":
                model.Page = 1; break;
            case "previous":
                model.Page--; break;
            case "next":
                model.Page++; break;
            case "last":
                model.Page = model.TotalPages; break;
        }

        refreshGrid();
    }).find("tfoot .pager input").keypress(function (event) {
        if (event.keyCode == 13) {
            var page = parseInt($(this).val());

            if (isNaN(page)) {
                $(this).val(model.Page);
                return;
            }

            if (page > model.TotalPages)
                page = model.TotalPages;
            else if (page < 1)
                page = 1;

            model.Page = page;
            refreshGrid();
        }
    });

    var renderResults = function (results) {
        $("#resultsGrid tbody *").remove();

        $("#resultTemplate").tmpl(results)
            .filter(":odd").addClass("alt").end()
            .appendTo("#resultsGrid tbody")

        $("#resultsGrid tfoot .pager input").val(model.Page);
        $("#resultsGrid tfoot .pager span.totalPages").text(model.TotalPages);
    };

    var refreshGrid = function () {
        var headerTds = $("#resultsGrid thead td");

        headerTds.each(function () {
            $(this).css("width", $(this).width());
        });

        $("#resultsGrid tbody").fadeTo(null, 0);

        delete model.Results;
        delete model.Filters.CategoryList;
        delete model.Filters.TitleList;
        delete model.Filters.JobTaskList;

        $.ajax({
            type: "POST",
            contentType: "text/json",
            dataType: "json",
            data: JSON.stringify(model),
            url: rootPath + "Tracking/Incidents/Find.mvc",
            success: function (result) {
                model.Results = result.Results;
                model.Page = result.Page;
                model.TotalPages = result.TotalPages;

                renderResults(model.Results);

                $("#resultsGrid tbody").fadeTo(null, 1);

                headerTds.each(function () {
                    $(this).css("width", "auto");
                });
            }
        });
    };

    var showFilter = function () {
        var filterList = $("#addFilter");

        if (filterList.val() == "(add filter)")
            return;

        $("#" + filterList.val()).appendTo("#filters").slideDown();
        filterList.find("option:selected").remove();

        if (filterList.children().length == 1)
            filterList.slideUp();
        else
            filterList.val("");

        $("#filterOptions").css({ clear: "both" }).animate({ paddingLeft: 180, paddingTop: 30 });
    };

    $("#clearFilters").click(function () {
        $("#" + employeeListId).employeeList("clear");
        $("#" + enteredByEmployeeList).employeeList("clear");
        $("#" + subordinateOfEmployeeList).employeeList("clear");

        $("#selectedCategories").children().remove();
        model.Filters.Categories.splice(0, model.Filters.Categories.length);

        $("#selectedExcludeCategories").children().remove();
        model.Filters.ExcludeCategories.splice(0, model.Filters.ExcludeCategories.length);

        $("#selectedTitles").children().remove();
        model.Filters.Titles.splice(0, model.Filters.Titles.length);

        $("input.dateInput").val("").trigger("change", [true]);

        $("#Filters_JobTasks").children(":selected").removeAttr("selected").end().neatList("refresh");

        $("#Filters_Keywords").val("");
        model.Filters.Keywords = "";
        lastKeywordSearch = "";

        refreshGrid();
    });

    $("#" + employeeListId).employeeList({
        employees: model.Filters.Employees,
        changed: refreshGrid,
        onlyActive: !model.ViewAll
    });

    $("#" + subordinateOfEmployeeList).employeeList({
        employees: model.Filters.SubordinatesOf,
        changed: refreshGrid,
        onlyActive: !model.ViewAll
    });

    $("#" + enteredByEmployeeList).employeeList({
        employees: model.Filters.EnteredBy,
        changed: refreshGrid,
        onlyActive: !model.ViewAll
    });

    $("#Filters_JobTasks").neatList({
        deleteButtonSrc: "../../Content/Images/Delete-Button.png"
    });

    if (model.Filters.EnteredBy.length > 0) {
        $("#addFilter").val("enteredByFilter");
        showFilter();
    }

    if (model.Filters.Employees.length > 0) {
        $("#addFilter").val("employeeFilter");
        showFilter();
    }

    if (model.Filters.SubordinatesOf.length > 0) {
        $("#addFilter").val("subordinateOfFilter");
        showFilter();
    }

    if (model.Filters.JobTasks.length > 0) {
        $("#addFilter").val("jobTaskFilter");
        $(model.Filters.JobTasks).each(function () {
            var task = this;
            $("#Filters_JobTasks").children().each(function () {
                if ($(this).val() == task.SourceId)
                    $(this).attr("selected", "selected");
            });
        });
        $("#Filters_JobTasks").neatList("refreshWithoutAnimation");
        showFilter();
    }

    if (model.Filters.Categories.length > 0) {
        $(model.Filters.Categories).each(function () {
            $(selectedCategoryTemplate).tmpl(this).appendTo("#selectedCategories");
        });

        $("#addFilter").val("categoryFilter");
        showFilter();
    }

    if (model.Filters.ExcludeCategories.length > 0) {
        $(model.Filters.ExcludeCategories).each(function () {
            $(selectedCategoryTemplate).tmpl(this).appendTo("#selectedExcludeCategories");
        });

        $("#addFilter").val("excludeCategoryFilter");
        showFilter();
    }

    if (model.Filters.Titles.length > 0) {
        $(model.Filters.Titles).each(function () {
            $(selectedTitleTemplate).tmpl(this).appendTo("#selectedTitles");
        });

        $("#addFilter").val("titleFilter");
        showFilter();
    }

    if (model.Filters.Occurred.From)
        model.Filters.Occurred.From = model.Filters.Occurred.From.dateFromJSON().toString("MM/dd/yyyy");

    if (model.Filters.Occurred.To)
        model.Filters.Occurred.To = model.Filters.Occurred.To.dateFromJSON().toString("MM/dd/yyyy");

    if (model.Filters.Occurred.From || model.Filters.Occurred.To) {
        $("#addFilter").val("occurredFilter");
        showFilter();
    }

    if (model.Filters.Keywords != "") {
        $("#addFilter").val("keywordFilter");
        showFilter();
    }

    var lastKeywordSearch = "";

    var keywordFilterUpdate = function () {
        if (lastKeywordSearch == $(this).val())
            return;

        lastKeywordSearch = $(this).val();
        model.Filters.Keywords = lastKeywordSearch;

        refreshGrid();
    };

    $("#Filters_Keywords").blur(keywordFilterUpdate).keypress(function (e) { if (e.keyCode == 13) keywordFilterUpdate.call(this); });

    var addSelectedItem = function ($selectList, $displayList, array, template) {
        if ($selectList.val() == "") {
            $selectList.get(0).selectedIndex = 0;
            return;
        }

        var item = {
            Id: parseInt($selectList.val()),
            Name: $selectList.find("option:selected").text(),
            i: $displayList.children().length
        };

        array.push(item);

        $(template).tmpl(item).hide().appendTo($displayList).slideDown();

        $selectList.get(0).selectedIndex = 0;

        refreshGrid();
    };

    var removeSelectedItem = function ($deleteButton, array) {
        var item = $deleteButton.parent();
        array.splice(item.parent().children().index(item), 1);

        item.slideUp(function () { item.remove(); });

        refreshGrid();
    };

    $("#CategoryList").change(function () {
        addSelectedItem($(this), $("#selectedCategories"), model.Filters.Categories, selectedCategoryTemplate);
    });

    $("#ExcludeCategoryList").change(function () {
        addSelectedItem($(this), $("#selectedExcludeCategories"), model.Filters.ExcludeCategories, selectedCategoryTemplate);
    });

    $("#TitleList").change(function () {
        addSelectedItem($(this), $("#selectedTitles"), model.Filters.Titles, selectedTitleTemplate);
    });

    $("#selectedCategories").delegate("a.deleteButton", "click", function () {
        removeSelectedItem($(this), model.Filters.Categories);
    });

    $("#selectedExcludeCategories").delegate("a.deleteButton", "click", function () {
        removeSelectedItem($(this), model.Filters.ExcludeCategories);
    });

    $("#selectedTitles").delegate("a.deleteButton", "click", function () {
        removeSelectedItem($(this), model.Filters.Titles);
    });

    $("#Filters_JobTasks").change(function () {
        model.Filters.JobTasks = [];

        $(this).children(":selected").each(function () {
            model.Filters.JobTasks.push({
                SourceId: $(this).val(),
                Title: $(this).text()
            });
        });

        refreshGrid();
    });

    $("input.dateInput").datepicker({
        constrainInput: false
    })
    .change(function (e, skipRefresh) {
        var dateInput = $(this);

        if (dateInput != "") {
            var parsed = Date.parse(dateInput.val());

            if (parsed != null) {
                dateInput.val(parsed.toString("MM/dd/yyyy"));
                $.watermark.hide(dateInput);
            }
        }

        eval("model." + dateInput.attr("name") + " = \"" + dateInput.val() + "\";");
        if (!skipRefresh) refreshGrid();
    });

    var hasFilter = function () {
        var filters = model.Filters;

        var hasDateRange = function (range) {
            return (range.From != null && range.From != "") || (range.To != null && range.To != "");
        };

        return filters.Categories.length > 0
            || filters.ExcludeCategories.length > 0
            || filters.Titles.length > 0
            || filters.Employees.length > 0
            || filters.EnteredBy.length > 0
            || filters.SubordinatesOf.length > 0
            || hasDateRange(filters.Occurred)
            || hasDateRange(filters.Entered)
            || (filters.Keywords != null && filters.Keywords != "");
    };

    $("button.printButton").click(function (e) {
        e.preventDefault();

        if ($(this).attr("data-requirefilter") === "true") {
            if (!hasFilter()) {
                window.alert("You must have at least one filter applied to run this report.");
                return;
            }
        }

        var element = ($(this).attr("data-signatures") === "true")
            ? "<div><input type='checkbox' id='printSignature' /> <label for='printSignature'>Include Signature Lines</label></div>"
            : "<div></div>";

        $(element).print({
            area: "Tracking",
            report: $(this).attr("data-report"),
            params: {
                sort: model.Sort,
                sortDesc: model.SortDesc
            },
            beforePrint: function () {
                return { signatures: $(this).find("input#printSignature:checked").length > 0 };
            }
        });
    });

    $("#Filters_Occurred_From").watermark("from");
    $("#Filters_Occurred_To").watermark("to");

    $("#addFilter").change(showFilter);

    renderResults(model.Results);
});