"use strict";

let fadeTime = 1000;

let GAME = {
    started: false,
    mode: 1,
    marker: 'X',
    playerOne: 'X',
    playerTwo: 'O',
    turn: 1,
    boardSize: 3,
    board: [],
    boardButtons: [],

    initialize: function(n) {
        this.started = true;
        this.boardSize = n;
        this.board = matrix(n);
        this.boardButtons = generateBoard(n);
        this.turn = Math.floor(Math.random()*2) + 1;
    },
    reset: function() {
        this.started = false;
        this.boardSize = 3;
        this.board = [];
        this.boardButtons = [];
        this.turn = 1;
        this.mode = 1;
        this.marker = 'X';
        this.playerOne = 'X';
        this.playerTwo = 'O';
        resetBoard();
    },
    play: function() {
        this.marker = (this.turn === 1 ? this.playerOne : this.playerTwo);
        $('#turn-info').text(`${this.marker} (player ${this.turn})`);
        if (this.mode === 1 && this.turn === 2)
            computerTurn();

        $(this.boardButtons).click(() => {
            if (this.mode === 2 || this.turn === 1) {
                let i = event.target.value[0];
                let j = event.target.value[1];
                if (this.board[i][j] === '') {
                    $(event.target).text(this.marker);
                    this.board[i][j] = this.marker;
                    this.marker = (this.marker === 'X' ? 'O' : 'X');
                    this.turn = (this.turn === 1 ? 2 : 1);
                    if (this.mode === 1)
                        computerTurn();
                }
            }
            endIfFinished();
        });
        function endIfFinished() {
            let state = GAME.isFinished();
            if (!state[0]) $('#turn-info').text(`${GAME.marker} (player ${GAME.turn})`);
            else {
                let winner;
                GAME.marker = (GAME.marker === 'X' ? 'O' : 'X');
                markFields(...state[2]);
                $(GAME.boardButtons).unbind('click');
                if (state[1] == GAME.playerOne)
                    winner = 'player 1';
                else if (state[1] == GAME.playerTwo)
                    winner = 'player 2';
                else winner = false;
                setTimeout(() => {
                    $('#finish-info').css({'visibility': 'visible'});
                    $('#finish-info').hide();
                    $('.wrapper').fadeOut(fadeTime);
                    $('#board').fadeOut(fadeTime, () => {
                        if (winner)
                            $('#finish-info').html(`<h2>Game over!</h2><br><h3>Winner: ${winner}</h3>`);
                        else
                            $('#finish-info').html(`<h2>Game over!</h2><br><h3>No winner</h3>`);
                        $('.wrapper').fadeIn(fadeTime);
                        $('#finish-info').fadeIn(fadeTime, () => {
                            setTimeout(() => {
                                $('.wrapper').fadeOut(fadeTime);
                                $('#finish-info').fadeOut(fadeTime, () => {
                                    $('#finish-info').css({'visibility': 'hidden'});
                                    GAME.reset();
                                });
                            }, 2500);
                        });
                    });
                }, 1500);
            }
        }
        function computerTurn() {
            if (!GAME.isFinished()[0]) {
                setTimeout(() => {
                    let id = GAME.getEmptyField();
                    if (id) {
                        $(`:button[value="${id[0]}${id[1]}"]`).text(GAME.marker);
                        GAME.board[id[0]][id[1]] = GAME.marker;
                        GAME.marker = (GAME.marker === 'X' ? 'O' : 'X');
                        GAME.turn = (GAME.turn === 1 ? 2 : 1);
                        $('#turn-info').text(`${GAME.marker} (player ${GAME.turn})`);
                        endIfFinished();
                        if (GAME.mode == 1) {
                            let turn = (GAME.turn === 1 ? 2 : 1);
                            $('#turn-info').text(`${GAME.marker} (player ${turn})`);
                        }
                    }
                }, 1000);
            }
        }
    },
    getEmptyField: function() {
        let arr = this.board.slice();
        let n = this.boardSize;
        let emptySpaces = [];
        let id;

        for (let i = 0; i < n; i++)
            for (let j = 0; j < n; j++)
                if (arr[i][j] === '')
                    emptySpaces.push([i, j]);

        id = Math.floor(Math.random() * emptySpaces.length);
        return emptySpaces[id];
    },
    isFinished: function() {
        let finished = false;
        let winner = null;
        let n = this.boardSize;
        let subArray = [];
        let winningFields = [];

        function isX(v) {
            return v === 'X';
        }
        function isO(v) {
            return v === 'O';
        }
        function getWinner(arr) {
            if (arr.every(isX)) {
                finished = true;
                winner = 'X';
                return true;
            }
            else if (arr.every(isO)) {
                finished = true;
                winner = 'O';
                return true;
            }
            else return false;
        }
        if (this.started) {
            // 1. horizontal
            for (let i = 0; i < n; i++) {
                subArray = [];
                for (let j = 0; j < n; j++)
                    subArray.push(this.board[i][j]);
                if (getWinner(subArray))
                    winningFields = ['r', i];
            }
            // 2. vertical
            for (let i = 0; i < n; i++) {
                subArray = [];
                for (let j = 0; j < n; j++)
                    subArray.push(this.board[j][i]);
                if (getWinner(subArray))
                    winningFields = ['c', i];
            }
            // 3. diagonal
                // 3.1 left to right
            subArray = [];
            for (let i = 0; i < n; i++)
                subArray.push(this.board[i][i]);
            if (getWinner(subArray))
                winningFields = ['d', 1];
                // 3.2 right to left
            subArray = [];
            for (let i = 0; i < n; i++) {
                for (let j = n-1; j >= 0; j--)
                    if (j === n-i-1)
                        subArray.push(this.board[i][j]);
            }
            if (getWinner(subArray))
                winningFields = ['d', -1];

            if(this.board.every((v) => {
                if (v.every((vv) => {
                    return vv !== '';
                }))
                return true;
            }) && finished == false) {
                winner = -1;
                winningFields = [];
                finished = true;
            }
        }
        return [finished, winner, winningFields];
    }
};

