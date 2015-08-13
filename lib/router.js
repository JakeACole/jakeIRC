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

Router.route('/', {
	template: 'login'
});

