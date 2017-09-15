function View(){
	this.script = "";
	this.html ="";
}

View.prototype.load= function(filename){
	var fs= require("fs");
	if(fs.existsSync(filename+"/view.html")){
		this.html= fs.readFileSync(filename+"/view.html", "utf8");
	}
	if(fs.existsSync(filename+"/view.js")){
		this.script= fs.readFileSync(filename+"/view.js", "utf8");
	}
}

module.exports= View;