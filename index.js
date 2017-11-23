const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const config = require('./config.dev');

var port = process.env.PORT || 3000;

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//statics
app.use(express.static(__dirname + 'img'))

//cors
app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,mb_token');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

//routes
const login = require('./routes/login');
app.use('/login', login);

const users = require('./routes/users');
app.use('/users', users);

const images = require('./routes/images');
app.use('/images', images);

const sos = require('./routes/sos');
app.use('/sos', sos);

app.listen(port, function() {
    console.log('MustB server started at port', port)
})
