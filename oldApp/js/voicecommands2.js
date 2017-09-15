$(".app .checkbox").hide();

// Check to see if a recognition activity is present
function checkSpeechRecognition() {
	window.plugins.speechrecognizer.checkSpeechRecognition(function(){
		$(".speachSyntheseSupport").removeClass("btn-danger").addClass("btn-success");
		$(".speachSyntheseSupport").html("Synthese vocal OK");
		$(".speachRecogniseSupport").removeClass("btn-danger").addClass("btn-success");
		$(".speachRecogniseSupport").html("Reconnaissance vocal OK");
	}, function(){
		$(".speachSyntheseSupport").removeClass("btn-success").addClass("btn-danger");
		$(".speachSyntheseSupport").html("Synthese vocal KO");
		$(".speachRecogniseSupport").removeClass("btn-success").addClass("btn-danger");
		$(".speachRecogniseSupport").html("Reconnaissance vocal KO");
	});
}

function recognizeSpeech() {
	var maxMatches = 1;
	var promptString = "Je t'écoute"; // optional
	var language = "fr-FR"; // optional
	window.plugins.speechrecognizer.startRecognize(function(result){
		userSpeak(result);
	}, function(errorMessage){
		console.log("Error message: " + errorMessage);
	}, maxMatches, promptString, language);
}


function userSpeak(sentence){
	addToDiscution( sentence, "userResponse");
	var reponseFind= searchCommandOfAnswer(sentence);
	if(!reponseFind){
		homeSay("Je ne comprend pas");
	}
}

function addToDiscution(sentence, className){
	var date= new Date();
	var minutes = date.getMinutes();
	var hour = date.getHours();
	$('.discution').append("<li class='"+className+"'>"+hour+":"+minutes+": "+sentence+"</li>");
	$('.discution').scrollTop($('.discution')[0].scrollHeight);
}

function getAllCommands(){
	$("#loadingPanel").show();
	var urlServer= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort")+'/answers';
	$.ajax({
		type: 'GET',
		url: urlServer,
		dataType: 'json',
		headers: {"Authorization": localStorage.getItem('serverToken')},
		success: function(data) {
			$("#loadingPanel").hide();
			localStorage.setItem("allCommands", JSON.stringify(data.answers));
			initAutocomplete();
		},
		error: function() {
			console.log("error get server answers");
			$("#disconnectButton").click();
		}
	});
}

function searchCommandOfAnswer(sentence){
	var tempSentence= sentence+"";
	var commandIsFind= false;
	var allCommands = JSON.parse(localStorage.getItem("allCommands"));
	for(i in allCommands){
		if(commandIsFind){
			continue;
		}
		var answer= allCommands[i].answer+"";
		if(answer.trim().toUpperCase()==tempSentence.trim().toUpperCase()){
			commandIsFind=true;
			callBackCommand(allCommands[i].id, null);
		}else if(answer.indexOf("*")!=-1){
			var tempCmd= answer.substr(0, answer.indexOf("*"));
			if(answer.indexOf("*")<tempSentence.length){
				var tempData= tempSentence.substr(answer.indexOf("*"));
			}else{
				var tempData= "error";
			}
			var testSentence= tempCmd+tempData;
			if(testSentence.trim().toUpperCase()==tempSentence.trim().toUpperCase()){
				commandIsFind=true;
				callBackCommand(allCommands[i].id, tempData);
			}
		}
	}
	return commandIsFind;
}

function callBackCommand(commandId, param){
	var commandUrl= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort")+'/response/'+commandId;
	console.log(commandUrl);
	$(".full-circle").addClass('rotate');
	$.ajax({
		type: 'POST',
		url: commandUrl,
		dataType: 'json',
		data: {data: param},
		headers: {"Authorization": localStorage.getItem('serverToken')},
		success: function(data) {
			$(".full-circle").removeClass('rotate');
			console.log("Response: " + data.response);
			homeSay(data.response);
		},
		error: function() {
			$(".full-circle").removeClass('rotate');
			console.log("error post server command");
			$("#disconnectButton").click();
		}
	});
}

function homeSay(sentence){
	addToDiscution(sentence, "computerResponse");
	TTS.speak(sentence);
}


function controleHeadsetButton(){
	MusicControls.create({
		// hide previous/next/close buttons:
			hasPrev   : false,      // show previous button, optional, default: true
			hasNext   : false,      // show next button, optional, default: true
			// Android only, optional
			// text displayed in the status bar when the notification (and the ticker) are updated
			ticker    : 'RoomWatch'
		}, 
		function(e){
			
		},
		function(e){
			
		}
	);
	// Register callback 
	MusicControls.subscribe(eventMediaButton); 
	// Start listening for events 
	// The plugin will run the events function each time an event is fired 
	MusicControls.listen();
}

function eventMediaButton(action) {
	switch(action) {
		// Headset events (Android only) 
		case 'music-controls-media-button' :
			// Do something 
			recognizeSpeech();
			break;
		default:
			break;
	}
}