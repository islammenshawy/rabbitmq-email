var nr = require('newrelic');
var amqp = require('amqplib/callback_api');
var app = require('express')();
var express = require('express');
var bodyParser = require('body-parser')
var http = require('http').Server(app);
var amqp_url= process.env.RABBIT_MQ_URL
var default_queue_name = "ORDER_CONFIRM"

app.use('/static', express.static('js'))
app.use(express.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

function startPublisher(data, number_of_times = 1 , queue_name = default_queue_name){
  amqp.connect(amqp_url, function(err, conn) {
	  conn.createChannel(function(err, ch) {
	  	for (var i=0; i< number_of_times; i++){
	  		var q = queue_name;
		    ch.assertQueue(q, {durable: false});
		    // Note: on Node 6 Buffer.from(msg) should be used
		    ch.sendToQueue(q, new Buffer(JSON.stringify(data)));
		    console.log('Sent email to queue: ' + q);
	  	} 
  });
  setTimeout(function() { conn.close();}, 500);

});
}

function startListner(queue_name = default_queue_name){
	console.log("Starting Listner for queue: " + queue_name);
  amqp.connect(amqp_url, function(err, conn2) {
   conn2.createChannel(function(err, ch) {
    var q = queue_name;
    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      console.log(" [x] Received %s", msg.content.toString());
    }, {noAck: true});
  });
    setTimeout(function() { conn2.close();}, 500);
});
}

function clearQueue(queue_name = default_queue_name){
  console.log("Clearing queue: " + queue_name);
  amqp.connect(amqp_url, function(err, conn2) {
	  conn2.createChannel(function(err, ch) {
	    var q = queue_name;
	    ch.purgeQueue(q, function(err, ok) {
	      console.log("Successfuly Purged Queue: " + queue_name);
	    });
	  });
    setTimeout(function() { conn2.close();}, 500);
});
}

//Express routes
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.post('/sendemail', function(req, res){
   var msgJson = {};
   msgJson['name'] = req.body.name,
   msgJson['lastname'] = req.body.surname,
   msgJson['email']  = req.body.email,
   msgJson['phone']  = req.body.phone,
   msgJson['body']  = req.body.message;
   var repeat_count = req.body.repeattimes ? parseInt(req.body.repeattimes) : 1;
   var queue_name = req.body.gridRadios ? req.body.gridRadios : queue_name;
   console.log("Sending message to Queue " + queue_name);
   startPublisher(msgJson, repeat_count, queue_name);
   res.sendStatus(200)
});

app.get('/publish', function(req, res){
  startPublisher();
  res.redirect('/');
});

app.get('/startlistener', function(req, res){
  var queue = req.query.queue ? req.query.queue : default_queue_name;
  startListner(queue);
  res.redirect('/');
});

app.get('/clearqueue', function(req, res){
  var queue = req.query.queue ? req.query.queue : default_queue_name;
  clearQueue(queue);
  res.redirect('/');
});


http.listen(8080, function(){
  console.log('listening on *:8080');
});


//var amqp = require('amqplib/callback_api');

