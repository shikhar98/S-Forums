var express=require('express');
var app=express();
var bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
var dbo
var posttitle="Some Of the latest Questions";
var listOfCategory=[];
var listOfPosts=[];
var categoryOfPost=[];
var lastPostId;
var answrs=[];
var searchResults=[];
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
	});posttitle
	dbo.collection("categories").find({}).toArray(function(err, result) {
		if(err) throw (err);		
		for (let i = 0; i < result.length; i++) {
			listOfCategory.push(result[i].category);
		}
	});
	dbo.collection("posts").find({}).toArray(function(err, result) {
		if(err) throw (err);		
		for (let i = 0; i < result.length; i++) {
			listOfPosts.push(result[i].post);
			categoryOfPost.push(result[i].category);
		}
	});
	dbo.collection("variables").find({}).toArray(function(err,result){
		if(err) throw err;
		lastPostId=result[0].lastpostid;
		// console.log(lastPostId);
	})	
});	
app.get("/" ,function(req,res) { 	
	res.render("forums",{categories:listOfCategory});
});
app.post("/searchquestion",function(req,res){
	var searchQuery=req.body.search;
	var searchQuery=searchQuery.toLowerCase();
	var searchKeys=searchQuery.split(" ");
	var rejectedWords=["how","why","do","you","have","has","i","what","not","if","in","out","he","she","does","is","was","it","had","were","him","her","they","them","there","their","those","whose"];
	searchResults=[];
	console.log(searchQuery);
	dbo.collection("posts").find({}).toArray(function(err,result){
		if(err) throw err;
		for(var i=0;i<result.length;i++){
			for(var j=0;j<searchKeys.length;j++){
				console.log("outside")
				if(rejectedWords.indexOf(searchKeys[j])==-1){
					console.log("first if");
					if(result[i].post.search(searchKeys[j])!=-1){
						console.log(result[i].post.indexOf(searchKeys[j]));
						console.log("second if");			
						searchResults.push(result[i]);
						break;
					}
				}
			}
		}
		console.log(searchResults);
		res.render("result",{results:searchResults,categories:listOfCategory});
	});
});
app.get("/views/home/:categoryname" ,function(req,res) {
	lastTenPosts=[];
	lastTenId=[];
	lastTenCategory=[];
	posttitle="Some Of the latest Questions";	
	if(req.params.categoryname==="homepage"){
		// console.log(result);
		lastTenPosts=[];
		lastTenId=[];
		lastTenCategory=[];
		dbo.collection("posts").find({}).sort({_id:-1}).limit(10).toArray(function(err, result) {
			for(let i=0;i<result.length;i++){
				lastTenId.push(result[i].id);
				lastTenPosts.push(result[i].post);
				lastTenCategory.push(result[i].category);			
			}
			res.render("home",{ids:lastTenId,categories:listOfCategory,posts:lastTenPosts,categoryofposts:lastTenCategory,titleofposts:posttitle});
		});
	}
	else if(req.params.categoryname==="results"){
		// console.log(result);
		res.render("resulthome",{results:searchResults});
	}
	else{
		posttitle=req.params.categoryname;
		lastTenPosts=[];
		lastTenId=[];
		lastTenCategory=[];
		dbo.collection("posts").find({category:posttitle}).toArray(function(err, result) {
			for(var i=0;i<result.length;i++){
				lastTenId.push(result[i].id);
				lastTenCategory.push(result[i].category);
				lastTenPosts.push(result[i].post);										
			}
			res.render("home",{ids:lastTenId,categories:listOfCategory,posts:lastTenPosts,categoryofposts:lastTenCategory,titleofposts:posttitle});
		});	
	}

});
app.post("/postquestion",function(req,res){
	var question=req.body.post;
	var specifiedcategory;
	if(req.body.specifiedcategory!="other"){
		specifiedcategory=req.body.specifiedcategory;
	}
	else{
		specifiedcategory=req.body.othercategory;
	}
	lastPostId++;
	var myobj = { id:lastPostId ,post: question, category: specifiedcategory,};
	dbo.collection("posts").insertOne(myobj, function(err, res) {
		if(err) throw (err);	
		console.log("1 document inserted");
	});
	var myquery = { lastpostid: lastPostId-1 };
	var newvalues = { $set: {lastpostid:lastPostId} };
	dbo.collection("variables").updateOne(myquery, newvalues, function(err, res) {
		if (err) throw err;
		console.log("1 document updated");
	});
	if(req.body.specifiedcategory=="other"){
		dbo.collection("categories").insertOne({category:specifiedcategory}, function(err, res) {
			if(err) throw (err);	
			console.log("1 document inserted");
		});
	}
	// ("your question has been posted");	
	res.redirect("/views/home/homepage")
	// res.send(app.render("home"));
});
app.get("/views/answer/:id",function(req,res){
	answrs=[];
	var postId = parseInt(req.params.id);
	// console.log(typeof postId+postId);
	// console.log("hello");
	dbo.collection("posts").find({id:postId}).toArray(function(err, result) {
		var postQuestion=result[0].post;
		// res.send("hello");
		// res.render("home1");			
		// console.log(postId);
		answrs=[];
		dbo.collection("answers").find({id:postId}).toArray(function(err, result1) {
			for(var i=0;i<result1.length;i++){
				answrs.push(result1[i].answer);
			}
			// console.log(answrs);
			res.render("answer",{id:postId,question:postQuestion,answers:answrs});			
		});
	});	
});
app.post("/postanswer",function(req,res){
	var postId=parseInt(req.body.id);
	var ans=req.body.answer;
	dbo.collection("answers").insertOne({id:postId,answer:ans},function(err,res){
		if(err) throw err;
		console.log("1 document inserted")
	})
	// window.alert("your answer has been posted");
	res.redirect("/views/answer/"+postId);
	// res.send("ITna ho gaya");
});
app.listen(process.env.PORT || 5000,function(req,res){
	console.log("Connected");
});