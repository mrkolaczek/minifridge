var socket = io();

function turnLeft(){
    socket.emit('left');
}

function turnRight(){
    socket.emit('right');
}

function fire(){
    socket.emit('fire');
}

document.getElementById('left').onclick = turnLeft;
document.getElementById('right').onclick = turnRight;
//document.getElementById('fire').onclick = fire;