// button onClick events
$('#init-button-one').click(() => {
    GAME.mode = 1;
    $('#circle-1').css({'visibility': 'visible'});
    $('#circle-2').css({'visibility': 'hidden'});
});
$('#init-button-two').click(() => {
    GAME.mode = 2;
    $('#circle-1').css({'visibility': 'hidden'});
    $('#circle-2').css({'visibility': 'visible'});
});
$('#init-symbol-x').click(() => {
    GAME.marker = 'X';
    GAME.playerOne = 'X';
    GAME.playerTwo = 'O';
    $('#circle-x').css({'visibility': 'visible'});
    $('#circle-o').css({'visibility': 'hidden'});
});
$('#init-symbol-o').click(() => {
    GAME.marker = 'O';
    GAME.playerOne = 'O';
    GAME.playerTwo = 'X';
    $('#circle-o').css({'visibility': 'visible'});
    $('#circle-x').css({'visibility': 'hidden'});
});
$('#init-submit').click(() => {
    let boardSize = $('#init-board-size').val();
    if(isNaN(parseInt(boardSize)) || boardSize < 3 || boardSize > 9) {
        GAME.reset();
    }
    else {
        $('.wrapper').fadeOut(fadeTime);
        $('#error-msg').hide();
        $('#init').fadeOut(fadeTime, () => {
            $('#board').css({'visibility': 'visible'});
            GAME.initialize(boardSize);
            $('.wrapper').fadeIn(fadeTime);
            $('#board').fadeIn(fadeTime, () => {
                GAME.play();
            });
        });
    }
    $('#init-submit').attr('disabled', true);
});
$('#board-reset').click(() => {
    $('#init-submit').attr('disabled', false);
    GAME.reset();
});

// other functions
function generateBoard(n) {
    let fontSize = Math.round(8/n*1000)/1000 + 'vw';
    if (n > 5)
        fontSize = Math.round(7/n*1000)/1000 + 'vw';
    $('#board-buttons').css({'font-size': fontSize});
    if (n > 4) {
        $('.wrapper').css({'margin-top': '2%'});
    }
    else {
        $('.wrapper').css({'margin-top': '4%'});
    }

    let size = Math.round(0.3/n*100) + 'vw';
    if (n == 10 || n == 8) size = Math.round(0.27/n*1000)/10 + 'vw';
    $('#board-buttons').css({'font-size': fontSize});

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            let btn = $('<button/>');
            $(btn).attr('value', `${i}${j}`);
            $(btn).addClass('btn board-btn');
            $(btn).css({'width': size, 'height': size});
            $(btn).css({'fontSize': fontSize});
            $('#board-buttons').append(btn);
        }
        $('#board-buttons').append($('<br>'));
    }
    return $('#board-buttons .board-btn');
}
function resetBoard() {
    $('#circle-1').css({'visibility': 'visible'});
    $('#circle-2').css({'visibility': 'hidden'});
    $('#circle-x').css({'visibility': 'visible'});
    $('#circle-o').css({'visibility': 'hidden'});
    $('#turn-info').text('');
    $('.wrapper').fadeOut(fadeTime);
    $('#board').fadeOut(fadeTime, () => {
        $('#board-buttons').empty();
        $('#init-submit').attr('disabled', false);
        $('.wrapper').fadeIn(fadeTime);
        $('#init').fadeIn(fadeTime);
    });
}
function matrix(n) {
    let mat = [];
    let temp = [];
    for (let i = 0; i < n; i++)
        temp.push('');
    for (let i = 0; i < n; i++)
        mat.push(temp.slice());
    return mat.slice();
}
function markFields(type, id) {
    let buttons = $('#board-buttons .board-btn');
    for (let i = 0; i < buttons.length; i++) {
        let val = $(buttons[i]).attr('value');
        switch(type) {
            case 'r':
                if (val[0] == id) $(buttons[i]).addClass('btn-win');
                break;
            case 'c':
                if (val[1] == id) $(buttons[i]).addClass('btn-win');
                break;
            case 'd':
                if (id == 1) {
                    if (val[0] == val[1]) $(buttons[i]).addClass('btn-win');
                }
                else if (id == -1) {
                    let n = Math.sqrt(buttons.length);
                    if (val[1] == n-val[0]-1) $(buttons[i]).addClass('btn-win');
                }
                break;
        }
    }
}
