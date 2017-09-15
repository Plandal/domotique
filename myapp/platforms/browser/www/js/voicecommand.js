var socket = io.connect('http://localhost:3000');
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

artyom.redirectRecognizedTextOutput(function(recognized,isFinal){
	if(isFinal)
		console.log("listen: " + recognized);
});

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


function allocine(str){
	console.log('str = ',str);
	/*var url = "http://api.allocine.fr/rest/v3/search"
	var obj = {};
	obj.q = str;
	obj.partner = 'QUNXZWItQWxsb0Npbuk';
	var Json = JSON.stringify(obj);
		console.log('Json = ',Json);
	$.ajax({
		type: 'GET',
		url: url,
		dataType: 'json',
		data: Json,
		success: function(data) {
				console.log("SUCCES : " + data.response);
		},
		error: function(err) {
			console.log("ERROR = ",err);
			$("#disconnectButton").click();
		}
	});*/
	socket.emit('allocine', str);

}


function callBackCommand(commandId, param){
	var commandUrl= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort")+'/response/'+commandId;
	console.log('commandUrl = ',commandUrl);
	$.ajax({
		type: 'POST',
		url: commandUrl,
		dataType: 'json',
		data: {data: param},
		headers : {'Authorization':localStorage.getItem("serverToken")},
		success: function(data) {
				console.log("Response: " + data.response);
				artyom.say(data.response);
				
		},
		error: function() {
			console.log("error post server command");
			$("#disconnectButton").click();
		}
	});
}