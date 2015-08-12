//Meteor Server JS
//meteor deploy jakeirc.meteor.com

if (Meteor.isServer) {

  //Mongo Collections that store the users, messages and channels
  Messages = new Mongo.Collection("messages");
  Users = new Mongo.Collection("users");
  Channels = new Mongo.Collection("channels");

  //var irc = Meteor.require('irc');
  var irc = Meteor.npmRequire("irc");

  var isConnected = false;

  var currentUser = '', currentServer = '', currentChannel = '';
  var client = ircAdd();

  Meteor.methods({
    //Allows the client to connect to a specified channel
    'ircConnect' : function(user, server, channel) {
      currentUser = user;
      currentServer = server;
      currentChannel = channel;

      isConnected = true;
      client = ircAdd();
    },

    //Allows the client to send a message 
    'sendMessage': function(message) {
      if (isConnected == true) {
        if (message[0] == '/') {
          commandResponse(message);
          console.log("Calling from here");
        }
        else {
          client.say(currentChannel, message);
          console.log(currentUser + ' => ' + currentChannel + ': ' + message);
          logMessage('< ' + currentUser, message);
        } 
      else {
        logMessage('Server ', 'you are not connected yet, please wait to send another message.');
      }
    },

    //Allows the client to clear the messages
    'clearMessages' : function() {
      Messages.remove({});
    },

    'ircLogout' : function() {
      logMessage(currentUser, 'You have left the channel');
      isConnected = false;
      clearDB();
      client.disconnect();
    }

  });
  
  //Adds a new IRC client if the user is logged in  
  function ircAdd() {

    if(isConnected == true) {

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

      logMessage('Server ', 'Connecting to ' + currentChannel);
      
      //catches errors that the client may throw
      client.addListener('error', Meteor.bindEnvironment (function(message) {
        console.log('error: ', message);
      }));

      //Listener adds messages to the collection
      client.addListener('message', Meteor.bindEnvironment(function (from, to, message) {
        //console.log(from + ' => ' + to + ': ' + message);
        logMessage('> ' + from, message);
      }));

      //Listener adds users to the collection
      client.addListener('names' + currentChannel, Meteor.bindEnvironment(function (nicks) {
        //console.log(nicks);
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

  // 
  function commandResponse(message) {
    // If a command has parameters, then chop the first word of
    // the message off to get the raw command,
    // otherwise just take the raw command

    if((message.toLowerCase().indexOf(' ') > -1)) {
      var command = message.substr(1, message.indexOf(' ')).toLowerCase();
    }

    else {
      var command = message.substr(1, message.length - 1).toLowerCase();
    }

    console.log("test bruh");
    var reply = 'dude';

    // Set reponses for commands
    switch(command) {
      case 'command':
        reply = "the current command list has: /help, /message, /command";
        break;
      case 'help':
        reply = "click the help button in the navbar for additional help";
        break;
      case 'kick':
        reply = "kappa kappa kappa";
        break;
      case 'message': 
        reply = "write the message function kappa";
        break;      
      default:
        reply = "Unknown command, for the command list type /command";
        break;
    }
    
    logMessage('Server ', reply);
    //Meteor.call('sendMessage', response, 'RESP');
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