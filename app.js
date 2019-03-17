var express=require('express');
var app=express();
var bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
var dbo
var listOfCategory=[];
var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb+srv://admin:admin@sforums-zq5nz.mongodb.net/test?retryWrites=true";
MongoClient.prototype.insert = function(ns, ops, options, callback) {
	if(typeof options == 'function') callback = options, options = {};
	if(this.s.state == DESTROYED) return callback(new MongoError(f('topology was destroyed')));
    // Topology is not connected, save the call in the provided store to be
    // Executed at some point when the handler deems it's reconnected
    if(!this.isConnected() && this.s.disconnectHandler != null) {
    	callback = bindToCurrentDomain(callback);
    	return this.s.disconnectHandler.add('insert', ns, ops, options, callback);
    }

    executeWriteOperation(this.s, 'insert', ns, ops, options, callback);
}
var client = new MongoClient(uri, {
	useMongoClient : true,
	useNewUrlParser: true
});

client.connect(function(err, db){
	if(err) throw (err);
	dbo = db.db("sforums");	
	dbo.createCollection("categories", function(err, res) {
		if(err) throw (err);
		console.log("Collection categories created!");
	});
	dbo.createCollection("posts", function(err, res) {
		if(err) throw (err);
		console.log("Collection posts created!");
	});
	dbo.collection("categories").find({}).toArray(function(err, result) {
		if(err) throw (err);		
		for (var i = 0; i < result.length; i++) {
			listOfCategory.push(result[i].category);
		}
	});
});	
app.get("/" ,function(req,res) { 	
	res.render("forums",{categories:listOfCategory});
});
app.get("/views/home.ejs" ,function(req,res) { 	
	res.render("home.ejs",{categories:listOfCategory});
});
app.post("/postquestion",function(req,res){
	var question=req.body.post;
	console.log(req.body.specifiedcategory)
	var specifiedcategory
	if(req.body.specifiedcategory!="other"){
		specifiedcategory=req.body.specifiedcategory;
	}
	else{
		specifiedcategory=req.body.othercategory;
	}
	console.log(question,specifiedcategory);
	var myobj = { post: question, category: specifiedcategory };
	dbo.collection("posts").insertOne(myobj, function(err, res) {
		if(err) throw (err);	
		console.log("1 document inserted");
	});
	res.write("Your question has been posted");
	res.redirect("/views/home.ejs");
});
app.listen(process.env.PORT || 3000,function(req,res){
	console.log("Connected");
});
client.close()