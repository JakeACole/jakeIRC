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
];

if (Meteor.isClient) {

  Template.ircPage.helpers({
    messages: messageList,
    users : userList,
    channels : channelList
  });

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

  });
}