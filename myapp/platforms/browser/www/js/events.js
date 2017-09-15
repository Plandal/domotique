var urlServer="http://localhost:3000";
var socket;
function initSocket(token){
	 socket = io.connect(urlServer, {
			query: 'token='+token
	});
	
	socket.on('say', function(msg){
		artyom.say(msg);
	});

}