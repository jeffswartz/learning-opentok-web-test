var apiKey;
var session;
var sessionId;
var token;
var publisher;
var recognition;
var publisherSubtitlesClearTimer;
var subscriberSubtitlesClearTimer;
var subscriber;

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
  session = OT.initSession(apiKey, sessionId)
    .on('streamCreated', function(event) {
      subscriber = session.subscribe(event.stream, 'subscriber', {
        insertMode: 'append',
        width: '100%',
        height: '100%'
      });
      var subtitlesElement = document.createElement('div');
      subtitlesElement.id = 'subscriber-subtitles';
      subtitlesElement.className = 'ot_subtitles';
      // This is a workaround for a Chrome bug not picking up the CSS from the style declaration:
      subtitlesElement.style['color'] = 'yellow';
      subscriber.element.appendChild(subtitlesElement);
    })
    .on('sessionDisconnected', function(event) {
      console.log('You were disconnected from the session.', event.reason);
    })
    .on('signal:ot-subtitler', function(event) {
      if (subscriber && subscriber.stream.connection.connectionId === event.from.connectionId) {
        console.log(event);
        var subtitlesElement = document.getElementById('subscriber-subtitles');
        subtitlesElement.innerText = event.data;
        clearTimeout(subscriberSubtitlesClearTimer);
        subscriberSubtitlesClearTimer = setTimeout(function() {
          subtitlesElement.innerText = ' ';
        }, 5000);
      }
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
        var subtitlesElement = document.createElement('div');
        subtitlesElement.className = 'ot_subtitles';
        subtitlesElement.id = 'publisher-subtitles';
        // This is a workaround for a Chrome bug not picking up the CSS from the style declaration:
        subtitlesElement.style['color'] = 'yellow';
        publisher.element.appendChild(subtitlesElement);

        startRecognition();
      } else {
        console.log('There was an error connecting to the session:', error.code, error.message);
      }
    });
}

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.lang = 'en';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = function(event) {
    for (var i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        var subtitlesStr = event.results[i][0].transcript.toUpperCase();
        var subtitlesElement = document.getElementById('publisher-subtitles');
        subtitlesElement.innerText = subtitlesStr;
        session.signal({
          type: 'ot-subtitler',
          data: subtitlesStr
        });
        clearTimeout(publisherSubtitlesClearTimer);
        publisherSubtitlesClearTimer = setTimeout(function() {
          subtitlesElement.innerText = ' ';
        }, 5000);
      }
    }
  };

  recognition.start();
}
