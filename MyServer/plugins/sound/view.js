$("#playSoundButton").click(function(){
	if($("#playSoundButton span").hasClass("glyphicon-play")){
		callBackCommand("playSound", null);
		$("#playSoundButton span").removeClass("glyphicon-play")
								  .addClass("glyphicon-stop");
		
	}else{
		callBackCommand("stopSound", null);
		$("#playSoundButton span").removeClass("glyphicon-stop")
								  .addClass("glyphicon-play");
		
	}
});

$("#previousSoundButton").click(function(){
	callBackCommand("previousSound", null);
});

$("#nextSoundButton").click(function(){
	callBackCommand("nextSound", null);
});