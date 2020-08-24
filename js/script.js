const FIELD_SIZE_X = 20;    //Размер игрового поля по X
const FIELD_SIZE_Y = 20;    //Размер игрового поля по Y

let snake = []; //сама змейка

let gameIsRunning = false;  //Игра на старте не запущена
let direction = "y+"; //По умолчанию вниз (x+, x-, y-, y+)
let snakeSpeed = 300;   //Интервал в мс движения змейки
let snakeTimer; //таймер змейки
let score = 0;	//Очки

/*
    Функция инициализации игрового пространства
*/

function init() {
	prepareGameField();
	//вешаем на кнопку старта слушатель
	document.getElementById("snake-start").addEventListener("click", startGame);
	document.getElementById("snake-renew").addEventListener("click", refreshGame);

	//добавляем отслеживание нажатия на клавиатуру
	addEventListener("keydown",  changeDirection);
}

/*
    Функция запуска игры
*/
function startGame() {
	gameIsRunning = true;
	respawn();
	snakeTimer = setInterval(move, snakeSpeed);
	setTimeout(createFood, 3000);		// разбрасываем печеньки
}

/*
    Функция организации новой игры
*/
function refreshGame() {
	location.reload();
}

/*
    Функция подготовки игрового поля
*/
function prepareGameField() {
	let gameTable = document.createElement("table");
	gameTable.setAttribute("class", "game-table");

	//в цикле генерируем ячейки игровой таблицы
	for(let i = 0; i < FIELD_SIZE_Y; i++){
		let row = document.createElement("tr");
		row.setAttribute("class", "game-table-row row-" + i);

		for(let j = 0; j < FIELD_SIZE_X; j++){
			let cell = document.createElement("td");
			cell.setAttribute("class", "game-table-cell cell-" + j + "-" + i);

			row.appendChild(cell);
		}

		gameTable.appendChild(row);
	}

	document.getElementById("snake-field").appendChild(gameTable);
}

/*
    Расположение змейки на игровом поле
    Стартовая длина змейки: 2 элемента (голова и хвост)
    Змейка - это массив элементов .game-table-cell
*/
function respawn() {
	//начинаем из центра
	let startCoordX = Math.floor(FIELD_SIZE_X / 2);
	let startCoordY = Math.floor(FIELD_SIZE_Y / 2);

	let snakeHead = document.getElementsByClassName("cell-" + startCoordX + "-" + startCoordY)[0];
	let prevSnakeHeadAttr = snakeHead.getAttribute("class");	//Сохраняем предыдущие классы ячейки прежде чем добавлять голову
	snakeHead.setAttribute("class", prevSnakeHeadAttr + " snake-unit");

	let snakeTail = document.getElementsByClassName("cell-" + startCoordX + "-" + (startCoordY - 1))[0];
	let prevSnakeTailAttr = snakeTail.getAttribute("class");	//Сохраняем предыдущие классы ячейки прежде чем добавлять хвост
	snakeTail.setAttribute("class", prevSnakeTailAttr + " snake-unit");

    //Добавляем хвост в массив змейки
	snake.push(snakeTail);
	//Добавляем голову в массив змейки
	snake.push(snakeHead);
}

