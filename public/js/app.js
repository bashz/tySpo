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
    document.getElementById('name-answer').focus();
    ask.on('keypress', function () {
        if (d3.event.keyCode === 13)
            socket.emit('answer name', document.getElementById('name-answer').value);
        else
            return false;
    });
});
socket.on('user registred', function (name, id) {
    appbox.select('#ask-name').remove();
    var welcome = appbox.append('h1').text('Hello ' + name)
            .transition()
            .delay(2250)
            .duration(750)
            .style('opacity', 0)
            .each('end', function () {
                d3.select(this).remove();
                ready(id);
            });
});
var arc = d3.svg.arc()
        .innerRadius(1000 / 6.5 - 60)
        .outerRadius(1000 / 6.5 - 5)
        .startAngle(0);
arc2 = arc.endAngle(Math.PI * 2);
var svg = appbox.append('svg');
function ready(id) {
    var totalScore = 0;
    isReady = true;
    socket.emit('ready');
    socket.on('new game', function (word, ids) {
        svg.selectAll("path").remove();
        var clock = svg.append("path")
                .attr("class", "path path--background")
                .attr("d", arc);
        clock.transition().duration(5000).attr("d", arc2);
        var score = totalScore;
        appbox.select('#game').remove();
        var game = appbox.append('div').attr('id', 'game');
        game.append('h2').attr('id', 'to-guess').text(word);
        var input = game.append('input').attr('type', 'text').attr('id', 'answer');
        document.getElementById('answer').focus();
        var players = game.append('dl');
        var player = players.selectAll('.players')
                .data(ids).enter()
                .append('dt')
                .attr('id', function (d) {
                    return 'player' + d.id;
                })
                .text(function (d) {
                    return d.name + ' : ';
                });
        player.append('dd')
                .attr('id', function (d) {
                    return 'score' + d.id;
                })
                .text(function (d) {
                    return d.score;
                });
        player.append('dd')
                .attr('id', function (d) {
                    return 'tyspo' + d.id;
                });
        console.log(ids);
        game.on('keypress', function () {
            var next = (word.charAt(0));
            var char = String.fromCharCode(d3.event.keyCode);
            if (char === next) {
                score += 10;
                word = word.substr(1);
                if (word.length) {
                    socket.emit('typed', id, char, score);
                } else {
                    score += word.length * 10;
                    socket.emit('wins', id, char, score);
                    totalScore = score;
                }
            } else {
                socket.emit('loses', id);
                totalScore = score;
            }
        });
        socket.on('winner', function (id, char, score) {
            game.select('#tyspo' + id).style('color', 'green')
                    .text(function (d) {
                        return d3.select(this).text() + char;
                    });
            game.select('#score' + id).text(score);
            game.on('keypress', null);
            input.remove();
        });
        socket.on('type', function (id, char, score) {
            game.select('#tyspo' + id).text(function (d) {
                return d3.select(this).text() + char;
            });
            game.select('#score' + id).text(score);
        });
        socket.on('loser', function (id) {
            game.select('#player' + id).style('color', 'red');
        });
        socket.on('the loser', function () {
            game.on('keypress', null);
            input.remove();
        });
    });
}