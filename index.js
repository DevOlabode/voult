require('dotenv').config();

const express = require('express');
const app = express();

const ejsMate = require('ejs-mate');
const path = require('path')

const session = require('express-session');
const flash = require('connect-flash');

const passport = require('./config/passport');

const sessionConfig = require('./config/session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./config/database')();
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    res.locals.currentUser = req.user;
    next();
  });

app.use('/', require('./routes/auth'));  
app.use('/', require('./routes/user'));  


app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
      return res.render('home-logged-in', {
        user: req.user,
        title: 'AuthWay',
      });
    }
  
    res.render('home-guest', {
      title: 'AuthWay',
    });
  });
  

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`App is listening on PORT ${PORT}`)
});