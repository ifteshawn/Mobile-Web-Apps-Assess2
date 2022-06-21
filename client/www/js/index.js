const baseURL = 'http://localhost:';

const port = "3000";

//array to temporarily hold QR code data
var localArray = [];

//array to hold cloud data
var cloudData = [];

//display all data held in local storage.
//adds data dynamically to the data table in local data page
function displayLocalData() {
    if (localStorage.getItem("characters")) {
        var output = $("tbody")[0];
        output.innerHTML = "";
        JSON.parse(localStorage.characters).forEach(character => {
            output.innerHTML += "<tr>" +
                "<td><img src='Resources/" + character.img + "' style='width: 50%'></td>" +
                "<td>" + character.char_id + "</td>" +
                "<td>" + character.name + "</td>" +
                "<td>" + character.birthday + "</td>" +
                "<td>" + character.occupation + "</td>" +
                "<td>" + character.nickname + "</td>" +
                "<td>" + character.portrayed + "</td>" +
                "<td>" + character.category + "</td>" +
                "</tr>"
        });
        $("#localDataTable").table().table("refresh");
    }
};

//on loading of the application 
$(document).ready(function () {

    //display local data button action
    $("#localDataLink").click(function (e) {
        $("body").pagecontainer("change", "#localDataPage");
        displayLocalData();
    });

    //delete local data button action on admin menu
    $("#deleteLocalData").click(function (e) {
        eraseLocalData();
        navigator.notification.alert("All local data deleted!");
    });

    //to delete local data
    function eraseLocalData() {
        localArray = [];
        localStorage.clear();
        $("#localDataTable tbody tr").remove();
    }

    //to delete cloud data
    $("#deleteCloudData").click(function (e) {
        $.ajax({
            url: baseURL + port + "/delCloudData",
        }).done(function (data, statusText, xhrObj) {
            alert("Status text : " + statusText + "\nData: " + JSON.stringify(data));

        }).error(function (xhr) {
            alert("Error: " + JSON.stringify(xhr));
        }) // end ajax

        $("#cloudDataTable tbody tr").remove();
        navigator.notification.alert("All cloud data deleted!");
    });


    //upload to cloud button action
    //this returns a confirmation dialog to confirm upload and delete local data.
    $("#uploadLink").on("click", () => {
        navigator.notification.confirm("On upload all local data will be erased - OK?",
            uploadData,
            'Confirmation Dialog',
            ["Confirm", "Cancel"]
        );

    });

    //if upload confirmed by user, this function is called to upload data to cloud.
    //it the deletes all local data after upload is done
    function uploadData(theIndex) {
        if (theIndex == 1) {
            if (localStorage.getItem("characters")) {
                JSON.parse(localStorage.characters).forEach(character => {
                    let dataImg = character.img;
                    let dataId = character.char_id;
                    let dataName = character.name;
                    let dataBirth = character.birthday;
                    let dataOccupation = character.occupation;
                    let dataNick = character.nickname;
                    let dataPortrayed = character.portrayed;
                    let dataCategory = character.category;

                    var doc = {
                        Img: dataImg, Id: dataId, Name: dataName, Birth: dataBirth,
                        Occupation: dataOccupation, Nickname: dataNick, Portrayed: dataPortrayed, Category: dataCategory
                    };

                    $.ajax({
                        method: "POST",
                        contentType: "application/json; charset=utf-8", // important
                        dataType: "json",
                        url: baseURL + port + "/postData",
                        data: JSON.stringify(doc)
                    }).done(function (data, statusText, xhrObj) {
                        alert("Status: " + status + "\nData: " + JSON.stringify(data));
                    }).error(function (xhr) {
                        alert("Error: " + JSON.stringify(xhr));
                    }) // end ajax    
                });
            }
            eraseLocalData();
        }
    };


    //display cloud data button action
    $('#cloudDataLink').click(() => {

        $.ajax({
            method: "GET",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            url: baseURL + port + "/getCloudData",
        }).done(function (data, statusText, xhrObj) {

            alert("Status text : " + statusText + "\nData: " + JSON.stringify(data));

            cloudData = data;

            $("body").pagecontainer("change", "#cloudDataPage", { "transition": "flip" });
        }).error(function (xhr) {
            alert("Error: " + JSON.stringify(xhr));
        }) // end ajax

    });


    document.addEventListener('deviceready', onDeviceReady, false);

});


//pagebeforeshow to load the table and information before cloud data page is displayed
$(document).on("pagebeforeshow", "#cloudDataPage", function () {

    //resets the cloud data table
    $("table#cloudDataTable tbody").empty();
    let tmpData = cloudData;

    //checks if there is any data retrieved from the cloud
    if (tmpData.length == 0) {
        $("table#cloudDataTable tbody").append("<tr><td>No Data.</td></tr>").closest("table#cloudDataTable").table("refresh").trigger("create");
    }
    //if there is data retrieved from the cloud
    //the data is loaded into the table in cloud data page 
    else {
        var html = "";

        for (var count = 0; count < tmpData.length; count++) {
            html = html + "<tr>" +
                "<td><img src='Resources/" + tmpData[count].Img + "'></td>" +
                "<td>" + tmpData[count].Id + "</td>" +
                "<td>" + tmpData[count].Name + "</td>" +
                "<td>" + tmpData[count].Birth + "</td>" +
                "<td>" + tmpData[count].Occupation + "</td>" +
                "<td>" + tmpData[count].Nickname + "</td>" +
                "<td>" + tmpData[count].Portrayed + "</td>" +
                "<td>" + tmpData[count].Category + "</td>" +
                "</tr>";
        }

        $("table#cloudDataTable tbody").append(html).closest("table#cloudDataTable").table("refresh").trigger("create");
    }

});

//adds scan button listener when device is ready
function onDeviceReady() {
    var scanBtn = document.getElementById("scan");
    scanBtn.addEventListener("click", scan);
}

//uses the barcode scanner plugin to read QR codes
function scan() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            if (!result.cancelled) {
                if (result.format == "QR_CODE") {
                    var value = JSON.parse(result.text);
                    localArray.push(value);
                    localStorage.characters = JSON.stringify(localArray);
                    navigator.notification.alert("Data saved to Local Array and Local Storage");
                }
                else {
                    var value = JSON.parse(result.text);
                    localArray.push(value);
                    localStorage.characters = JSON.stringify(localArray);
                    navigator.notification.alert("Data saved to Local Array and Local Storage");
                }
            }
        }
    )
}