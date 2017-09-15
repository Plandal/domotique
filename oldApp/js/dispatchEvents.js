function initButtons(){
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
			connect_socket(result.token);
		}).fail(function(){
			$("#loadingPanel").hide();
			$("#loginMessage").html("Connection échoué");
		});
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
		userSpeak($("#textToSendInput").val());
		$("#textToSendInput").val("");
	});
	
	$("#wakeUpInputFile").change(function(e){
		var tmppath = URL.createObjectURL(e.target.files[0]);
		localStorage.setItem("wakeUpFile", tmppath);
		playFile(this);
	});
	
	$("#alarmChecked").parent().on('click', function(e){
		if(!$("#alarmChecked").is(':checked')){
			callBackCommand("activeAlarm", null);
		}else{
			callBackCommand("unactiveAlarm", null);
		}
	});

	$("#alarmChecked").change(function(e){
		if($("#alarmChecked").is(':checked')){
			$("#alarmChecked").parent().next('span').html('Mode alarm activé');
		}else{
			$("#alarmChecked").parent().next('span').html('Mode alarm desactivé');
		}
	});
}

function connect_socket (token) {
	var url= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort");
	var socket = 	io.connect(url, {
						query: 'token=' + token
					});
	socketEvents(socket);
}


function playFile(obj) {
	var sound = document.getElementById('sound');
	var reader = new FileReader();
	reader.onload = (function(audio) {return function(e) {
			audio.src = e.target.result;
	};})(sound);
	reader.addEventListener('load', function() {
		//document.getElementById("sound").play();
	});
	reader.readAsDataURL(obj.files[0]);
}

function initAutocomplete(){
	var suggestions= new Array();
	var allCommands = JSON.parse(localStorage.getItem("allCommands"));
	for(i in allCommands){
		var row="{\"value\":\""+allCommands[i].answer+"\",";
		row+="\"data\":\""+allCommands[i].id+"\"}";
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