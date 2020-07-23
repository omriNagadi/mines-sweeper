'use strict';

var HAPPY_S = '😁'
var EXPLODING_S = '😖'
var WINNING_S = '🤩'
var MINE = '🧨'
var EMPTY = '';
var FLAG = '⛳'
var HINT = '💡';

var gBoard;
var gLevel = {
    size: 9,
    mines: 1
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
var gTimerIsOn = false;
var gHintInterval = null;
var gHintedCell = null;
var gElSmiley = document.querySelector('.smiley')

function initGame() {
    gBoard = buildEmptyBoard();
    gGame.isOn = true;
    gGame.flaggedCellsCount = 0;
    var elMarkLeft = document.querySelector('.marks-left')
    elMarkLeft.innerText = gMarksLeft;
    gMarkedMine = 0;
    gGame.shownCellsCount = 0;
    gMarksLeft = gLevel.mines;
    gHintedCell = null;
    gElSmiley.innerHTML = HAPPY_S;
    resetTimer();
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
    if (isFirstClick) {
        if (!gTimerIsOn) {
            gTimerIsOn = true;
            setTimer();
        }
    }
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
        gElSmiley.innerHTML = WINNING_S;
        cell.isMarked = true;
        gTimerIsOn = false;
        revealNumbers(elCell, gBoard)
        // gLevel.size++;
        // gLevel.mines += 3;
        // initGame()
    }
    elMarkLeft.innerText = gMarksLeft;

}

function cellClicked(elCell, i, j) {
    gFirstClickedCell = { i, j };
    if (isFirstClick) {                         //if its the first click build a new board with mines
        gBoard = buildBoardWithMines();         //activate the timer interval, change the first sell to shown
        var cell = gBoard[i][j]
        if (cell.isMarked) return;
        if (!gTimerIsOn) {                      //and cancel the choise to press on a marked cell.
            gTimerIsOn = true;
            setTimer();
        }
        cell.isShown = true;
        gGame.shownCellsCount++
        // gGame.shownCellsCount++;
        renderboard();
    }

    if (gGame.isOn) {
        var cell = gBoard[i][j]
        if (cell.isMarked) return;

        if (cell.isMine) {
            elCell.innerText = MINE;
            gElSmiley.innerHTML = EXPLODING_S;
            gameOver();
            revealMines(gBoard)
            return;
        } else {
            elCell.innerText = cell.minesAroundCount;
            if (!cell.isShown) gGame.shownCellsCount++
            cell.isShown = true
        }
        if (cell.minesAroundCount === 0) {
            var elCell = document.querySelector(`.cell-${cell.i}-${cell.j}`);
            elCell.innerText = EMPTY;
            elCell.classList.add('pressed-cell')
            if (!cell.isShown) gGame.shownCellsCount++
            cell.isShown = true;
            console.log('cell.minesAroundCount', cell.minesAroundCount);
            revealNegs(cell);
        }

        if (gGame.shownCellsCount === (gLevel.size ** 2 - gLevel.mines)) {          //win condition
            cell.isShown = true
            alert('you won')
            gElSmiley.innerHTML = WINNING_S;
            gTimerIsOn = false;
        }
        // if (isFirstClick) gGame.shownCellsCount--;
        console.log('cell.minesAroundCount', cell.minesAroundCount);


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
            if (i === cell.i && j === cell.j) continue;
            if (j < 0 || j === gLevel.size) continue;
            var currCell = gBoard[i][j]
            if (currCell.isMarked) continue;
            // if (currCell.isShown) gGame.shownCellsCount--;
            // if (!currCell.isShown) ;
            var elCell = document.querySelector(`.cell-${i}-${j}`);
            elCell.innerText = currCell.minesAroundCount;
            if (currCell.minesAroundCount === 0) {
                elCell.innerText = EMPTY;
                elCell.classList.add('pressed-cell');
                if (!currCell.isShown) gGame.shownCellsCount++
                console.log(`currCell${currCell.i},${currCell.j}`)
            } else if (!currCell.isShown) gGame.shownCellsCount++;
            console.log('gGame.shownCellsCount:', gGame.shownCellsCount);
            gBoard[i][j].isShown = true;

        }
    }
    console.log(gBoard);
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
    gTimerIsOn = false;
    alert('loser')
}

function revealMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isMarked && cell.isMine) continue;
            if (cell.isMine) renderCell({ i, j }, MINE);
            ;
        }
    }
}
function revealNumbers(elCell, board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (cell.isShown) continue;
            if (cell.isMine) continue;
            if (cell.isMarked) continue;
            renderCell({ i, j }, cell.minesAroundCount);
        }
    }
}

function setTimer() {
    if (gTimerIsOn) {
        var elTime = document.querySelector('.time')
        var timeTxt = elTime.innerHTML;
        var timeArr = timeTxt.split(':')
        var min = timeArr[0];
        var sec = timeArr[1];
        if (sec === 59) {
            min++;
            if (min < 10) min = '0' + min;
            sec = 0;
        } else {
            sec++;
            if (sec < 10) sec = '0' + sec
        }
        elTime.innerHTML = min + ':' + sec;
        setTimeout(setTimer, 1000);

    }
}
function resetTimer() {
    var elTime = document.querySelector('.time')
    elTime.innerHTML = `00:00`
}
var gBtnNum = 1;
function useHint() {
    if (gGame.isOn && !isFirstClick) {
        var counterArr = [];
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                var cell = gBoard[i][j];
                if (!cell.isMine && !cell.isShown) {
                    counterArr.push(cell);
                }
            }
        }
        var rndCell = counterArr.splice(getRandomIntInclusive(0, counterArr.length - 1), 1)[0]
        // console.log(rndCell);
        for (var i = rndCell.i - 1; i <= rndCell.i + 1; i++) {
            if (i < 0 || i === gLevel.size) continue;
            for (var j = rndCell.j - 1; j <= rndCell.j + 1; j++) {
                // if (i === rndCell.i && j === rndCell.j) continue;
                if (j < 0 || j === gLevel.size) continue;
                var currCell = gBoard[i][j];
                if (currCell.isShown) continue;
                var elCurrCell = document.querySelector(`.cell-${currCell.i}-${currCell.j}`);
                elCurrCell.innerHTML = currCell.isMine ? MINE : currCell.minesAroundCount;
            }
        }
        gHintedCell = rndCell;
        
        var elBtn1 = document.querySelector('.hint1');
        var elBtn2 = document.querySelector('.hint2');
        var elBtn3 = document.querySelector('.hint3');
        switch (gBtnNum) {
            case 1:
                elBtn1.disabled = true;
                break;
            case 2:
                elBtn2.disabled = true;
                break;
            case 3:
                elBtn3.disabled = true;
            break;
        }
        gBtnNum++;
        closeHintCells()
    }
}
function closeHintCells() {
    var x = 0;
    gHintInterval = setTimeout(function () {
        x++;
        var rndCell = gHintedCell;
        for (var i = rndCell.i - 1; i <= rndCell.i + 1; i++) {
            if (i < 0 || i === gLevel.size) continue;
            for (var j = rndCell.j - 1; j <= rndCell.j + 1; j++) {
                // if (i === rndCell.i && j === rndCell.j) continue;
                if (j < 0 || j === gLevel.size) continue;
                var currCell = gBoard[i][j];
                if (currCell.isShown) continue;

                var elCurrCell = document.querySelector(`.cell-${currCell.i}-${currCell.j}`);
                elCurrCell.innerText = EMPTY;
                if (currCell.isMarked) elCurrCell.innerText = FLAG;
            }
        }
        
        // document.querySelectorAll('.btn').disabled = false;
    }, 1500)
    if (x === 1) clearTimeout(gHintInterval);
}