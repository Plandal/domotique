function sendCommandOfAnswer(sentence){
	var tempSentence= sentence+"";
	var commandIsFind= false;
	var allCommands = JSON.parse(localStorage.getItem("allCommands"));
	console.log("sendCommandOfAnswer "+sentence);
	for(i in allCommands){
		var answer= allCommands[i].sentence+"";
		if(answer.trim().toUpperCase()==tempSentence.trim().toUpperCase()){
			commandIsFind=true;
			callBackCommand(allCommands[i].commandId, null);
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
				callBackCommand(allCommands[i].commandId, tempData);
			}
		}
	}
	console.log("commandIsFind "+commandIsFind);
	return commandIsFind;
}


function getAnswers(){
	$("#loadingPanel").show();
	var urlServer= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort")+'/answers';
	$.ajax({
		type: 'GET',
		url: urlServer,
		dataType: 'json',
		headers : {'Authorization':localStorage.getItem("serverToken")},
		success: function(data){
			localStorage.setItem("allCommands", JSON.stringify(data.answers));
			configCommand(data.answers);
			initAutocomplete(data.answers);
			$("#loadingPanel").hide();
		},
		error: function(){
			console.log("error get server answers");
			$("#loadingPanel").hide();
		}
	});
}

function initAutocomplete(allCommands){
	var suggestions= new Array();
	for(i in allCommands){
		var row="{\"value\":\""+allCommands[i].sentence+"\",";
		row+="\"data\":\""+allCommands[i].commandId+"\"}";
		suggestions.push(JSON.parse(row));
	}
	$("#textToSendInput").autocomplete({
		lookup: suggestions,
		onSelect: function (suggestion) {
			$("#textToSendInput").val(suggestion.value);
			if(suggestion.value.indexOf("*")!=-1){
				$("#textToSendInput").val(suggestion.value.substr(0, suggestion.value.length-1));
				$("#textToSendInput").focus();
			}
		}
	});
}

function getViews(){
	$("#loadingPanel").show();
	var urlServer= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort")+'/views';
	$.ajax({
		type: 'GET',
		url: urlServer,
		dataType: 'json',
		headers : {'Authorization':localStorage.getItem("serverToken")},
		success: function(data){
			var html="";
			for(i in data.views){
				console.log(data.views[i]);
				html+= "<div class='plugin "+data.views[i].name+"'>\n";
				html+= data.views[i].view.html+"\n";
				html+= "</div>\n";
				html+= "<script type='text/javascript'>\n"+data.views[i].view.script+"</script>\n";
			}
			//console.log(html);
			$("#pluginsPanel").html(html);
			$("#loadingPanel").hide();
		},
		error: function(){
			console.log("error get server views");
			$("#loadingPanel").hide();
		}
	});
}


function initButtons(){
	$("#voiceButton").click(function(){
		recognizeSpeech();
	});
	
	$("#pluginsButton").click(function(){
		$("#pluginPanel").removeClass("closeLeftPanel").addClass("slideLeftPanel");
	});
	
	$("#pluginsCloseButton").click(function(){
		$("#pluginPanel").removeClass("slideLeftPanel").addClass("closeLeftPanel");
	});
	
	$('#connectionButton').click(function (e) {
		e.preventDefault();
		$("#loadingPanel").show();
		localStorage.setItem("serverHost", $("#serverHostInput").val());
		localStorage.setItem("serverPort", $("#serverPortInput").val());
		localStorage.setItem("serverUsername", $("#username").val());
		localStorage.setItem("serverPassword", $("#password").val());
		var url= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort")+'/login';
		$.post(url, {
			username: $('#username').val(),
			password: $('#password').val()
		}).done(function (result) {
			$("#loadingPanel").hide();
			$("#loginPanel").addClass("closeLeftPanel").removeClass("slideLeftPanel");
			$("#loginMessage").html("");
			localStorage.setItem("serverToken", result.token);
			initSocket(result.token);
			connectGoogleServices();
			getAnswers();
			getViews();
		}).fail(function(){
			$("#loadingPanel").hide();
			$("#loginMessage").html("Connection échoué");
		});
	});
	
	$("#disconnectButton").click(function(e){
		socket.disconnect();
		$("#returnButton").click();
		$("#loginPanel").removeClass("closeLeftPanel").addClass("slideLeftPanel");
	});
	
	$("#barsButton").click(function(e){
		$("#sidePanel").removeClass("closeLeftPanel").addClass("slideLeftPanel");
	});
	
	$("#returnButton").click(function(e){
		$("#sidePanel").removeClass("slideLeftPanel").addClass("closeLeftPanel");
	});
	
	$(".full-circle").click(function(e){
		recognizeSpeech();
	});
	
	$("#buttonToSendInput").click(function(e){
		addToDiscution( $("#textToSendInput").val(), "userResponse");
		sendCommandOfAnswer($("#textToSendInput").val());
		$("#textToSendInput").val("");
	});
}

function configLoad(){	
	$("#serverHostInput").val(localStorage.getItem("serverHost"));
	$("#serverPortInput").val(localStorage.getItem("serverPort"));
	$("#username").val(localStorage.getItem("serverUsername"));
	$("#password").val(localStorage.getItem("serverPassword"));
}

function connectGoogleServices(){
	
	var url="https://accounts.google.com/o/oauth2/v2/auth?";
		url+="scope=email profile https://www.googleapis.com/auth/calendar&";
		url+="state=profile&";
		url+="redirect_uri=http://localhost:8000/oauth2callback.html&";
		url+="response_type=token&";
		url+="client_id=572232827785-oqinqhq9oth137e8hgqkuao9dr42svsm.apps.googleusercontent.com";
	window.open(url,'_blank');
}