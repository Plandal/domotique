var Plugin= require('../../models/plugin.js');
var Answer= require('../../models/answer.js');

const fs = require('fs');
function SoundPlugin(){
	Plugin.call(this);
	var soundDirectory= "C:\\Users\\Panda\\Documents\\bac +5\\domotique\\sounds";
	this.playlist= [];
	object= this;
	fs.readdir(soundDirectory, (err, files) =>{
		files.forEach(file => {
			object.playlist.push(soundDirectory+"\\"+file);
		});
	});
	this.currentSound=0;
	this.process= null;
	this.view.load(__dirname);
};

const util= require("util");
util.inherits(SoundPlugin, Plugin);

SoundPlugin.prototype.setEvents = function(events){
	this.events= events;
	var object= this;
	this.events.on("playSound", function(){
		object.getResponse("playSound", null);
	});
}

SoundPlugin.prototype.getAnswers = function(){
	return [
		new Answer("playSound", "mets du son"),
		new Answer("stopSound", "coupe le son"),
		new Answer("nextSound", "mets le son suivant"),
		new Answer("previousSound", "mets le son précédent"),
		new Answer("volumeIncreaseSound", "monte le son"),
		new Answer("volumeDecreaseSound", "baisse le son"),
	];
}

SoundPlugin.prototype.getResponse= function(commandId, data){
	switch(commandId){
		case "playSound":
			var spawn = require("child_process").spawn;
			this.process = spawn ("C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe",
								 ['-I', 'http', '--http-host=localhost',
								  '--http-port=8282', this.playlist[this.currentSound]],
								  {detached:true});
			/*console.log(this.process);
			console.log(this.playlist[this.currentSound]);
			this.process = spawn ("C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe",
								 [this.playlist[this.currentSound]],
								  {detached:true});*/
			return "OK";
		case "stopSound":
			var spawn = require("child_process").spawn;
			this.process = spawn("TASKKILL.exe", ['/F', '/IM', 'vlc.exe', '/T'])
			return "OK";
		case "nextSound":
			if(this.currentSound != this.playlist.length-1){
				this.currentSound++;
			}else{
				this.currentSound= 0;
			}
			this.getResponse("stopSound", null);
			var object = this;
			setTimeout(function(){
				object.getResponse("playSound", null);
			},500);
			return "OK";
		case "previousSound":
			if(this.currentSound != 0){
				this.currentSound--;
			}else{
				this.currentSound= this.playlist.length-1;
			}
			this.getResponse("stopSound", null);
			var object = this;
			setTimeout(function(){
				object.getResponse("playSound", null);
			},500);
			return "OK";
		case "volumeIncreaseSound":
			var url = "http://localhost:8282/requests/status.xml?command=volume&val=+10";
			var request= require("sync-request");
			request("GET", url);
			return "OK";
		case "volumeDecreaseSound":
			var url = "http://localhost:8282/requests/status.xml?command=volume&val=-10";
			var request= require("sync-request");
			request("GET", url);
			return "OK";
		default:
			return null;
	}
}

module.exports = new SoundPlugin;
