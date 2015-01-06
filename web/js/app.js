//Declare Variables
var apiKey,
    sessionId,
    token,
    archiveID;


//get the APIKEY and TOKEN 
$(document).ready(function() {

    $("#stop").hide();
    archiveID = null;

    getApiAndToken();

});


function getApiAndToken() {

    $.get(SAMPLE_SERVER_BASE_URL + "/session", function(res) {

        apiKey = res.apiKey;
        sessionId = res.sessionId;
        token = res.token;

        initializeSession();

    });

}



function initializeSession() {
    //Initialize Session Object
    var session = OT.initSession(apiKey, sessionId);



    //Subscribe to a newly created stream
    session.on('streamCreated', function(event) {
        session.subscribe(event.stream, 'subscriber', {
            insertMode: 'append',
            width: '100%',
            height: '100%'
        });
    });


    //Handler for sessionDisconnected event
    session.on('sessionDisconnected', function(event) {
        console.log("The session got disconnected", event.reason);
    });

    session.on('archiveStarted', function(event) {
        archiveID = event.id;
    });


    //Connect to the Session
    session.connect(token, function(error) {

        //If the connection is successful, initialize a publisher and publish to the session
        if (!error) {
            var publisher = OT.initPublisher('publisher', {
                insertMode: 'append',
                width: '100%',
                height: '100%'
            });

            session.publish(publisher);

        } else {

            console.log("There was an error connecting to the session", error.code, error.message);
        }

    });

}



//Start Archiving
function startArchive() {

    $.post(SAMPLE_SERVER_BASE_URL + "/start/" + sessionId);
    $("#start").hide();
    $("#stop").show();
}


//Stop Archiving
function stopArchive() {
    $.post(SAMPLE_SERVER_BASE_URL + "/stop/" + archiveID);
    $("#stop").hide();
    $("#start").show();
    $("#view").prop('disabled', false);
}


//View the Archive that was just created
function viewArchive() {
    $("#view").prop("disabled", true);

    window.open(SAMPLE_SERVER_BASE_URL + "/view/" + archiveID);

}