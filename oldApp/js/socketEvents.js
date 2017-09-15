function socketEvents(socket){
	if(!socket){
		return;
	}
	
	$("#disconnectButton").click(function(e){
		socket.disconnect();
		$("#returnButton").click();
		$("#loginPanel").removeClass("closeLeftPanel").addClass("slideLeftPanel");
	});
	
	getAllCommands();
	
	socket.on('alarmStatus', function(data){
		if(data){
			$("#alarmChecked").bootstrapToggle('on');
		}else{
			$("#alarmChecked").bootstrapToggle('off');
		}
	});
	 

	socket.on('temperature', function(data){
		$(".tempValue").html(data.Temperature);
		$(".humValue").html(data.Humidite);
	});
	 
	socket.on('presence', function(data){
		if(data.presence){	
			$(".infoPresence").attr("style", "background: radial-gradient(Orange, gray)");
		}else{
			$(".infoPresence").attr("style", "background: radial-gradient(white, gray)");
		}
	});
	 
	socket.on('say', function(msg){
		homeSay(msg);
	});


	socket.on('playSound', function(msg){
		document.getElementById("sound").play()
	});
}