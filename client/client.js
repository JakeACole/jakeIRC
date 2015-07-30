//Client

channelList = [
  {channelname: '#winter-irc-test'}
];

if (Meteor.isClient) {

  Messages = new Mongo.Collection("messages");
  Users = new Mongo.Collection("users");

  //These helpers allow meteor objects to display on the GUI
  Template.ircPage.helpers({

    messages: function() {
      var pulledMessages = [];
        
      var cursor = Messages.find().fetch();
      var i = 0;

      cursor.forEach(function(document) {
          var time = formatTime(document.time);

          pulledMessages.push({
            message: time + document.from + ': ' + document.message, position: i
          });

          i++;
      });

      return pulledMessages.slice();
    },

    users : function() {
      var pulledUsers = [];
        
      var cursor = Users.find().fetch();
      var i = 0;

      cursor.forEach (function(document) {

          /*pulledUsers.push({
            users: document.nicks, position: i;
          });*/

          for (index = 0; index < document.nicks.length; ++index) {
            pulledUsers.push(document.nicks[index]);
          }

          i++;
      });

      return pulledUsers.slice();
    },
    channels : channelList
  });
  
  Template.ircPage.rendered = function () {

    /*$('.msg-btn')."click"(function(e) {

        $("chat-window").animate({
          "scrollBottom": window.scrollY+300 }, 
        1000);

        return false;
    });*/
  }
  
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

  //These events allow the send message and enter key to send messages to the irc channel
  Template.ircPage.events({
    'click #msg-btn': function(event, template) {
      Meteor.call('sendMessage', template.find('#msg-bar').value, 'USER');
      $('#msg-bar').val('');
    },

    'keypress #msg-bar': function(event, template) {
      if(event.charCode == 13){
        Meteor.call('sendMessage', template.find('#msg-bar').value, 'USER');
        $('#msg-bar').val('');
      }
    },

    'click .logout-btn': function(event, template) {
      e.preventDefault();
      var result = confirm("Are you sure you want to logout?");

      // If they want to logout, log them out and redirect them to the login screen
      if(result){
        window.close();
      }
    }

  });
}