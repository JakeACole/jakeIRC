if (Meteor.isClient) {

  Template.ircPage.helpers({
    messages: [
      { timestamp: '5:36', user: 'user 1', content: 'hey hows it going?' },
      { timestamp: '5:36', user: 'user 2', content: 'not bad how are you?' }
    ],

    users : [
      {username: 'user 1'},
      {username: 'user 2'},
      {username: 'user 3'},
      {username: 'user 4'}
    ],

    channels : [
      {channelname: '#channel 1'},
      {channelname: '#channel 2'},
      {channelname: '#channel 3'},
      {channelname: '#channel 4'}
    ]


    /*messages: function() {
      
      //var cursor = Messages.find().fetch().reverse();

      cursor.forEach(function(document) {
          messageList.push('[' + document.message_type + '] ' + document.message);
      });
    },

    users: function() {
      //var messageList = [];
      
      //var cursor = Messages.find().fetch().reverse();

      cursor.forEach(function(document) {
          messageList.push('[' + document.message_type + '] ' + document.message);
      });
    }*/
  });
}

if (Meteor.isServer) {
/*
  var ircPrm = {
    server: 'irc.---',
    port: 6667,
    nick: '---',
    password: 'oauth:' + CONNECT_TOKEN,
    username: '---',
    channels: ['---'],
    debug: true,
    stripColors: true
  };

  client = new IRC(ircPrm);
  client.connect();*/
}