/*
    Организация движения змейки
*/
function move() {
    //Соберем классы головы змейки
	let snakeHeadClasses = snake[snake.length - 1].getAttribute("class").split(" ");

	//Сдвигаем голову на 1 клетку
	let newUnit;
	let snakeCoords = snakeHeadClasses[1].split("-");
	let coordX = parseInt(snakeCoords[1]);
	let coordY = parseInt(snakeCoords[2]);

	//Определяем новую точку по направлению
	if(direction == "y+") {
		newUnit = document.getElementsByClassName("cell-" + coordX + "-" + (coordY + 1))[0];
	}
	else if(direction == "y-") {
		newUnit = document.getElementsByClassName("cell-" + coordX + "-" + (coordY - 1))[0];
	}
	else if(direction == "x+") {
		newUnit = document.getElementsByClassName("cell-" + (coordX + 1) + "-" + coordY)[0];
	}
	else if (direction == "x-") {
		newUnit = document.getElementsByClassName("cell-" + (coordX - 1) + "-" + coordY)[0];
	}
	//console.log(newUnit);
	//проверяем, что newUnit - это не часть змейки
	//также проверяем, что змейка не дошла до границы
	if (!isSnakeUnit(newUnit) && newUnit !== undefined) {
		//добавляем новую часть змейки
		newUnit.setAttribute("class", newUnit.getAttribute("class") + " snake-unit");
		snake.push(newUnit);
		// подключаем функцию для вывода счёта в реальном времени
		getScoreInHtml()
		//если змейка не ела, подчищаем хвост
		if(!haveFood(newUnit)){
			//находим удаляемый элемент
			let removed = snake.splice(0, 1)[0];
			let classes = removed.getAttribute("class").split(" ");
			//удаляем маркирующий класс
			removed.setAttribute("class", classes[0] + " " + classes[1]);
		}

	}
	else{
		finishTheGame();
	}
}

/*
	Проверяем элемент на принадлежность змейке
*/
function isSnakeUnit(unit) {
	let check = false;

	if (snake.includes(unit)) {
		check = true;
	}

	return check;
}

/*
	Проверяем встречу с едой
*/
function haveFood(unit) {
	let check = false;
	let unitClasses = unit.getAttribute("class").split(" ");

	//змейка нашла еду
	if (unitClasses.includes("food-unit")) {
		check = true;

		unit.setAttribute("class", unitClasses[0] + " " + unitClasses[1] + " " + unitClasses[3]);

		//создаём новую еду
		createFood();

		//увеличиваем очки
		score++;
	}

	return check;
}

/*
	Создаём еду
*/
function createFood() {
	let foodCreated = false;

	while (!foodCreated){
		//выбираем случайную клетку
		let foodX = Math.floor(Math.random() * (FIELD_SIZE_X));
		let foodY = Math.floor(Math.random() * (FIELD_SIZE_Y));

		let foodCell = document.getElementsByClassName("cell-" + foodX + "-" + foodY)[0];
		let foodCellClasses = foodCell.getAttribute("class").split(" ");

		//если тут нет змейки
		if (!foodCellClasses.includes("snake-unit")) {
			//ставим сюда еду
			let classes = "";
			for (let i = 0; i < foodCellClasses.length; i++) {
				classes += foodCellClasses[i] + " ";
			}

			foodCell.setAttribute("class", classes + "food-unit");
			foodCreated = true;
		}
	}
}

/*
	Управление движением змейки
*/
function changeDirection(e) {
    switch (e.key){
		case "Left": // IE/Edge specific value
		case "ArrowLeft": 
			//если нажата клавиша влево если до этого двигались вправо, то ничего не произойдет            
			if (direction != "x+")
				direction = "x-";
            break;
		case "Up": // IE/Edge specific value
		case "ArrowUp":  
			//если нажата клавиша вверх
			if (direction != "y+")
				direction = "y-";
            break;
		case "Right": // IE/Edge specific value
		case "ArrowRight":  
			//если нажата клавиша вправо
			if (direction != "x-")
				direction = "x+";            
            break;
		case "Down": // IE/Edge specific value
		case "ArrowDown":  
			//если нажата клавиша вниз
            if (direction != "y-")
				direction = "y+"; 
            break;
    }
}

/*
	Делаем функцию для вывода счета сразу на страницу в режиме реального времени
*/

function getScoreInHtml() {
	let scoreInHtml = document.getElementById('score');
	scoreInHtml.innerHTML = ("Ваш счет: " + score);
}


/*
	Действия для завершения игры.
*/

function finishTheGame() {
	gameIsRunning = false;
	createFood = false;
	clearInterval(snakeTimer);
	console.log("Игра закончена, Вы собрали " + score + " шт. вкусняшек");
	alert("Игра закончена, Вы набрали " + score + " шт. вкусняшек");
}


//стартуем
window.onload = init;
