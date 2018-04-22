var nr = require('newrelic');
var amqp = require('amqplib/callback_api');
var app = require('express')();
var express = require('express');
var bodyParser = require('body-parser')
var http = require('http').Server(app);
const sgMail = require('@sendgrid/mail');

//Configuration for basic app server
var amqp_url= process.env.RABBIT_MQ_URL
var default_queue_name = "ORDER_CONFIRM"
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);
app.use('/static', express.static('build'))
app.use(express.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

//Quick simulation of dead exchange due to lake of time. Proper way to setup dead exchange is discussed online.
function sendToErrorQueue(emailData, queue_name){
  amqp.connect(amqp_url, function(err, conn) {
    conn.createChannel(function(err, ch) {
        var q = queue_name + "_ERROR";
        ch.assertQueue(q, {durable: false});
        // Note: on Node 6 Buffer.from(msg) should be used
        ch.sendToQueue(q, new Buffer(JSON.stringify(emailData)));
        console.log('Sent message data to ERROR Queue: ' + q);
  });
  setTimeout(function() { conn.close();}, 500);

});
}

function isValidMessage(emailData, queue_name){
  if(emailData.sms && !emailData.phone){
    console.log("Error sending message as sms without phone.")
    sendToErrorQueue(emailData, queue_name);
    return false;
  }
  return true;
}

//Function to send email messages to email.
function sendEmailMsg(emailData, queue_name = default_queue_name){
  if(isValidMessage(emailData, queue_name)){
      var email = emailData.email,
      name = emailData.name,
      lastname = emailData.lastname,
      phone = emailData.phone,
      sms = emailData.sms,
      body = emailData.body;
      var subject = "Email from RabbitMQ Queue: " + queue_name;
      const msg = {
        to: email,
        from: 'prog.islam@gmail.com',
        subject: subject,
        text: body,
        html: '<strong>This is a test email sent from RabbitMQ.</strong>',
        };
      sgMail.send(msg);
  }
}

function sendToPublisher(data, number_of_times = 1 , queue_name = default_queue_name){
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

function invokeListener(queue_name = default_queue_name){
	console.log("Starting Listner for queue: " + queue_name);
  amqp.connect(amqp_url, function(err, conn2) {
   conn2.createChannel(function(err, ch) {
    var q = queue_name;
    ch.assertQueue(q, {durable: false});
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {
      sendEmailMsg(JSON.parse(msg.content.toString()), queue_name);
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
	    ch.purgeQueue(queue_name, function(err, ok) {
        if(err) {
          console.log("Unknown Error Purging Queue: " + queue_name);
          return;
        }
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
   msgJson['sms']  = req.body.sms,
   msgJson['body']  = req.body.message;
   var repeat_count = req.body.repeattimes ? parseInt(req.body.repeattimes) : 1;
   var queue_name = req.body.gridRadios ? req.body.gridRadios : queue_name;
   console.log("Sending message to Queue " + queue_name);
   sendToPublisher(msgJson, repeat_count, queue_name);
   res.sendStatus(200)
});

app.get('/publish', function(req, res){
  sendToPublisher();
  res.redirect('/');
});

app.get('/startlistener', function(req, res){
  var queue = req.query.queue ? req.query.queue : default_queue_name;
  invokeListener(queue);
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

