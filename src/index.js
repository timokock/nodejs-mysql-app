const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const mySQLStore = require('express-mysql-session');
const { database } = require('./keys');
const passport = require('passport');

//INITIALIZATIONS
const app = express();
require('./lib/passport');

//SETTINGS
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}))
app.set('view engine', '.hbs');

//MIDDLEWARE
app.use(session({
    secret: 'mySecretSession',
    resave: false,
    saveUninitialized: false,
    store: new mySQLStore(database)
}))
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//GLOBAL VARIABLES
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    next();
});

//ROUTES
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/links',require('./routes/links'));

//PUBLIC 
app.use(express.static(path.join(__dirname, 'public')));

//STARTING SERVER
app.listen(app.get('port'), () =>{
    console.log('Server running on port ' + app.get('port'));
    
});