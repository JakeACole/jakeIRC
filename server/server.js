//Server

if (Meteor.isServer) {

  Messages = new Mongo.Collection("messages");
  Users = new Mongo.Collection("users");

  //var irc = Meteor.npmRequire("irc");
  var irc = Meteor.require("irc");

  //These functions allow the irc client to connect, 
  var client = new irc.Client('irc.freenode.net', '[Arch]Client', {
    port: 6667,
    channels: ['#winter-irc-test'],
    localAddress: null,
    debug: false,
    showErrors: false,
    autoRejoin: false,
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

  /*if (client.opt.floodProtection) {
    client.activateFloodProtection();
  }*/

  if (client.opt.autoConnect === true) {
    client.connect();
    Messages.remove({});
    Users.remove({});
    Users.insert({
      nicks: ""
    });
    logMessage('Server', 'Connected to #winter-irc-test');
  }

  //catches errors
  client.addListener('error', Meteor.bindEnvironment (function(message) {
    console.log('error: ', message);
    /*client.disconnect('disconnecting from the irc');
    client.connect();*/
  }));

  //addListener allows for messages to be recieved
  client.addListener('message', Meteor.bindEnvironment(function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
    logMessage(from, message);
  }));

  client.addListener('names#winter-irc-test', Meteor.bindEnvironment(function (nicks) {
    console.log(nicks);
    updateUsers(nicks);
  }));

  client.addListener('join#winter-irc-test', Meteor.bindEnvironment(function (nick) {
    logMessage(nick, 'has joined the channel');
  }));

  client.addListener('part#winter-irc-test', Meteor.bindEnvironment(function (nick) {
    logMessage(nick, 'has left the channel');
  }));
  
  Meteor.methods({
    //Allows the client to send a message 
    'sendMessage': function(message) {
      client.say('#winter-irc-test', message);
      console.log('[Arch]Client' + ' => ' + '#winter-irc-test' + ': ' + message);
      logMessage('[Arch]Client', message);
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

  function updateUsers(nicks) {
    var userAra = [];

    for (var property in nicks) {
      if (nicks.hasOwnProperty(property)) {
        userAra.push(property);
      }
    }

    var userId = Users.findOne();

    Users.update(userId._id, {$set: 
      {nicks: userAra}
    });
  }
}