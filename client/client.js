<<<<<<< HEAD
//These are meteor arrays of objects that are displayed as dummy data at the moment
messageList = [
  {timestamp: '5:36', user: 'Andy', content: 'Hey, how is it going?'},
  {timestamp: '5:37', user: 'Jake', content: 'Not bad how are you?'},
  {timestamp: '5:37', user: 'Brandon', content: 'IRC is awesome!'},
  {timestamp: '5:37', user: 'Walter', content: 'Yes it is'},
  {timestamp: '5:37', user: 'Jake', content: "Can't disagree there"}
];

userList = [
  {username: 'Andy'},
  {username: 'Brandon'},
  {username: 'Jake'},
  {username: 'Walter'}
];

channelList = [
  {channelname: '#CSS'},
  {channelname: '#Html5'},
  {channelname: '#JavaScript'},
  {channelname: '#Meteor'},
  {channelname: '#Mongo'}
=======
//Meteor Client JS

channelList = [
  {channelname: '#winter-irc-test'}
>>>>>>> dev
];

if (Meteor.isClient) {

<<<<<<< HEAD
  //These helpers allow meteor objects to display on the GUI
  Template.ircPage.helpers({
    messages: messageList,
    users : userList,
    channels : channelList
  });

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

=======
  //Used for the scrollBottom() function
  var msgCounter = 0;

  //Allows client to access mongo collections
  Messages = new Mongo.Collection("messages");
  Users = new Mongo.Collection("users");

  //These helpers allow meteor objects to display on the GUI
  Template.ircPage.helpers({

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
    channels : channelList
  });

  //When a message is entered, scroll to the bottom
  function scrollBottom() {
    $(".chat-window").animate({scrollTop:$(".chat-window")[0].scrollHeight}, $(".chat-window").height());
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

  
  Template.ircPage.events({
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
    }

    /*,
    'click .logout-btn': function(e) {

      /*e.preventDefault();
      var result = confirm("Are you sure you want to logout?");

      if(result){
        window.close();
      }
    },

    'click .msg-btn': function(e) {

    }
    */

>>>>>>> dev
  });
}