Router.configure({
	'layoutTemplate': "layout"
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
	template: 'connect'
});

