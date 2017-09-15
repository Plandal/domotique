var Plugin= require('../../models/plugin.js');
var Answer= require('../../models/answer.js');

function WakeUpPlugin(){
	Plugin.call(this);
	this.actived= true;
	this.hour= 9;
	this.minutes= 30;
	this.job;
};

const util= require("util");
util.inherits(WakeUpPlugin, Plugin);

WakeUpPlugin.prototype.getAnswers = function(){
	return [
		new Answer("whattimewakeup", "quelle est l'heure du réveil"),
		new Answer("changewakeup", "mets le réveil à *")
	];
}

WakeUpPlugin.prototype.getResponse= function(commandId, data){
	switch(commandId){
		case "whattimewakeup":
			var response= "le réveil est réglé sur "+this.hour+" heure";
			if(this.minutes){
				response+= " "+this.minutes;
			}
			return response;
		case "changewakeup":
			if(data.indexOf("h")!=-1){
				this.hour = parseInt(data.substr(0, data.indexOf("h")));
				if(data.length-1>data.indexOf("h")){
					this.minutes = parseInt(data.substr(data.indexOf("h")+1, data.length-data.indexOf("h")));
				}else{
					this.minutes= 0;
				}
				if(this.job){
					this.job.cancel();
				}
				this.updateActionsSheduleTask();
				return "ok";
			}else
				return "données incorrect";
		default:
			return null;
	}
}


const schedule = require('node-schedule');

WakeUpPlugin.prototype.startTasks = function(){
	console.log("startTaskWakeUp");
	this.updateActionsSheduleTask();
}


WakeUpPlugin.prototype.updateActionsSheduleTask= function(){
	var object= this;
	this.job = schedule.scheduleJob('0 '+this.minutes+' '+this.hour+' * * *', function(){
		object.socket.emit('say', "Bonjour monsieur");
		setTimeout(function(){
			object.socket.emit('say', "Il est l'heure de se lever");
			object.events.emit("playSound");
		}, 2000);
	});
}


module.exports = new WakeUpPlugin;