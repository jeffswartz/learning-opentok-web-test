//Declare Variables
var apiKey,
    sessionId,
    token;

//get the APIKEY and TOKEN 
$(document).ready(function() {
    getApiAndToken();
});


function getApiAndToken() {
    //make an Ajax Request to get the apiKey, sessionId and token from the server
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

    //Receive a message and append it to the history
    var msgHistory = document.querySelector('#history');
    session.on('signal:chat', function(event) {
        var msg = document.createElement('p');
        msg.innerHTML = event.data;
        msg.className = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
        msgHistory.appendChild(msg);
        msg.scrollIntoView();
    });

}


//Text Chat
var form = document.querySelector('form');
var msgTxt = document.querySelector('#msgTxt');

//Send a signal once the user enters data in the form.This will send the data entered to all participants                      
form.addEventListener('submit', function(event) {
    event.preventDefault();

    session.signal({
        type: 'chat',
        data: msgTxt.value
    }, function(error) {
        if (!error) {
            msgTxt.value = '';
        }
    });
});
