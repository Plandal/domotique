function checkSpeechRecognition(){
	if(artyom.speechSupported){
		$(".speachSyntheseSupport").removeClass("btn-danger").addClass("btn-success");
		$(".speachSyntheseSupport").html("Synthese vocal OK");
	}else{
		$(".speachSyntheseSupport").removeClass("btn-success").addClass("btn-danger");
		$(".speachSyntheseSupport").html("Synthese vocal KO");
	}

	if(artyom.recognizingSupported ){
		$(".speachRecogniseSupport").removeClass("btn-danger").addClass("btn-success");
		$(".speachRecogniseSupport").html("Reconnaissance vocal OK");
	}else{
		$(".speachRecogniseSupport").removeClass("btn-success").addClass("btn-danger");
		$(".speachRecogniseSupport").html("Reconnaissance vocal KO");
	}
}

$("#listenContinueChecked").change(function(e){
	if($("#listenContinueChecked").is(':checked')){
		$("#listenContinueChecked").parent().next('span').html('Ecoute continue activé');
		startContinuousArtyom();
	}else{
		$("#listenContinueChecked").parent().next('span').html('Ecoute continue désactivé');
		artyom.fatality();
	}
});

artyom.redirectRecognizedTextOutput(function(recognized,isFinal){
    if(isFinal){
        console.log("Say: " + recognized);
		addToDiscution( recognized, "userResponse");
    }
});


function recognizeSpeech(){
    artyom.fatality();// use this to stop any of

    setTimeout(function(){// if you use artyom.fatality , wait 250 ms to initialize again.
			artyom.initialize({
            lang:"fr-FR",// A lot of languages are supported. Read the docs !
            continuous:false,// recognize 1 command and stop listening !
            listen:true, // Start recognizing
            debug:false, // Show everything in the console
            speed:1.5 // talk normally
        });
    },250);
}

function startContinuousArtyom(){
    artyom.fatality();// use this to stop any of

    setTimeout(function(){// if you use artyom.fatality , wait 250 ms to initialize again.
         artyom.initialize({
            lang:"fr-FR",// A lot of languages are supported. Read the docs !
            continuous:true,// Artyom will listen forever
            listen:true, // Start recognizing
            debug:false, // Show everything in the console
            speed:1.5 // talk normally
        });
    },250);
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
			parseDataAnswers(data);
			localStorage.setItem("allCommands", JSON.stringify(data.answers));
			initAutocomplete();
			$("#loadingPanel").hide();
		},
		error: function() {
			console.log("error get server  answers");
			$("#disconnectButton").click();
		}
	});
}

function parseDataAnswers(data){
	var tabIndexes = new Array();
	var commandsIds = new Array();
	var tabIndexesWithArgs = new Array();
	var commandsIdsWithArgs= new Array();
	for(i in data.answers){
		if(data.answers[i].answer.indexOf("*")!=-1){
			tabIndexesWithArgs.push(data.answers[i].answer);
			commandsIdsWithArgs.push(data.answers[i].id);
		}else{
			tabIndexes.push(data.answers[i].answer);
			commandsIds.push(data.answers[i].id);// These spoken words will trigger the execution of the command
		}
	}
	var commands ={
					indexes: tabIndexes,
					action:function(i){ // var i returns the index of the recognized command in the previous array
						callBackCommand(commandsIds[i], null);
					}
				};
	artyom.addCommands(commands);
	var commandsWithArgs ={
					indexes: tabIndexesWithArgs,
					smart:true,
					action:function(i, wildcard){ // var i returns the index of the recognized command in the previous array
						callBackCommand(commandsIdsWithArgs[i], wildcard);
					}
				};
	artyom.addCommands(commandsWithArgs);
}

function callBackCommand(commandId, param){	
	$(".full-circle").addClass('rotate');
	var commandUrl= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort")+'/response/'+commandId;
	$.ajax({
		type: 'POST',
		url: commandUrl,
		dataType: 'json',
		data: {data: param},
		headers: {"Authorization": localStorage.getItem('serverToken')},
		success: function(data) {
				console.log("Response: " + data.response);
				homeSay(data.response);
				$(".full-circle").removeClass('rotate');
		},
		error: function() {
			console.log("error post server command");
			$("#disconnectButton").click();
		}
	});
}

function homeSay(sentence){
	addToDiscution(sentence, "computerResponse");
	artyom.say(sentence);
}

function addToDiscution(sentence, className){
	var date= new Date();
	var minutes = date.getMinutes();
	var hour = date.getHours();
	$('.discution').append("<li class='"+className+"'>"+hour+":"+minutes+": "+sentence+"</li>");
	$('.discution').scrollTop($('.discution')[0].scrollHeight);
}

function userSpeak(sentence){
	addToDiscution( sentence, "userResponse");
	var reponseFind= searchCommandOfAnswer(sentence);
	if(!reponseFind){
		homeSay("Je ne comprend pas");
	}
}

function searchCommandOfAnswer(sentence){
	var tempSentence= sentence+"";
	var commandIsFind= false;
	var allCommands = JSON.parse(localStorage.getItem("allCommands"));
	for(i in allCommands){
		if(allCommands[i].answer==sentence){
			commandIsFind=true;
			callBackCommand(allCommands[i].id, null);
		}else if(allCommands[i].answer.indexOf("*")!=-1){
			var tempCmd= allCommands[i].answer.substr(0, allCommands[i].answer.indexOf("*"));
			if(allCommands[i].answer.indexOf("*")<tempSentence.length){
				var tempData= tempSentence.substr(allCommands[i].answer.indexOf("*"));
			}else{
				var tempData= "error";
			}
			var testSentence= tempCmd+tempData;
			if(testSentence==sentence){
				commandIsFind=true;
				callBackCommand(allCommands[i].id, tempData);
			}
		}
	}
	return commandIsFind;
}