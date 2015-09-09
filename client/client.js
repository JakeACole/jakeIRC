//Meteor Client JS

if (Meteor.isClient) {

  //Used for the scrollBottom() function
  var msgCounter = 0;
  var loggedIn = false;

  //These helpers allow meteor objects to display on the GUI
  Template.irc.helpers ({
    //Helper renders the messages in the chat window
    messages: function() {
      var pulledMessages = [];       
      var cursor = Messages.find().fetch();
      var i = 0;

      cursor.forEach(function(document) {
        var time = formatTime(document.time);

        pulledMessages.push({
          message: time + document.from + ': ' + document.message, position: i
        });
        //Scrolls to the bottom if a new message has been added
        if (msgCounter < i) {
          scrollBottom();
          msgCounter = i;
        }
        i++;
      });

      return pulledMessages.slice();
    },

    //Helper renders the current user list
    nicks : function() {
      var pulledNicks = [];
      var cursor = Nicks.find().fetch();
      var i = 0;

      cursor.forEach(function(document) {
        for (index = 0; index < document.nicks.length; ++index) {
          pulledNicks.push(document.nicks[index]);
        }
        i++;
      });

      return pulledNicks.slice();
    },

    channels : function() {
      var pulledChannels = [];
      var cursor = Channels.find().fetch();
      var i = 0;

      cursor.forEach(function(document) {
        for (index = 0; index < document.channel.length; ++index) {
          pulledChannels.push(document.channel[index]);
        }
        i++;
      });

      return pulledChannels.slice();
    }

  });

  Template.connect.helpers ({
   
    favoritelist : function() {
      var favAra = [];
      var currentUser = Meteor.users.findOne(Meteor.user()._id);
      favAra = currentUser.profile.favlist;

      return favAra.slice();
    },

    currentnick : function() {
      currentNick = [];
      var currentUser = Meteor.users.findOne(Meteor.user()._id);
      currentNick.push(currentUser.profile.favnick);

      return currentNick.slice();
    }

  });

  Template.logs.helpers ({
    logs : function() {

      var pulledLogs = [];
      var currentUser = Meteor.users.findOne(Meteor.user()._id);
      cursor = currentUser.profile.logs;
      var i = 0;

      cursor.forEach(function(document) {
        var time = formatTime(document.time);

        pulledLogs.push({
          message: time + document.channel + document.from + 
          ': ' + document.message, position: i
        });
      });
      //Scrolls to the bottom if a new message has been added
      if (msgCounter < i) {
        scrollBottom();
        msgCounter = i;
      }
      i++;

      return pulledLogs.slice();
    }

  });

  Template.connect.rendered = function() {
    //Allows for the dynamic list of favorite connect buttons to connect to the irc server
    $('.fav-connect').click(function() {
      var id = $(this).attr('id');
      console.log("current id to connect to: " + id);

      var curFavlist = [];
      curFavlist = Meteor.user().profile.favlist;

      Meteor.call('ircConnect', Meteor.user().profile.favnick, 
      curFavlist[id].server, curFavlist[id].channel);

      Router.go('irc'); 
    });

    //Allows the user to remove favorite channels
    $('.fav-delete').click(function() {
      var id = $(this).attr('id');
      console.log("current id removed: " + id);

      var curFavlist = [];
      curFavlist = Meteor.user().profile.favlist;

      if (id > -1) {
        curFavlist.splice(id, 1);
      }

      //Updates the stored index values
      for (var i = 0; i < curFavlist.length; i++) {
        curFavlist[i].index = i;
      }

      Meteor.users.update({_id:Meteor.user()._id},
       {$set: { "profile.favlist": curFavlist}
      });

      Router.go('connect');
    });   

  }

  //When a message is entered, scroll to the bottom
  function scrollBottom() {
    $(".chat-window").animate({
      scrollTop: $(".chat-window")[0].scrollHeight},
      $(".chat-window").height()
    );
  }
  
  //Formats the timestamp displayed in the irc chat
  function formatTime(milli) {
    var date =  new Date(milli);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    if (hours < 10) {
      hours = '0' + hours;
    }

    if(minutes < 10) {
        minutes = '0' + minutes;
    }

    if(seconds < 10) {
        seconds = '0' + seconds;
    }

    return '[' + hours + ':' + minutes + ':' + seconds + '] ';
  }

  Template.connect.events({
    //These events allow for the user to connect to channels, change their nickname,
    //add favorite channels, and connect to favorite channels
    'click #connect-btn': function(event, template) {
      Meteor.call('ircConnect', Meteor.user().profile.favnick, 
      template.find('#server-name').value, template.find('#channel-name').value);

      $('#server-name').val('');
      $('#channel-name').val('');
      Router.go('irc');
    },

    'click #fav-add-btn': function(event, template) { 
      var curFavlist = [];

      curFavlist = Meteor.user().profile.favlist;

      var newEntry = {
        "server" : $('#fav-server').val(),
        "channel" : $('#fav-channel').val(),
        "index" : curFavlist.length
      }

      curFavlist.push(newEntry);

      Meteor.users.update({_id:Meteor.user()._id},
       {$set: { "profile.favlist": curFavlist }
      });

      $('#fav-server').val('');
      $('#fav-channel').val('');

      Router.go('connect');
    },

    'click #edit-nick-btn': function(event, template) { 

      Meteor.users.update({_id:Meteor.user()._id},
       {$set: { "profile.favnick": $('#user-nick').val()}
      });

      $('#user-nick').val('');

      Router.go('connect');
    }

  }); 

  Template.login.events({
    //Registers a new user into the meteor user db
    'click #register-btn': function(event, template) {
      var initFavlist = [], initLogs = [];

      var newEntry = {
        "server" : "irc.rizon.net",
        "channel" : "#a100chat",
        "index" : 0
      }

      var newLogs = {
        "channel" : "client: #jakeIRCclient ",
        "from" : "Server",
        "message" : "Welcome to jakeIRC",
        "time" : Date.now()
      }      

      initFavlist.push(newEntry);
      initLogs.push(newLogs);

      var user = {
        "email" : $('#register-email').val(),
        "password" : $('#register-password').val(),
        "profile" : {
          "favlist" : initFavlist,
          "favnick" : "jakeIRC",
          "logs" : initLogs
        }
      }

      Accounts.createUser(user);
      console.log(user.email + " has registered");
      Meteor.loginWithPassword(user.email, user.password);
      loggedIn = true;

      $('#register-email').val('');
      $('#register-password').val('');

      Router.go('connect');
    },

    //Logs a registered user into jakeIRC
    'click #login-btn': function(event, template) {
      var email = $('#login-email').val();
      var password = $('#login-password').val();

      Meteor.loginWithPassword(email, password, function (error) {
        //Catches login errors if they occur
        if (error) {
          console.log("login attempt failed");
          console.log(error);
        }

        else {
          loggedIn = true;
          Router.go('connect')
        }

      });

      $('#login-email').val('');
      $('#login-password').val('');
    }

  }); 

  Template.irc.events({
    //These events allow the send message and enter key to send messages to the irc channel
    'click #msg-btn': function(event, template) {
      Meteor.call('sendMessage', template.find('#msg-bar').value);
      $('#msg-bar').val('');
    },

    'keypress #msg-bar': function(event, template) {
      if(event.charCode == 13){
        Meteor.call('sendMessage', template.find('#msg-bar').value);
        $('#msg-bar').val('');
      }
    },

    //Allows the user to clear the messages on the screen
    'click #clear-btn' : function (event, template) {
      event.preventDefault();
      Meteor.call('clearMessages');
    },

    //Allows the user to close the current channel
    'click .close-channel' : function (event, template) {
      Meteor.call('ircLogout');
      Router.go('connect');
    }

  });

  Template.header.events({ 
    //Relocates the user when they click on the header buttons
    'click #irc-btn': function(event, template) {
      event.preventDefault();
      Router.go('irc');
    },

    'click #connect-btn': function(event, template) {
      event.preventDefault();
      Router.go('connect');
    },

    'click #logs-btn' : function(event, template) {
      event.preventDefault();
      Router.go('logs');
    },

    'click #help-btn': function(event, template) {
      event.preventDefault();
      Router.go('help');
    },

    'click #login-btn' : function (event, template) {
      event.preventDefault();
      Router.go('login');
    },

    'click #logout-btn' : function (event, template) {
      event.preventDefault();
      Meteor.call('ircLogout');
      Meteor.logout();
      loggedIn = false;
      Router.go('login');
    }
  });
}