if (Meteor.isServer) {

  //var irc = require("irc");

  Messages = new Mongo.Collection("messages");

  var ircPrm = {
    server: 'irc.rizon.net',
    port: 6667,
    nick: 'Winter_EC',
    channels: ['#dolphin-ssbm'],
    debug: true,
    stripColors: true
  };

  //var client = new irc(ircPrm);
  //client.connect();

  //addListener is not functioning with the current packages
  /*client.addListener('messages');

  client.addListener('messages', function (message) {
    logMessage(message);
  });*/

  Meteor.methods({
    'sendMessage': function(message) {
      client.say('#dolphin-ssbm', message);
    }
  });

  function logMessage(message) {
      messages.insert({
          message: message,
          time: Date.now(),
      });
  }
}