//Only allows the user to see specific pages if they are logged in
var OnBeforeActions;
OnBeforeActions = {
    loginRequired: function(pause) {
      if (!Meteor.userId()) {
        this.render('login');
        return pause();
      }
      
      else{
      	this.next();
      }
    }
};

//Locks the connect and irc pages for users who are logged in
Router.onBeforeAction(OnBeforeActions.loginRequired, {
    only: ['connect', 'irc']
});

Router.configure({
	'layoutTemplate': "layout"
});

Router.route('/login', {
	name: 'login'
});

Router.route('/connect', {
	name: 'connect'
});

Router.route('/irc', {
	name: 'irc'
});

Router.route('/help', {
	name: 'help'
});

//default page is login
Router.route('/', {
	template: 'login'
});

