function Services(){
	this.allPlugins= [];
}

const fs = require('fs');

Services.prototype.initAllPlugins = function(){
	var pluginsFolder= "./plugins";
	this.allPlugins= [];
	fs.readdir(pluginsFolder, (err, files) =>{
		files.forEach(file => {
			console.log("load plugin ... "+file);
			var tmpPlugin= require(pluginsFolder+"/"+file+"/"+file+".js");
			this.allPlugins.push(tmpPlugin);
		});
	});
}

Services.prototype.getAnswers= function(){
	var allAnwsers= new Array();
	for(i in this.allPlugins){
		for(j in this.allPlugins[i].getAnswers()){
			allAnwsers.push(this.allPlugins[i].getAnswers()[j]);
		}
	}
	return allAnwsers;
}


Services.prototype.getViews= function(){
	var allViews = new Array();
	for(i in this.allPlugins){
		if(this.allPlugins[i].view.html!=""){
			var object = {
				"name": this.allPlugins[i].constructor.name,
				"view": this.allPlugins[i].view
			}
			allViews.push(object);
		}
	}	
	return allViews;
}
 
Services.prototype.getResponse = function(id, data){
	for(i in this.allPlugins){
		var response= this.allPlugins[i].getResponse(id, data);
		if(response) break;
	}
	return response;
}


Services.prototype.setAccessToken = function(token){
	for(i in this.allPlugins){
		if(this.allPlugins[i].setAccessToken){
			this.allPlugins[i].setAccessToken(token);
		}
	}
}

var EventEmitter = require('events');
Services.prototype.setPluginsSocket = function(socket){
	var events= new EventEmitter();
	for(i in this.allPlugins){
		this.allPlugins[i].setSocket(socket);
		this.allPlugins[i].setEvents(events);
	}
}

Services.prototype.startPlugins = function(){
	for(i in this.allPlugins){
		this.allPlugins[i].startTasks();
	}
}

module.exports = new Services;