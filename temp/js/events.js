var urlServer="http://localhost:3000";

function initSocket(token){
	var socket = io.connect(urlServer, {
			query: 'token='+token
	});
	
	socket.on('say', function(msg){
		artyom.say(msg);
	});
}