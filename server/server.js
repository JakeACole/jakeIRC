if (Meteor.isServer) {

  Messages = new Mongo.Collection("messages");

  var irc = Meteor.npmRequire("irc");
  //var irc = Meteor.require("irc");

  //These functions allow the irc client to connect, 

  var client = new irc.Client('irc.rizon.net', 'Arch_Client', {
    port: 6667,
    channels: ['#winter-irc-test'],
    localAddress: null,
    debug: false,
    showErrors: false,
    autoRejoin: true,
    autoConnect: true,
    secure: false,
    selfSigned: false,
    certExpired: false,
    floodProtection: false,
    floodProtectionDelay: 1000,
    sasl: false,
    stripColors: false,
    channelPrefixes: "&#",
    messageSplit: 512,
    encoding: ''
  });

  client.connect();

  //addListener allows for messages to be recieved
  client.addListener('message', function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
    logMessage(from, message);
  });

  //catches errors
  client.addListener('error', function(message) {
    console.log('error: ', message);
  });

  //Allows the client to send a message 
  Meteor.methods({
    'sendMessage': function(message) {
      client.say('#winter-irc-test', message);
    }
  });

  //Allows the client to insert a message into the log
  function logMessage(from, message) {
    Messages.insert({
        from: from,
        message: message,
        time: Date.now()
    });
  }
}