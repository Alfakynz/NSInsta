const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const { db, getCollection, signin, signup } = require('../config/firebaseConfig.js');

const app = express();
const port = 3000;

app.use(session({
  secret: 'my-secret-key-session',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // production/development
    maxAge: 1000 * 60 * 60 * 24
  }
}));
app.set('views', path.join(__dirname, '../public/views/pages'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index', {});
});

app.get('/signin', (req, res) => {
  const user = req.session.user;
  if (user) {
    res.redirect('/profil');
  }
  else {
    res.render('signin', {});
  }
});

app.get('/signup', (req, res) => {
  const user = req.session.user;
  if (user) {
    res.redirect('/profil');
  }
  else {
    res.render('signup', {});
  }
});

app.get('/profil', (req, res) => {
  const user = req.session.user;
  if (user) {
    res.render('profil', {
      user: user
    });
  }
  else {
    res.redirect('/');
  }
});

app.post('/signin', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  signin(db, username, password).then(isUser => {
    if (isUser) {
      console.log("Connecter");
      req.session.user = {
        isSignedIn: true,
        name: username
      }
      res.redirect('/profil');
    }
    else {
      console.log("Non connecter");
      res.render('signin', {})
    }
  }).catch(error => {
    console.error("Error :", error);
  })
});

app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  signup(db, username, password, confirmPassword).then(isUser => {
    if (isUser) {
      console.log("Connecter");
      req.session.user = {
        isSignedIn: true,
        name: username
      }
      res.redirect('/profil');
    }
    else {
      console.log("Non connecter");
      res.render('signup', {})
    }
  }).catch(error => {
    console.error("Error :", error);
  })
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}\n`);
});
