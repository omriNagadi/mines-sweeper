'use strict';

var MINE = '🧨'
var EMPTY = '';
var FLAG = '⛳'

var gBoard;
var gLevel = {
    size: 8,
    mines: 8
}
var gGame = {
    isOn: false,
    shownCellsCount: 0,
    flaggedCellsCount: 0,
    secsPassed: 0
}
var gMarksLeft = gLevel.mines;
var gMarkedMine = 0;
var isFirstClick = true;
var gFirstClickedCell;

function initGame() {
    gBoard = buildEmptyBoard();
    // console.log(gBoard);
    gGame.isOn = true;
    gGame.flaggedCellsCount = 0;
    var elMarkLeft = document.querySelector('.marks-left')
    elMarkLeft.innerText = gMarksLeft;
    gMarkedMine = 0;
    gGame.shownCellsCount = 0;
    gMarksLeft = gLevel.mines;
    renderboard();
    isFirstClick = true;

}

function buildBoardWithMines() {
    var SIZE = gLevel.size;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < SIZE; j++) {
            var cell = {
                i,
                j,
                minesAroundCount: 0,
                isShown: false,
                isMarked: false,
                isMine: false,
            }
            board[i][j] = cell;
        }
    }
    var minesNums = setRandomMines();
    for (var i = 0; i < minesNums.length; i++) {
        var rndNum = minesNums[i];
        var currCell = board[rndNum.i][rndNum.j]
        currCell.isMine = true;
        // console.log(currCell);
    }
    countMineNegsForBoard(board);
    return board;
}
function buildEmptyBoard() {
    var SIZE = gLevel.size;
    var board = [];
    for (var i = 0; i < SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < SIZE; j++) {
            var cell = {
                i,
                j,
                minesAroundCount: 0,
                isShown: false,
                isMarked: false,
                isMine: false,
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function renderboard() {
    var board = gBoard;
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>'
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            var cellClass = `cell-${i}-${j}`;
            strHtml += `<td class="cell ${cellClass}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="markCell(${i}, ${j})">${(cell.isShown) ? cell.minesAroundCount : EMPTY}`
            strHtml += '</td>'
            // (cell.isMine) ? MINE : EMPTY
        }
        strHtml += '</tr>'
    }

    var elBoardCells = document.querySelector('.board-cells');
    elBoardCells.innerHTML = strHtml;
}

function markCell(i, j) {
    // console.log(event)
    var elBoard = document.querySelector('.board');
    elBoard.addEventListener('contextmenu', e => {
        e.preventDefault();
    });
    var cell = gBoard[i][j]
    var elMarkLeft = document.querySelector('.marks-left')
    var elCell = elBoard.querySelector(`.cell-${i}-${j}`);

    if (gGame.flaggedCellsCount === gLevel.mines) {
        if (cell.isMarked) {
            cell.isMarked = false;
            elCell.innerText = EMPTY;
            gGame.flaggedCellsCount--;
            gMarksLeft++;
        }
    } else if (!cell.isMarked && !cell.isShown) {
        cell.isMarked = true;
        elCell.innerText = FLAG;
        gGame.flaggedCellsCount++;
        gMarksLeft--;


    } else if (gGame.flaggedCellsCount !== gLevel.mines && cell.isMarked) {
        cell.isMarked = false;
        elCell.innerText = EMPTY;
        gGame.flaggedCellsCount--;
        gMarksLeft++;

    }
    if (cell.isMarked && cell.isMine) {
        gMarkedMine++
    }
    if (!cell.isMarked && cell.isMine && gGame.flaggedCellsCount !== gLevel.mines) gMarkedMine--;
    console.log('markedmine:', gMarkedMine);
    console.log('gGame.flaggedCellsCount:', gGame.flaggedCellsCount);

    if ((gGame.flaggedCellsCount === gMarkedMine) && (gMarkedMine === gLevel.mines)) {
        alert('you won')
        gLevel.size++;
        gLevel.mines += 3;
        initGame()
    }
    elMarkLeft.innerText = gMarksLeft;

}

function cellClicked(elCell, i, j) {
    gFirstClickedCell = { i, j };
    if (isFirstClick) {
        gBoard = buildBoardWithMines();
        var cell = gBoard[i][j]
        cell.isShown = true;
        if (cell.isMarked) return;
        renderboard();
    }

    if (gGame.isOn) {
        var cell = gBoard[i][j]
        if (cell.isMarked) return;
        cell.isShown = true;
        if (cell.isMine) {
            elCell.innerText = MINE;
            gameOver();
            revealMines(elCell, gBoard)
            return;

        } else {
            cell.isShown = true
            console.log('cell.minesAroundCount', cell.minesAroundCount);
            // debugger
            elCell.innerText = cell.minesAroundCount;
            // renderboard();
            gGame.shownCellsCount++;
            //  if (!isFirstClick)
        }
        if (cell.minesAroundCount === 0) {
            var elCell = document.querySelector(`.cell-${cell.i}-${cell.j}`);
            elCell.innerText = EMPTY;
            revealNegs(cell);
        }

        if (gGame.shownCellsCount === (gLevel.size ** 2 - gLevel.mines)) {
            alert('you won')
        }
        // renderboard
    }

    isFirstClick = false;

}

function countMineNegsForBoard(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMine) continue;
            var negsNum = countMineNegsForCell(board, cell);
            cell.minesAroundCount = negsNum;
        }
    }
}


function countMineNegsForCell(board, cell) {
    var counter = 0;
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i < 0 || i === gLevel.size) continue;
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            if (i === cell.i && j === cell.j) continue;
            if (j < 0 || j === gLevel.size) continue;
            if (board[i][j].isMine) counter++;
        }
    }
    return counter;
}
function revealNegs(cell) {
    for (var i = cell.i - 1; i <= cell.i + 1; i++) {
        if (i < 0 || i === gLevel.size) continue;
        for (var j = cell.j - 1; j <= cell.j + 1; j++) {
            // if (i === cell.i && j === cell.j) continue;
            if (j < 0 || j === gLevel.size) continue;
            if (gBoard[i][j].isMarked) continue;
            gBoard[i][j].isShown = true;
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            elCell.innerText = gBoard[i][j].minesAroundCount;
            if (gBoard[i][j].minesAroundCount === 0) {
                elCell.innerText = EMPTY;
                elCell.style.backgroundColor = 'red';
            }
        }
    }
}


function setRandomMines() {
    var mines = [];
    var currCell = { i: -1, j: -1 };
    for (var d = 0; d < gLevel.mines; d++) {
        var rndNum1 = getRandomIntInclusive(0, gLevel.size - 1);
        var rndNum2 = getRandomIntInclusive(0, gLevel.size - 1);
        while (gFirstClickedCell.i === rndNum1 && gFirstClickedCell.j === rndNum2) {
            rndNum1 = getRandomIntInclusive(0, gLevel.size - 1);
            rndNum2 = getRandomIntInclusive(0, gLevel.size - 1);
        }
        currCell = { i: rndNum1, j: rndNum2 };
        //loop makes sure the mines won't be in the same cell
        for (var j = 0; j < mines.length; j++) {
            if (mines[j].i === rndNum1 && mines[j].j === rndNum2) {
                mines.splice(j, 1);
                d--;
            }
        }
        mines.push(currCell)
    }
    return mines;
}

function gameOver() {
    gGame.isOn = false;
    alert('loser')
}

function revealMines(elCell, board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if(cell.isMarked)continue;
            if (cell.isMine) renderCell({ i, j }, MINE);
            ;
        }
    }
}