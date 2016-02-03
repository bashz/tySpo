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

var User = function(id, socket, name, score){
    this.id = id;
    this.socket = socket;
    this.name = name;
    this.score = score;
};
var users = [];
var globalId = 0;
var round;
var start = function(){
    var words = ['alpha','beta','zeta'];
    round = setInterval(suggestWord, 5000, words);
};
var suggestWord = function(wordsTab){
    var word = wordsTab[Math.floor(Math.random() * wordsTab.length)];
    io.emit('new game', word, users);
};
io.on('connection', function (socket) {
    var id = ++globalId;
    var currentUser;
    console.log('new user connected, id : ' + id);
    socket.emit('ask name');
    socket.on('answer name', function(name){
        currentUser = new User(id, socket.id, name, 0);
        console.log('user ' + id + ' is now known as ' + name);
        console.log((users.push(currentUser)) + ' regitred users');
        socket.emit('user registred', name, id);
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
    socket.on('wins', function(id, char, score){
        var i = users.map(function(e) { return e.id; }).indexOf(id);
        users[i].score = score;
        io.emit('winner', id, char, score);
        //start();
    });
    socket.on('typed', function(id, char, score){
        var i = users.map(function(e) { return e.id; }).indexOf(id);
        users[i].score = score;
        io.emit('type', id, char, score);
    });
    socket.on('loses', function(id){
        socket.emit('the loser');
        io.emit('loser', id);
    });
});
start();
http.listen(8081, function () {
    console.log('Server and Socket are Ready, both listening on *:8081');
});