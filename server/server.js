//Meteor Server JS
//meteor deploy jakeirc.meteor.com

if (Meteor.isServer) {

  //Mongo Collections that store the users, messages and channels
  Messages = new Mongo.Collection("messages");
  Users = new Mongo.Collection("users");
  Channels = new Mongo.Collection("channels");

  //var irc = Meteor.require('irc');
  var irc = Meteor.npmRequire("irc");

  var loggedIn = false;

  var currentUser = '', currentServer = '', currentChannel = '';
  var client = ircAdd();

  //Meteor Methods
  Meteor.methods({
    'ircConnect' : function(user, server, channel) {
      currentUser = user;
      currentServer = server;
      currentChannel = channel;

      loggedIn = true;
      client = ircAdd();
      //Router.go('irc');
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
      loggedIn = false;
      clearDB();
      client.disconnect();
    }

  });
  
  //Adds a new IRC client if the user is logged in  
  function ircAdd() {

    if(loggedIn == true) {

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

      clearDB();
      updateChannel(currentChannel);

      logMessage('Server', 'Connected to ' + currentChannel);
      
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

      return client;
    }

    return null;
  }

  //This clears the mongo DBs
  function clearDB () {
    Messages.remove({});
    Users.remove({});
    Channels.remove({});

    Users.insert({nicks:""});
    Channels.insert({channel:""});
  }

  //Inserts a message into the collection
  function logMessage(from, message) {
    Messages.insert({
        from: from,
        message: message,
        time: Date.now()
    });
  }

  //Updates the channel list
  function updateChannel (channel) {
    var channelAra = [];

    channelAra.push(channel);
    var userId = Channels.findOne();

    //Updates the Channels object
    Channels.update(userId._id, {$set: 
      {channel: channelAra}
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