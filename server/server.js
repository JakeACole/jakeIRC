//Meteor Server JS

//meteor deploy jakeirc.meteor.com

if (Meteor.isServer) {

  //Mongo Collections that store the users and messages
  Messages = new Mongo.Collection("messages");
  Users = new Mongo.Collection("users");

  //var irc = Meteor.npmRequire("irc");
  var irc = Meteor.require("irc");

  //This initializes the IRC client 
  var client = new irc.Client('irc.freenode.net', '[Arch]Client', {
    port: 6667,
    channels: ['#winter-irc-test'],
    localAddress: null,
    debug: false,
    showErrors: false,
    autoRejoin: false,
    autoConnect: false,
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
 
  //This allows the irc client to connect

  client.connect();

  Messages.remove({});
  Users.remove({});

  Users.insert({
    nicks: ""
  });

  logMessage('Server', 'Connected to #winter-irc-test');

  //catches errors that the client may throw
  client.addListener('error', Meteor.bindEnvironment (function(message) {
    console.log('error: ', message);
  }));

  //Listener adds messages to the collection
  client.addListener('message', Meteor.bindEnvironment(function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
    logMessage(from, message);
  }));

  //Listener adds users to the collection
  client.addListener('names#winter-irc-test', Meteor.bindEnvironment(function (nicks) {
    console.log(nicks);
    updateUsers(nicks);
  }));

  //Listener alerts user when a person joins the channel
  client.addListener('join#winter-irc-test', Meteor.bindEnvironment(function (nick) {
    logMessage(nick, 'has joined the channel');
  }));

  //Listener alerts user when a person leaves the channel
  client.addListener('part#winter-irc-test', Meteor.bindEnvironment(function (nick) {
    logMessage(nick, 'has left the channel');
  }));
  
  //Meteor Methods
  Meteor.methods({
    //Allows the client to send a message 
    'sendMessage': function(message) {
      client.say('#winter-irc-test', message);
      console.log('[Arch]Client' + ' => ' + '#winter-irc-test' + ': ' + message);
      logMessage('[Arch]Client', message);
    },

    //Allows the client to clear the messages
    'clearMessages' : function() {
      Messages.remove({});
    }
  });

  //Inserts a message into the collection
  function logMessage(from, message) {
    Messages.insert({
        from: from,
        message: message,
        time: Date.now()
    });
  }

  //Updates the userlist 
  function updateUsers(nicks) {
    var userAra = [];

    for (var property in nicks) {
      if (nicks.hasOwnProperty(property)) {
        userAra.push(property);
      }
    }

    //finds the only User object in the collection
    var userId = Users.findOne();

    //Updates the User object
    Users.update(userId._id, {$set: 
      {nicks: userAra}
    });
  }
}

