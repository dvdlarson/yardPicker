$(document).ready(function () {
    $(".cancel").on("click", function (event) {
        event.preventDefault();
        location.href = "/manage";
    });

    $(".editsale").on("click", function (event) {
        event.preventDefault();
        var id = this.id;
        var fullAddress = $("#address").val().trim() + " " + $("#city").val().trim() + " " + $("#state").val().trim() + " " + $("#zip").val().trim()
        console.log("sale id: " + id);


        var newSale = {
            title: $("#title").val().trim(),
            sale_type: $("#sale_type").val().trim(),
            start_date: $("#rangestart").val().trim(),
            end_date: $("#rangeend").val().trim(),
            start_time: $("#startTime").val().trim(),
            end_time: $("#endTime").val().trim(),
            on_street_parking: $("#parking").val().trim(),
            inside_outside: $("#inside_outside").val().trim(),
            weather_cancel: $("#weather_cancel").val().trim(),
            items_desc: $("#desc").val().trim(),
            city: $("#city").val().trim(),
            state: $("#state").val().trim(),
            zip_cd: $("#zip").val().trim(),
            full_address: fullAddress,
            active: 1,
        };
        console.log(newSale);

        $.ajax("/api/editsale/" + id, {
            type: "PUT",
            data: newSale
        }).then(function () {
            console.log("Updated sale: " + newSale);
        });
        location.href = "/manage";

    });
});