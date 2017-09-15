var View = require("./view.js")

function Plugin(){
	this.socket= null;
	this.events = null;
	this.view = new View();
};

Plugin.prototype.setSocket = function(socket){
	this.socket= socket;
}

Plugin.prototype.setEvents = function(events){
	this.events= events;
}

Plugin.prototype.getAnswers = function(){
	return [];
}

Plugin.prototype.getResponse= function(commandId, data){
	return null;
}

Plugin.prototype.startTasks= function(){}

module.exports = Plugin;