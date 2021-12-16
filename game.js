let field = [];
let listCells = [];

let processGame = false;
let time = 0;
let outputLeftDemine = document.getElementById('left_demine').querySelector('.data_text');;
let outputLeft = document.getElementById('left_cells').querySelector('.data_text');;
let outputTime = document.getElementById('time').querySelector('.data_text');

let widthField = 18;
let heightField = 14;
let numMines = 40;

let left = widthField * heightField;
let leftDemine = numMines;

function generateField() {
  let outputField = document.getElementsByClassName('field')[0];
  for(let i = 0; i < heightField; i++){
    let row = [];
    let outputRow = document.createElement('div');
    outputRow.classList.add('row');
    for(let j = 0; j < widthField; j++){
      let cell = {
        role: 0,
        isOpened: false,
        isBlocked: false,
      };
      let idCell = i * widthField + j;
      let outputCell = document.createElement('div');
      outputCell.className = 'cell';
      outputCell.id = idCell;
      outputCell.onclick = function () {
        openCell(idCell);
        outputLeft.textContent = left;
        return;
      }
      outputCell.oncontextmenu = function () {
        blockCell(idCell);
        outputLeftDemine.textContent = leftDemine;
        return false;
      }
      outputRow.appendChild(outputCell);
      row.push(cell);
    }
    outputField.appendChild(outputRow);
    field.push(row);
  }
  listCells = outputField.querySelectorAll('.row .cell');
  outputLeftDemine.textContent = leftDemine;
  outputLeft.textContent = left;
}

function randomIndex(max) {
  let rand = Math.random() * max - 0.5;
  return Math.round(rand);
}

function giveInfoCell(id) {
  let column = id % widthField;
  let row = (id - column) / widthField;
  return field[row][column];
}

function giveIdCell(x, y) {
  let mineId = x * widthField + y;
  return mineId;
}

function definingRoles(openCell) {
  if(widthField * heightField < numMines + 9) return false;
  while(indexMines.length < numMines) {
    let row = randomIndex(heightField);
    let column = randomIndex(widthField);
    if((row >= openCell[0] - 1) && (row <= openCell[0] + 1) && (column >= openCell[1] - 1) && (column <= openCell[1] + 1))
      continue;
    if(field[row][column].role != -1) {
      field[row][column].role = -1;
      indexMines.push({
        row: row,
        column: column,
      });
      listCells[giveIdCell(row, column)].classList.add("cheat");
    }
  }
  console.log(indexMines);
  for(let id = 0; id < numMines; id++){
    let mine = indexMines[id];
    for(let i = mine.row - 1; i <= mine.row + 1; i++){
      for(let j = mine.column - 1; j <= mine.column + 1; j++){
        if((i < 0) || (j < 0) || (i >= heightField) || (j >= widthField)) continue;
        if((i == mine.row) && (j == mine.column)) continue;
        if(field[i][j].role != -1) field[i][j].role += 1;
      }
    }
  }
}

function openCell(id) {
  let column = id % widthField;
  let row = (id - column) / widthField;

  if(!processGame) {
    processGame = true;
    definingRoles([row, column]);
  }

  let cell = giveInfoCell(id);
  if(cell.isOpened) return false;
  if(cell.isBlocked) return false;
  if(cell.role === -1) return gameOver(id);

  cell.isOpened = true;
  left -= 1;
  listCells[id].classList.add("cell-opened");
  if(cell.role) {
    listCells[id].textContent = cell.role;
  } else {
    for(let i = row - 1; i <= row + 1; i++){
      for(let j = column - 1; j <= column + 1; j++){
        if((i < 0) || (j < 0) || (i >= heightField) || (j >= widthField)) continue;
        if((i == row) && (j == column)) continue;
        openCell(giveIdCell(i, j));
      }
    }
  }
  if(left == numMines) return gameWin();
  return true;
}

function blockCell(id) {
  if(!processGame) return false;
  let cell = giveInfoCell(id);
  if(cell.isOpened) return false;

  if(cell.isBlocked){
    leftDemine += 1;
    listCells[id].classList.remove("cell-blocked");
    cell.isBlocked = false;
  } else {
    leftDemine -= 1;
    listCells[id].classList.add("cell-blocked");
    cell.isBlocked = true;
  }
  return true;
}

function gameOver(id) {
  giveInfoCell(id).isOpened = true;
  listCells[id].classList.add("cell-mine-clicked");
  for(let i = 0; i < heightField; i++){
    for(let j = 0; j < widthField; j++){
      let outputCell = listCells[giveIdCell(i, j)];
      let cell = field[i][j];
      outputCell.classList.add("finish-cell");
      if((cell.role == -1) && (!cell.isOpened) && (!cell.isBlocked)) {
        outputCell.classList.add("cell-mine");
      }
      cell.isOpened = true;
      if((cell.role != -1) && (cell.isBlocked)) {
        outputCell.classList.add("misjudgment");
        cell.isOpened = false;
      }
    }
  }
  processGame = false;
  return true;
}

function gameWin() {
  outputLeftDemine.textContent = 0;
  for(let i = 0; i < heightField; i++){
    for(let j = 0; j < widthField; j++){
      let mineId = i * widthField + j;
      if((field[i][j].role == -1) && (!field[i][j].isBlocked)) {
        listCells[mineId].classList.add("cell-blocked");
        field[i][j].isBlocked = true;
      }
      listCells[mineId].classList.add("finish-cell");
      field[i][j].isOpened = true;
    }
  }
  leftDemine = numMines;
  processGame = false;
  return true;
}

generateField();

