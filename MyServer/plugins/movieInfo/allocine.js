var Plugin= require('../../models/plugin.js');
var Answer= require('../../models/answer.js');
var allocine = require('allocine-api');

function AllocinePlugin(){
	Plugin.call(this);
	this.actived= true;
	this.title= '';
	this.synopsis= '';
	this.job;
	this.view.load(__dirname);
};

const util= require("util");
util.inherits(AllocinePlugin, Plugin);

AllocinePlugin.prototype.getAnswers = function(){
	return [
		new Answer("getMovie", "film *"),
		new Answer("movielist", "films en salle")
	];	
}

AllocinePlugin.prototype.getResponse= function(commandId, data){
	var object= this;
	switch(commandId){
		/*case "movielist":		
		allocine.api('movielist', {filter : 'nowshowing', version : 2, partner : 3, json :1 ,order : 'theatercount', page : 1, count : 25}, function(error, result) {
    	if(error) { console.log('Error : '+ error); return; }
 
    		//console.log('retour movielist');
  			//console.log(result);
  				
  		object.socket.emit('movielist', result);
		});
		break;*/
		case "getMovie":
			console.log('DATA = ',data);	
			allocine.api('search', {q: data, filter: 'movie'}, function(error, result) {
				var code = result.feed.movie.code;
				console.log('code = ',code);
				 if(error) { console.log('Error : '+ error); return; }

				allocine.api('movie', {code: code}, function(error, moreInfo) {
    			if(error) { console.log('Error : '+ error); return; }



			   
			    var obj = {result: result.feed, moreInfo: moreInfo};
			    console.log('retour movielist');
	  			console.log(obj);
			    object.socket.emit('allocineGetMovie', obj);
		    });
		});
		break;
		default:
			return null;
	}
}


const schedule = require('node-schedule');

AllocinePlugin.prototype.startTasks = function(){
	console.log("startTaskWakeUp");
	this.updateActionsSheduleTask();
}


AllocinePlugin.prototype.updateActionsSheduleTask= function(){
	var object= this;
	this.job = schedule.scheduleJob('0 '+this.minutes+' '+this.hour+' * * *', function(){
		object.socket.emit('say', "Bonjour monsieur");
		setTimeout(function(){
			object.socket.emit('say', "Il est l'heure de se lever");
			object.events.emit("playSound");
		}, 2000);
	});
}


module.exports = new AllocinePlugin;