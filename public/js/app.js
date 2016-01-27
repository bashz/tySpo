appbox = d3.select('#app');
var isReady = false;
var socket = io();
//appbox.on("keypress", function(){
//    console.log(d3.event.keyCode);
//    console.log(String.fromCharCode(d3.event.keyCode));
//});
socket.on('ask name', function () {
    var ask = appbox.append('div').attr('id', 'ask-name');
    ask.append('p').text('Please provide a nickname');
    ask.append('input').attr('type', 'text').attr('id', 'name-answer');
    ask.append('button').text('start');
    ask.on('submit', function () {
        socket.emit('answer name', document.getElementById('name-answer').value);
        return false;
    });
});
socket.on('user registred', function (name) {
    appbox.select('#ask-name').remove();
    var welcome = appbox.append('h1').text('Hello ' + name)
            .transition()
            .delay(2250)
            .duration(750)
            .style('opacity', 0)
            .each('end', function () {
                d3.select(this).remove();
                ready();
            });
});
function ready(){
    isReady = true;
    socket.emit('ready');
}