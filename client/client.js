//Meteor Client JS

if (Meteor.isClient) {

  //Used for the scrollBottom() function
  var msgCounter = 0;

  //Allows client to access mongo collections
  Messages = new Mongo.Collection("messages");
  Users = new Mongo.Collection("users");
  Channels = new Mongo.Collection("channels");

  //These helpers allow meteor objects to display on the GUI
  Template.irc.helpers({

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
    users : function() {
      var pulledUsers = [];
      var cursor = Users.find().fetch();
      var i = 0;

      cursor.forEach(function(document) {
        for (index = 0; index < document.nicks.length; ++index) {
          pulledUsers.push(document.nicks[index]);
        }
        i++;
      });

      return pulledUsers.slice();
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

  //When a message is entered, scroll to the bottom
  function scrollBottom() {
    $(".chat-window").animate({
      scrollTop:$(".chat-window")[0].scrollHeight},
      $(".chat-window").height()
    );
  }
  
  //Formats the time displayed in the irc chat
  function formatTime(milli) {
    var date =  new Date(milli);
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    if(minutes < 10){
        minutes = '0' + minutes;
    }

    if(seconds < 10){
        seconds = '0' + seconds;
    }

    return '[' + date.getHours() + ':' + minutes + ':' + seconds + '] ';
  }

  Template.connect.events({
    //These events allow the send message and enter key to send messages to the irc channel
    'click #connect-btn': function(event, template) {
      Meteor.call('ircConnect', template.find('#user-name').value, 
      template.find('#server-name').value, template.find('#channel-name').value);
      $('#user-name').val('');
      $('#server-name').val('');
      $('#channel-name').val('');
      Router.go('irc');
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

    'click #help-btn': function(event, template) {
        event.preventDefault();
        Router.go('help');
    },

    'click #logout-btn' : function (event, template) {
      Meteor.call('ircLogout');
      Router.go('connect');
    }
  });
}