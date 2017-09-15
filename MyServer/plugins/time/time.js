var Plugin= require('../../models/plugin.js');
var Answer= require('../../models/answer.js');

function TimePlugin(){
	Plugin.call(this);
};

const util= require("util");
util.inherits(TimePlugin, Plugin);

TimePlugin.prototype.getAnswers = function(){
	return [
		new Answer("time", "il est quelle heure")
	];
}

TimePlugin.prototype.getResponse= function(commandId, data){
	switch(commandId){
		case "time":
			var now= new Date();
			return "Il est "+now.getHours()+" heures "+now.getMinutes();
		default:
			return null;
	}
}

module.exports = new TimePlugin;