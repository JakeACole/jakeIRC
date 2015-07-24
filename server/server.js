if (Meteor.isServer) {

  //var irc = require("irc");

  //This mongo collection stores messages
  Messages = new Mongo.Collection("messages");

  //This is a channel the client can connect to
  var ircPrm = {
    server: 'irc.rizon.net',
    port: 6667,
    nick: 'Winter_EC',
    channels: ['#dolphin-ssbm'],
    debug: true,
    stripColors: true
  };

  //These functions allow the irc client to connect, 
  //they are currently being wonky with the packages I have installed

  //var client = new irc(ircPrm);
  //client.connect();

  //addListener is not functioning with the current packages
  /*client.addListener('messages', function (message) {
    logMessage(message);
  });*/

  //Allows the client to send a message 
  Meteor.methods({
    'sendMessage': function(message) {
      client.say('#dolphin-ssbm', message);
    }
  });

  //Allows the client to insert a message into the log
  function logMessage(message) {
      messages.insert({
          message: message,
          time: Date.now(),
      });
  }
}