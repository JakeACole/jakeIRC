//These are meteor arrays of objects that are displayed as dummy data at the moment

/*userList = [
  {username: 'Arch_client'},
  {username: 'Winter[Arch]'}
];*/

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

      cursor.forEach(function(document) {
          var time = formatTime(document.time);

          pulledUsers.push({
            users: time + document.nicks, position: i
          });

          i++;
      });

      return pulledUsers.slice();
    },

    channels : channelList
  });

  function formatTime(milli) {
    var date =  new Date(milli);
    var minutes = date.getMinutes();

    if(minutes < 10){
        minutes = '0' + minutes;
    }

    return '[' + date.getHours() + ':' + minutes + '] ';
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
    }

  });
}