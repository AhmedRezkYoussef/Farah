var express = require('express');
var bodyParser =require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Login');


var User = mongoose.model('User', {
	username: String,
	password: String
});

var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false);
      }
      if (user.password != password) {
        return done(null, false);
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var app = express();

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());



app.get('/',function(req, res){
	res.render('index');
});

app.get('/register',function(req, res){
	res.render('register');
});

app.post('/register', function(req, res) {
	var newUser = new User({
		username: req.body.username,
		password: req.body.password
	});
	newUser.save(function(err, user) {
		if (err) {
			console.log(err);
		} else {
			console.log(user);
		}
	});

	res.redirect('/login');
});

app.get('/login', function(req, res) {
	res.render('login');

});

app.post('/login', passport.authenticate('local', { successRedirect: '/profile', failureRedirect: '/login' }));

app.get('/profile', function(req, res) {
	res.render('profile', {
		user: req.user
    });
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');

});

app.listen(3000,function(){
	console.log('Login Listening on port 3000');
});