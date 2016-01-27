var express = require('express');
var ejs = require('ejs');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

var User = function(id, socket, name){
    this.id = id;
    this.socket = socket;
    this.name = name;
};
var users = [];
var globalId = 0;
io.on('connection', function (socket) {
    var id = ++globalId;
    var currentUser;
    console.log('new user connected, id : ' + id);
    socket.emit('ask name');
    socket.on('answer name', function(name){
        currentUser = new User(id, socket.id, name);
        console.log('user ' + id + ' is now known as ' + name);
        console.log((users.push(currentUser)) + ' regitred users');
        socket.emit('user registred', name);
    });
    socket.on('ready', function(){
        console.log(currentUser.name + ' is now Ready');
    });
    socket.on('disconnect', function () {
        index = users.map(function(e) { return e.id; }).indexOf(id);
        if(index !== -1)
            var left = users.splice(index, 1)[0];
        console.log((left ? left.name : 'user : ' + id) + ' disconnected');
    });
});

http.listen(8081, function () {
    console.log('Server and Socket are Ready, both listening on *:8081');
});