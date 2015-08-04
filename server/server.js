//Meteor Server JS

//meteor deploy jakeirc.meteor.com

if (Meteor.isServer) {

  //Mongo Collections that store the users and messages
  Messages = new Mongo.Collection("messages");
  Users = new Mongo.Collection("users");

  //var irc = Meteor.npmRequire("irc");
  var irc = Meteor.require('irc');
  //var clientDefined = 0;
  var currentUser = '[Arch]Client', currentServer = 'irc.freenode.net', currentChannel = '#winter-irc-test';

  var client = new irc.Client(currentServer, currentUser, {
      port: 6667,
      channels: [currentChannel],
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
  Users.insert({nicks:""});
  logMessage('Server', 'Connected to' + currentChannel);
  
  //catches errors that the client may throw
  client.addListener('error', Meteor.bindEnvironment (function(message) {
    console.log('error: ', message);
  }));

  //Listener adds messages to the collection
  client.addListener('message', Meteor.bindEnvironment(function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
    logMessage('> ' + from, message);
  }));

  //Listener adds users to the collection
  client.addListener('names' + currentChannel, Meteor.bindEnvironment(function (nicks) {
    console.log(nicks);
    updateUsers(nicks);
  }));

  //Listener alerts user when a person joins the channel
  client.addListener('join' + currentChannel, Meteor.bindEnvironment(function (nick) {
    logMessage(nick, 'has joined the channel');
  }));

  //Listener alerts user when a person leaves the channel
  client.addListener('part' + currentChannel, Meteor.bindEnvironment(function (nick) {
    logMessage(nick, 'has left the channel');
  }));
  
  //Meteor Methods
  Meteor.methods({
    'ircConnect' : function(user, server, channel) {
      console.log('This is stuff:' + user + server + channel);
      //This initializes the IRC client 
      /*var client = new irc.Client(server, channel, {
        port: 6667,
        channels: [channel],
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

      clientDefined = 1;

      currentUser = user;
      currentServer = server;
      currentChannel = channel;

      //This allows the irc client to connect
      client.connect();
      Messages.remove({});
      Users.remove({});
      Users.insert({nicks:""});
      logMessage('> Server', 'Connected to #winter-irc-test');*/
    },

    //Allows the client to send a message 
    'sendMessage': function(message) {
      client.say(currentChannel, message);
      console.log(currentUser + ' => ' + currentChannel + ': ' + message);
      logMessage('< ' + currentUser, message);
    },

    //Allows the client to clear the messages
    'clearMessages' : function() {
      Messages.remove({});
    },

    'ircLogout' : function() {
      logMessage(currentUser, 'You have left the channel');
      client.disconnect();
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
