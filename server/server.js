//Meteor Server JS
//meteor deploy jakeirc.meteor.com

if (Meteor.isServer) {
  //var irc = Meteor.require('irc');
  var irc = Meteor.npmRequire("irc");
  var isConnected = false;
  var currentNick = '', currentServer = '', currentChannel = '';

  Meteor.methods({
    //Allows the client to connect to a specified channel
    'ircConnect' : function(nick, server, channel) {
      currentNick = nick;
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
        }

        else {
          client.say(currentChannel, message);
          console.log(currentNick + ' => ' + currentChannel + ': ' + message);
          logMessage('< ' + currentNick, message);
        } 
      }

      else {
        logMessage('Server', 'you are not connected yet, please wait to send another message.');
      }
    },

    //Allows the client to clear the messages
    'clearMessages' : function() {
      Messages.remove({});
    },

    'ircLogout' : function() {
      if (isConnected == true) {
        logMessage(currentNick, 'You have left the channel');
        isConnected = false;
        clearDB();
        client.disconnect();
      }
    }

  });
  
  //Adds a new IRC client if the user is logged in  
  function ircAdd() {

    if(isConnected == true) {
      var client = new irc.Client(currentServer, currentNick, {
        port: 6667,
        channels: [currentChannel],
        floodProtection: true,
        floodProtectionDelay: 1000,
        localAddress: null,
        debug: false,
        showErrors: false,
        autoRejoin: false,
        autoConnect: false,
        secure: false,
        selfSigned: false,
        certExpired: false,
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

      logMessage('Server', 'Connecting to ' + currentChannel);
      
      //catches errors that the client may throw
      client.addListener('error', Meteor.bindEnvironment (function(message) {
        console.log('error: ', message);
      }));

      //Listener adds the message of the day
      /*client.addListener('motd', Meteor.bindEnvironment(function (motd) {
        logMessage('Message of the Day', motd);
      }));*/

      //Listener adds messages to the collection
      client.addListener('message', Meteor.bindEnvironment(function (from, to, message) {
          logMessage('> ' + from, message);
      }));

      //Listerner adds pms to the collection
      client.addListener('pm', Meteor.bindEnvironment(function (nick, to, text, message) {
        logMessage('> ' + nick, message);
      }));

      /*client.addListener('notice', Meteor.bindEnvironment(function (nick, text, message) {
        if(nick == null) nick = 'Server';
        logMessage('> ' + nick, message);
      }));*/

      //Listener adds users to the collection
      client.addListener('names' + currentChannel, Meteor.bindEnvironment(function (nicks) {
        updateNicks(nicks);
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
    Nicks.remove({});
    Channels.remove({});

    Nicks.insert({nicks:""});
    Channels.insert({channel:""});
  }

  //Inserts a message into the collection
  function logMessage(from, message) {
    Messages.insert({
      from: from,
      message: message,
      time: Date.now()
    });

    var curLogs = [];

    curLogs = Meteor.user().profile.logs;

    var newEntry = {
      channel: "channel: " + currentChannel + " ",
      from: from,
      message: message,
      time: Date.now()
    }

    curLogs.push(newEntry);

    Meteor.users.update({_id:Meteor.user()._id},
     {$set: { "profile.logs": curLogs }
    });
  }

  //This function chops up the message and extracts the command
  function commandResponse(message) {

    if((message.toLowerCase().indexOf(' ') > -1)) {
      var command = message.substr(1, message.indexOf(' ') - 1).toLowerCase();
    }

    else {
      var command = message.substr(1, message.length - 1).toLowerCase();
    }

    console.log(command + " end");

    var reply = '';

    //Sets the reply message for each command
    switch(command) {
      case 'command':
        reply = "the current command list has: /command, /help, /message, /kick";
        break;

      case 'help':
        reply = "click the help button in the navbar for additional help";
        break;

      case 'kick':
        reply = "this feature will allow an admin to remove users from the channel";
        break;

      case 'message': 
        reply = "this feature will allow a user to send a private message to another user";
        break; 
             
      default:
        reply = "Unknown command, for the command list type /command";
        break;
    }
    
    logMessage('Server', reply);
  }

  //Updates the channel list
  function updateChannel (channel) {
    var channelAra = [];

    channelAra.push(channel);
    var channelId = Channels.findOne();

    //Updates the Channels object
    Channels.update(channelId._id, {$set: 
      {channel: channelAra}
    });

  }

  //Updates the userlist 
  function updateNicks(nicks) {
    var nickAra = [];

    for (var property in nicks) {
      if (nicks.hasOwnProperty(property)) {
        nickAra.push(property);
      }
    }

    //finds the only User object in the collection
    var nickId = Nicks.findOne();

    //Updates the User object
    Nicks.update(nickId._id, {$set: 
      {nicks: nickAra}
    });
  }

}