const express = require('express')
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const applicationArguments = require('yargs').argv;
var env = applicationArguments.ENV || 'dev';
process.env.ENV = env;
const configuration = require('./config/application.' + process.env.ENV);

var port = process.env.PORT || applicationArguments.PORT || 3000;
process.env.PORT = port;

process.env.tokenSecret = configuration.tokenSecret;

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
app.use(helmet());

//routes
const login = require('./routes/login');
app.use('/login', login);

const users = require('./routes/users');
app.use('/users', users);

const images = require('./routes/images');
app.use('/images', images);

const events = require('./routes/events');
app.use('/events', events);

app.get('/i/want/socket', function(req, res) {
    res.sendFile(__dirname + '/socket.html');
    //res.send('Hi');
});

io.on('connection', function(socket){
    const ioService = require("./services/socketIoService")(io, socket);
    console.log('user connected');
    socket.on('disconnect', ioService.disconnect);
    
    socket.on('chat-box', ioService.connectToChat);
    
    socket.on('chat-message', ioService.messageRecieved);
    });

http.listen(port, function() {
    console.log('MustB server started at port', port)
})
