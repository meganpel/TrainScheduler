var config = {
    apiKey: "AIzaSyCdMFlRcb2lTA9REYWxIXLpbFJTHkdBwVU",
    authDomain: "trainscheduler-53195.firebaseapp.com",
    databaseURL: "https://trainscheduler-53195.firebaseio.com",
    projectId: "trainscheduler-53195",
    storageBucket: "trainscheduler-53195.appspot.com",
    messagingSenderId: "981840720744"
};

firebase.initializeApp(config);

var database = firebase.database();

$("#current-time").html("Current Time: " + moment().format("hh:mm a"));

$("#add-train").on("click", function(event) {
    var trainName = $("#train-name").val().trim();
    var trainDestination = $("#train-destination").val().trim();
    var trainFirstTime = moment($("#train-first-time").val().trim(), "HH:mm").format('LT');
    var trainFrequency = $("#train-frequency").val().trim();

    var newSchedule = {
        name: trainName,
        destination: trainDestination,
        firstTime: trainFirstTime,
        frequency: trainFrequency
    };

    database.ref().push(newSchedule);

    $("#train-name").val("");
    $("#train-destination").val("");
    $("#train-first-time").val("");
    $("#train-frequency").val("");
});

database.ref().on("child_added", function(childSnapshot) {
    console.log(childSnapshot.val());

    var trainName = childSnapshot.val().name;
    var trainDestination = childSnapshot.val().destination;
    var trainFirstTime = moment(childSnapshot.val().firstTime, "HH:mm");
    var firstTime = moment(childSnapshot.val().firstTime, "HH:mm");
    var trainFrequency =  childSnapshot.val().frequency;

    var currentTime = moment();
    var nextArrival = 0;
    var minutesAway = 0;

    if (currentTime.isBefore(trainFirstTime)) {
        nextArrival = trainFirstTime;
        minutesAway = moment.duration(trainFirstTime.diff(currentTime)).asMinutes();
    } else {
        var trainFirstTimeMinutes = (trainFirstTime.hour() * 60) + trainFirstTime.minute();
        var currentTimeAsMinutes = (currentTime.hour() * 60) + currentTime.minute();
        var trainsSinceFirst =  Math.floor((trainFirstTimeMinutes - currentTimeAsMinutes) / trainFrequency) * -1;

        nextArrival = trainFirstTime.add(trainFrequency * trainsSinceFirst, 'minutes');
        minutesAway = Math.ceil(moment.duration(trainFirstTime.diff(currentTime)).asMinutes());
    }

    var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(trainDestination),
        $("<td>").text(trainFrequency),
        $("<td>").text(firstTime.format("hh:mm a")),
        $("<td>").text(nextArrival.format("hh:mm a")),
        $("<td>").text(minutesAway)
    );

    $("#train-schedule > tbody").append(newRow);
});