
function getAnswers(){
	$("#loadingPanel").show();
	var urlServer= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort")+'/answers';
	$.ajax({
		type: 'GET',
		url: urlServer,
		dataType: 'json',
		headers : {'Authorization':localStorage.getItem("serverToken")},
		success: function(data){
			configCommand(data.answers);
			$("#loadingPanel").hide();
		},
		error: function(){
			console.log("error get server answers");
			$("#loadingPanel").hide();
		}
	});
}


function initButton(){
	$("#voiceButton").click(function(){
		recognizeSpeech();
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
			getAnswers();
		}).fail(function(){
			$("#loadingPanel").hide();
			$("#loginMessage").html("Connection échoué");
		});
	});
}

function configLoad(){	
	$("#serverHostInput").val(localStorage.getItem("serverHost"));
	$("#serverPortInput").val(localStorage.getItem("serverPort"));
	$("#username").val(localStorage.getItem("serverUsername"));
	$("#password").val(localStorage.getItem("serverPassword"));
}