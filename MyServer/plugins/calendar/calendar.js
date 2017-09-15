var Plugin= require('../../models/plugin.js');
var Answer= require('../../models/answer.js');

function CalendarPlugin(){
	Plugin.call(this);
	this.access_token=null;
	this.eventsList= null;
};

const util= require("util");
util.inherits(CalendarPlugin, Plugin);


CalendarPlugin.prototype.setAccessToken = function(token){
		this.access_token= token;
		this.getEventsList(this.access_token);
}

CalendarPlugin.prototype.getAnswers = function(){
	return [
		new Answer("calendarEventList", "quels sont les événements à venir")
	];
}

CalendarPlugin.prototype.getResponse= function(commandId, data){
	switch(commandId){
		case "calendarEventList":
			return this.parseEventsList();
		default:
			return null;
	}
}

CalendarPlugin.prototype.getEventsList = function(token){
	var gcal = require("google-calendar");
	var google_calendar = new gcal.GoogleCalendar(token);
	var object= this;
	google_calendar.calendarList.list(function(err, calendarList){
		console.log(calendarList.items[0].id);
		var options={
			timeMin: (new Date()).toISOString(),
			maxResults: 10,
			singleEvents: true,
			orderBy: 'startTime',
		};
		google_calendar.events.list(calendarList.items[0].id, options, function(err, eventsList){
			object.eventsList= eventsList;	
		});
	});
}

CalendarPlugin.prototype.parseEventsList= function(){
	if(this.eventsList){
		var response= "Les événement à venir sont:\n";
		var date = require('date-and-time');
		date.locale('fr');  // French 
		for(i in this.eventsList.items){
			response+= this.eventsList.items[i].summary+"\n";
			if(this.eventsList.items[i].start.datetime){
				var startDate= new Date(this.eventsList.items[i].start.datetime);
				response+= "le "+date.format(startDate, "dddd D MMMM à HH [heure] mm")+"\n"
			}if(this.eventsList.items[i].start.date){
				var startDate= new Date(this.eventsList.items[i].start.date);
				response+= "le "+date.format(startDate, "dddd D MMMM")+"\n"
			}
		}
		return response;
	}else{
		return "aucun événements";
	}

}

module.exports = new CalendarPlugin;