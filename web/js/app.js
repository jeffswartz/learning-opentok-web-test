//Declare Variables

var apiKey,
	sessionId,
	token,
	response,
	session,
	publisher,
	archiveID,
	url;


//Initially hide the StopArchive and ViewArchive Buttons
$(document).ready(function(){
			$("#stop").hide();
			archiveID = null;

			getApiAndToken();
			
		});


function getApiAndToken()
{
	$.get("/session",function(res){

			apiKey = res.apiKey;
            sessionId = res.sessionId;
            token = res.token;

            initializeSession(); 

	});

}


                
function initializeSession()
{
			//Initialize Session Object
            session = OT.initSession(apiKey, sessionId);



            //session Callback handlers


            session.on("streamCreated",function(event){
        			$("#subscriber").append("<div id='subscriber_div'></div>");                              	       
					session.subscribe(event.stream,"subscriber_div",{width:"100%",height:"100%"});
            });  

            

            //Receive a message and append it to the history
            var msgHistory = document.querySelector('#history');
            session.on('signal:msg', function (event) {
                     var msg = document.createElement('p');
                     msg.innerHTML = event.data;
                     msg.className = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
                     msgHistory.appendChild(msg);
                     msg.scrollIntoView();
            }); 


            //Connect to the Session
            session.connect(token, function(error)
            	{

            		//If the connection is successful, initialize a publisher and publish to the session
            		if(!error)
            		{
            			$("#publisher").append("<div id='publisher_div'></div>");
                        publisher = OT.initPublisher("publisher_div",{width:"100%",height:"100%"});

                        session.publish(publisher);
                        
            		}

            	});


                       

}                  		

//Text Chat


var form = document.querySelector('form');
var msgTxt = document.querySelector('#msgTxt');


//Send a signal once the user enters data in the form.This will send the data entered to all participants                      
form.addEventListener('submit', function (event) {
    	event.preventDefault();
       
     	session.signal({
                			type: "msg",
               				data: msgTxt.value
                		}, function (error) {
                       	if (!error) {
                        	msgTxt.value = '';
                		}
        			}
        );
});             
                        