var apiKey;
var sessionId;
var token;

$(document).ready(function() {
  // Make an Ajax Request to get the OpenTok API key, session ID and token
  $.get(SAMPLE_SERVER_BASE_URL + '/session', function(res) {
    apiKey = res.apiKey;
    sessionId = res.sessionId;
    token = res.token;
    initializeSession();
  });
});

function initializeSession() {
  // Initialize Session object
  var session = OT.initSession(apiKey, sessionId)
    .on('streamCreated', function(event) {
      subscriber = session.subscribe(event.stream, 'subscriber', {
        insertMode: 'append',
        width: '100%',
        height: '100%'
      });
    })
    .on('sessionDisconnected', function(event) {
      console.log('You were disconnected from the session.', event.reason);
    })
    .connect(token, function(error) {
      // If the connection is successful, initialize a publisher and publish to the session
      if (!error) {
        publisher = OT.initPublisher('publisher', {
          insertMode: 'append',
          width: '100%',
          height: '100%'
        });
        session.publish(publisher);
      } else {
        console.log('There was an error connecting to the session:', error.code, error.message);
      }
    });
}
