var services = require("./services.js");
services.initAllPlugins();

var jwt = require("jsonwebtoken");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var allocine = require('allocine-api');

var jwtSecret= "maphrasesecrete";
var profile={
		'firstname' : 'Joan',
		'lastname' 	: 'François',
		'username'	: 'joan',
		'password'	: 'merry2017'
}

app.use(bodyParser.urlencoded({extend: false}));
app.use(bodyParser.json());

app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
	res.setHeader('Access-Control-Max-Age', '1000');
	next();
});

app.post('/login', function(req, res){
	console.log(req.body)
	if(req.body.username==profile.username && req.body.password==profile.password){
		var token= jwt.sign(profile, jwtSecret, {expiresIn : '1h'});
		res.json({'token': token});
	}else{
		res.setHeader("WWW-Authenticate", "Basic realm='need login'");
		res.sendStatus(401);
	}
});

app.get("/answers", function (req, res) {
	if(!checkedToken(req.headers.authorization)){
		res.setHeader("WWW-Authenticate", "Basic realm='need login'");
		res.sendStatus(401);
		return;
	}
	res.end(JSON.stringify({'answers': services.getAnswers()}));
});

app.get("/views", function (req, res) {
	if(!checkedToken(req.headers.authorization)){
		res.setHeader("WWW-Authenticate", "Basic realm='need login'");
		res.sendStatus(401);
		return;
	}
	res.end(JSON.stringify({'views': services.getViews()}));
});

app.post("/response/:commandId", function (req, res) {
	if(!checkedToken(req.headers.authorization)){
		res.setHeader("WWW-Authenticate", "Basic realm='need login'");
		res.sendStatus(401);
		return;
	}
	res.end(JSON.stringify({'response': services.getResponse(req.params.commandId, req.body.data)}));
});

app.post("/oauth2callback", function (req, res) {
	if(!checkedToken(req.headers.authorization)){
		res.setHeader("WWW-Authenticate", "Basic realm='need login'");
		res.sendStatus(401);
		return;
	}
	if(req.body.access_token){
		services.setAccessToken(req.body.access_token);
		res.send('Merci, vous avez désormais accès à vos services google.')
	}else{
		res.send('Erreur lors de la connection aux services googles.');
	}
});

app.get('/', function (req, res) {
	res.send('Server domotique!');
	
});
	
var server= app.listen(3000, function () {
 console.log('app listening on port 3000!');
});

var socketIoJWT = require("socketio-jwt");
var socketIo= require("socket.io");
var sio = socketIo.listen(server);

sio.set('authorization', socketIoJWT.authorize({
	secret: jwtSecret,
	handshake: true
}));

sio.sockets.on('connection', function(socket){
	var decoded = checkedToken(socket.handshake.query.token);
	if(decoded){
		console.log(decoded.username+" connected");
	}
	socket.on('disconnect', function(){
		console.log(decoded.username+" connected");
	});
});

sio.sockets.on('allocine', function(socket){
	console.log('le client envoie = ',socket);
});

setTimeout(function(){
	services.setPluginsSocket(sio);
	services.startPlugins();
}, 2500);

function checkedToken(token){
	try{
		var decoded = jwt.verify(token, jwtSecret);
		return decoded;
	}catch(err){
		return null;
	}
}