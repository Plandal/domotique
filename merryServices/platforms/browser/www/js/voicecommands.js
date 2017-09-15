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
            speed:1.0 // talk normally
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
            speed:1.0 // talk normally
        });
    },250);
}

function configCommand(answers){
	var tabIndexes = new Array();
	var commandsIds = new Array();
	var tabIndexesWithArgs = new Array();
	var commandsIdsWithArgs = new Array();
	for(i in answers){
		if(answers[i].sentence.indexOf("*")!=-1){
			tabIndexesWithArgs.push(answers[i].sentence);
			commandsIdsWithArgs.push(answers[i].commandId);
		}else{
			tabIndexes.push(answers[i].sentence);
			commandsIds.push(answers[i].commandId);
		}
	}
	var commands ={
					indexes: tabIndexes,
					action:function(i){ // var i returns the index of the recognized command in the previous array
						callBackCommand(commandsIds[i], null);
					}
				};
	artyom.addCommands(commands);
	var commandsWithArgs={
					indexes: tabIndexesWithArgs,
					smart: true,
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
				if(data.response == "OK"){
					artyom.say("OK");
				}else{
					homeSay(data.response);
				}
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
	sentence = sentence + '';
	$('.discution').append("<li class='"+className+"'>"+hour+":"+minutes+": "+sentence.replace(/\n/g, "<br/>")+"</li>");
	$('.discution').scrollTop($('.discution')[0].scrollHeight);
}