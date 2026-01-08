require('dotenv').config();

const express = require('express');
const app = express();

const ejsMate = require('ejs-mate');
const path = require('path')

const session = require('express-session');
const flash = require('connect-flash');

const sessionConfig = require('./config/session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./config/database')();
app.use(session(sessionConfig));
app.use(flash());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res)=>{
    res.render('home', {title : 'The Homepage'})
});

const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`App is listening on PORT ${PORT}`)
});