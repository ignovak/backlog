var state = {
  game_key: '{{ game_key }}',
  me: '{{ me }}'
};

updateGame = function() {
  for (i = 0; i < 9; i++) {
    var square = document.getElementById(i);
    square.innerHTML = state.board[i];
    if (state.winner != '' && state.winningBoard != '') {
      if (state.winningBoard[i] == state.board[i]) {
        if (state.winner == state.me) {
          square.style.background = "green";
        } else {
          square.style.background = "red";
        }
      } else {
        square.style.background = "white";
      }
    }
  }
  
  var display = {
    'other-player': 'none',
    'your-move': 'none',
    'their-move': 'none',
    'you-won': 'none',
    'you-lost': 'none',
    'board': 'block',
    'this-game': 'block',
  }; 

  if (!state.userO || state.userO == '') {
    display['other-player'] = 'block';
    display['board'] = 'none';
    display['this-game'] = 'none';
  } else if (state.winner == state.me) {
    display['you-won'] = 'block';
  } else if (state.winner != '') {
    display['you-lost'] = 'block';
  } else if (isMyMove()) {
    display['your-move'] = 'block';
  } else {
    display['their-move'] = 'block';
  }
  
  for (var label in display) {
    document.getElementById(label).style.display = display[label];
  }
};

isMyMove = function() {
  return (state.winner == "") && 
      (state.moveX == (state.userX == state.me));
}

myPiece = function() {
  return state.userX == state.me ? 'X' : 'O';
}

sendMessage = function(path, opt_param) {
  path += '?g=' + state.game_key;
  if (opt_param) {
    path += '&' + opt_param;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('POST', path, true);
  xhr.send();
};

moveInSquare = function(id) {
  if (isMyMove() && state.board[id] == ' ') {
    sendMessage('/move', 'i=' + id);
  }
}

highlightSquare = function(id) {
  if (state.winner != "") {
    return;
  }
  for (i = 0; i < 9; i++) {
    if (i == id  && isMyMove()) {
      if (state.board[i] = ' ') {
        color = 'lightBlue';
      } else {
        color = 'lightGrey';
      }
    } else {
      color = 'white';
    }

    document.getElementById(i).style['background'] = color;
  }
}

onOpened = function() {
  sendMessage('/opened');
};

onMessage = function(m) {
  newState = JSON.parse(m.data);
  state.board = newState.board || state.board;
  state.userX = newState.userX || state.userX;
  state.userO = newState.userO || state.userO;
  state.moveX = newState.moveX;
  state.winner = newState.winner || "";
  state.winningBoard = newState.winningBoard || "";
  updateGame();
}

openChannel = function() {
  var token = '{{ token }}';
  var channel = new goog.appengine.Channel(token);
  var handler = {
    'onopen': onOpened,
    'onmessage': onMessage,
    'onerror': function() {},
    'onclose': function() {}
  };
  var socket = channel.open(handler);
  socket.onopen = onOpened;
  socket.onmessage = onMessage;
}

initialize = function() {
  openChannel();
  var i;
  for (i = 0; i < 9; i++) {
    var square = document.getElementById(i);
    square.onmouseover = new Function('highlightSquare(' + i + ')');
    square.onclick = new Function('moveInSquare(' + i + ')');
  }
  onMessage({data: '{{ initial_message }}'});
}      

setTimeout(initialize, 100);

