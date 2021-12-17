// Список уровней
const levels = [
  {
    id: 1,
    name: "Легкий",
    width: 8,
    height: 8,
    mines: 10,
  }, 
  {
    id: 2,
    name: "Средний",
    width: 18,
    height: 14,
    mines: 40,
  }, 
  {
    id: 3,
    name: "Сложный",
    width: 30,
    height: 16,
    mines: 99,
  }, 
]; 

// Параметры игры
let field = [];
let listCells = [];
let processGame = false;
let nameLevel = "Легкий";
let widthField = 8;
let heightField = 8;
let numMines = 10;
let left = widthField * heightField;
let leftDemine = numMines;
// let time = 0;

// Блоки для вывода в mines.html
let outputLevel = document.getElementsByClassName('level')[0];
let outputLeftDemine = document.getElementById('left_demine').querySelector('.data_text');
let outputLeft = document.getElementById('left_cells').querySelector('.data_text');
let outputPopupCont = document.getElementsByClassName('popup_cont')[0];
outputPopupCont.style.display = 'none';
let btnReset = document.getElementsByClassName('btn_restart')[0];
btnReset.onclick = function () {
  generateField();
  return;
}
let btnPopupReset = document.createElement('div');
btnPopupReset.classList.add('popup_el', 'main_popup_button');
btnPopupReset.textContent = "Заново"; 
btnPopupReset.onclick = function () {
  generateField();
  closePopup();
  return;
}

// let outputTime = document.getElementById('time').querySelector('.data_text');


function settingParams(id) {
  let level = levels.find(lvl => lvl.id === id);
  nameLevel = level.name;
  widthField = level.width;
  heightField = level.height;
  numMines = level.mines;
  left = widthField * heightField;
  leftDemine = numMines;
}

function generateField() {
  field = [];
  listCells = [];
  processGame = false;
  left = widthField * heightField;
  leftDemine = numMines;

  let outputField = document.getElementsByClassName('field')[0];
  while (outputField.firstChild) {
    outputField.firstChild.remove();
  }
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
        if(blockCell(idCell)) outputLeftDemine.textContent = leftDemine;
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
  outputLevel.textContent = nameLevel;
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
  let indexMines = [];
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
      // listCells[giveIdCell(row, column)].classList.add("cheat");
    }
  }
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

  let cell = giveInfoCell(id);
  if(cell.isOpened) return false;
  if(cell.isBlocked) return false;
  if(cell.role === -1) return gameOver(id);

  if(!processGame) {
    processGame = true;
    definingRoles([row, column]);
  }

  cell.isOpened = true;
  left -= 1;
  listCells[id].classList.add("cell-opened");
  if(cell.role) {
    listCells[id].textContent = cell.role;
    let nameCellRole =  "cell_" + cell.role;
    listCells[id].classList.add(nameCellRole);
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
  setTimeout(openPopup, 500, generationPopup("Вы проиграли", [btnPopupReset]));
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
  setTimeout(openPopup, 500, generationPopup("Вы выиграли", [btnPopupReset]));
  return true;
}

function iAmLoser() {
  // Для умников, которые лазят в код
  for(let i = 0; i < heightField; i++){
    for(let j = 0; j < widthField; j++){
      if(field[i][j].role == -1) {
        listCells[giveIdCell(i, j)].classList.add("cheat");
      }
    }
  }

}


// Функции для создания и работы с попапом
function generationPopup(title, content=[]) {
  let outputPopup = document.createElement('div');
  outputPopup.classList.add('popup');
  let outputPopupHead = document.createElement('div');
  outputPopupHead.classList.add('popup_el', 'popup_header');
  let outputTitle = document.createElement('div');
  outputTitle.classList.add('header_text');
  outputTitle.textContent = title;
  let closeBtn = document.createElement('div');
  closeBtn.classList.add('close_icon');
  closeBtn.onclick = function () {
    closePopup();
    return;
  }

  outputPopupHead.appendChild(outputTitle);
  outputPopupHead.appendChild(closeBtn);
  outputPopup.appendChild(outputPopupHead);
  for(let i=0; i < content.length; i++) {
    outputPopup.appendChild(content[i]);
  }

  return outputPopup;
}

function endingWord(value) {
  value = Math.abs(value);
  if((value > 10) && (value < 20)) {
    return "мин";
  } else {
    value = value % 10;
    if((value == 0) || (value > 4)) return "мин";
    if(value == 1) return "минa";
    return "мины";
  }
}

function openPopup(popup) { 
  while (outputPopupCont.firstChild) {
    outputPopupCont.firstChild.remove();
  }
  outputPopupCont.appendChild(popup);
  outputPopupCont.style.display = 'flex';
}

function closePopup() { 
  while (outputPopupCont.firstChild) {
    outputPopupCont.firstChild.remove();
  }
  outputPopupCont.style.display = 'none';
}


// Создание блока управления уровнем сложности
let popupLevelsEl = document.createElement('div');
popupLevelsEl.classList.add('popup_el', 'popup_level_cont');
for(let i=0; i < levels.length; i++) {
  let level = levels[i];
  let popupLevelEl = document.createElement('div');
  popupLevelEl.classList.add('popup_level');
  popupLevelEl.onclick = function () {
    settingParams(level.id);
    generateField();
    closePopup();
    return;
  }
  let popupLevelName = document.createElement('div');
  popupLevelName.classList.add('popup_level_title');
  popupLevelName.textContent = level.name;
  let descriptionLevel = "поле " + level.width + "x" + level.height + ", " + level.mines + " " + endingWord(level.mines);
  let popupLevelDescript = document.createElement('div');
  popupLevelDescript.classList.add('popup_level_descript');
  popupLevelDescript.textContent = descriptionLevel;
  popupLevelEl.appendChild(popupLevelName);
  popupLevelEl.appendChild(popupLevelDescript);
  popupLevelsEl.appendChild(popupLevelEl);
}
let popupLevels = generationPopup("Выберите уровень сложности", [popupLevelsEl]);
let btnPopupLevels = document.getElementsByClassName('level')[0];
btnPopupLevels.onclick = function () {
  openPopup(popupLevels);
  return;
}


settingParams(2);
generateField();

