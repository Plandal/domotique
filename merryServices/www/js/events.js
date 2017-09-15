var socket;

function initSocket(token){
	var urlServer= "http://"+localStorage.getItem("serverHost")+":"+localStorage.getItem("serverPort");
	socket = io.connect(urlServer, {
			query: 'token='+token
	});
	 
	socket.on('say', function(msg){
		homeSay(msg);
	});
}