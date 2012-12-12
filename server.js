//JSHint globals
/*global Ember:true,_:true,require:true,__dirname:true, process:true*/

var __client_path = __dirname + "/" + "client";



var express = require('express');

var app = express();

// configure Express
app.configure(function() {
	//app.use(express.logger());
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({ secret: 'keyboard cat' }));
	app.use(app.router);
	app.use(express.static(__dirname + '/../../public'));
});

app.configure('development', function(){
	console.log(__dirname);
	app.use(express.static(__dirname) );
});

var isJson = function(req){
	//ref: http://expressjs.com/api.html#req.is
	return req.is('json') || req.is('application/json') || req.is('application/*');
};

var isHtml = function(req){
	return req.is('html') || req.is('text/html') || req.is('text/*');
};

app.get('/jsclock', function(req, res){
	console.log("jsclock");
	var epoch = Date.now();
	
	console.log( "type:"+req.get('Content-Type') );

	res.send({ epoch: epoch });
	
});

var test = function(){
	var now = new Date();
	console.log( now.getMilliseconds());
	setTimeout( test, 50 );
};

//test();




app.listen(8001);

