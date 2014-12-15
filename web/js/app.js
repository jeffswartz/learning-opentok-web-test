//Declare Variables

var apiKey,
      sessionId,
      token,
      response,
      session,
      publisher,
    archiveID,
    url;


//get the APIKEY and TOKEN 
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



            //CallBack Handlers
            session.on("streamCreated",function(event){
                        $("#subscriber").append("<div id='subscriber_div'></div>");                                      
                              session.subscribe(event.stream,"subscriber_div",{width:"100%",height:"100%"});
            });  

            session.on("archiveStarted",function(event){
                     archiveID = event.id;
                     console.log("Archive Started"+archiveID);
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



//Start Archiving
function startArchive()
{
                        
        $.post("/start/"+sessionId);
        $("#start").hide();
        $("#stop").show();
}

                
//Stop Archiving
function stopArchive()
{
        $.post("/stop/"+archiveID);
        $("#stop").hide();
        document.getElementById("view").disabled=false;
} 

        
//Download and View Archive
function viewArchive()
{
        $.post("/view/"+archiveID,function(res){
                console.log(res);
                url = res.archiveUrl;
                window.open(url);
        });
                
                
        $("#start").show();
        $("#view").hide();

}                             

