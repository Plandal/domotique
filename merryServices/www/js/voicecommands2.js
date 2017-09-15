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
	$(".app .content .checkbox").hide();
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

function configCommand(answers){

}

function homeSay(sentence){
	addToDiscution(sentence, "computerResponse");
	TTS.speak({
				text: sentence,
				locale : "fr-FR",
				rate: 0.75
			   }, function(){
					
			   },function(reason){
				   console.log("rejected : "+reason);
			   });
}