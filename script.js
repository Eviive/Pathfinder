// TODO: templates if every block is missing (via JSON maybe)
// TODO: do a larger cursor in order to place walls easily

let body = document.body;
let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");

let btnPopup = document.querySelector("#btn-popup");
let btnSpawn = document.querySelector("#btn-spawn");
let btnDestination = document.querySelector("#btn-destination");
let btnWall = document.querySelector("#btn-wall");
let btnPlay = document.querySelector("#btn-play");
let btnReset = document.querySelector("#btn-reset");

let btnStatus = null;
let spawnStatus = false;
let destinationStatus = false;
let launchedStatus = false;

const lineWidth = 2;
const colorPath = "#ffffff66";
const colorWhite = "#ffffff";
const colorGreen = "#27d507";
const colorRed = "#ff0000";
const colorBlue = "#0000e8";

const gridSize = 40;
let squareSize;
let canvasMap = createArray(gridSize, gridSize);
let spawnX, spawnY;
let destinationX, destinationY;

let distance = createArray(gridSize, gridSize);
let visited = createArray(gridSize, gridSize);
let predecessor = createArray(gridSize, gridSize);
let foundPath;


/**
 * @param {Number} length size of a dimension
 * @returns a 2D array
 */
function createArray(length) {
	var arr = new Array(length || 0), i = length;
	if (arguments.length > 1) {
		var args = Array.prototype.slice.call(arguments, 1);
		while(i--) {
			arr[length-1 - i] = createArray.apply(this, args);
		}
	}
	return arr;
}

/**
 * @param {Number} x X position
 * @param {Number} y Y position
 * @returns {Boolean} checks if the coordinates are part of the exterior walls
 */
let exteriorWallsTest = (x, y) => {
	if (x == 0 || x == canvas.width / squareSize - 1 || y == 0 || y == canvas.height / squareSize - 1) {
		return true;
	}
	return false;
};

class Square {
	static ratio = 1;

	constructor(xPos, yPos, size, color) {
		this.xPos = xPos + lineWidth / 1.2;
		this.yPos = yPos + lineWidth / 1.2;
		this.size = size - lineWidth * 1.2;
		this.color = color;
	}

	draw() {
		context.fillStyle = this.color;
		context.fillRect(this.xPos * Square.ratio, this.yPos * Square.ratio, this.size * Square.ratio, this.size);
	}
}

class Circle {
	static ratio = 1;

	constructor(xPos, yPos, radius, color) {
		this.xPos = xPos + squareSize / 2;
		this.yPos = yPos + squareSize / 2;
		this.radius = radius * 0.8;
		this.color = color;
	}

	draw() {
		context.beginPath();
		context.lineWidth = lineWidth;
		context.arc(this.xPos * Circle.ratio, this.yPos * Circle.ratio, this.radius * Circle.ratio, 0, Math.PI * 2, false);
		context.fillStyle = this.color;
		context.fill();
		context.closePath();
	}
}

/**
 * @returns adapts the size of the canvas
 */
function canvasSize() {
	canvas.width = Math.min(.85 * body.clientWidth, .7 * body.clientHeight);
	canvas.height = canvas.width;
	squareSize = canvas.width / gridSize;
}

/**
 * @returns draws the grid responsively
 */
function drawGrid() {
	let cSize = canvas.width;

	context.beginPath();
	context.lineWidth = lineWidth;
	context.strokeStyle = colorPath;

	for (let i = 0; i <= cSize; i = i + squareSize) {
		/***************rows***************/
		context.moveTo(0, i);
		context.lineTo(cSize, i);
		
		/***************columns***************/
		context.moveTo(i, 0);
		context.lineTo(i, cSize);
	}

	context.stroke();
	context.closePath();
}

/**
 * @returns draws the exterior walls
 */
function exteriorWalls() {
	for (let i = 0; i < canvas.width / squareSize; i++) {
		for (let j = 0; j < canvas.width / squareSize; j++) {
			if (exteriorWallsTest(i, j)) {
				canvasMap[i][j] = "wall";
			}
			else {
				canvasMap[i][j] = "empty";
			}
		}
	}
	spawnStatus = false;
	btnSpawn.innerHTML = "Place spawn : 1";
	destinationStatus = false;
	btnDestination.innerHTML = "Place destination : 1";
}

/**
 * @returns generates a random spawn and destination
 */
function randomGeneration() {
	spawnX = Math.round(Math.random() * (((canvas.width - 2 * squareSize) / squareSize) - 1) + 1);
	spawnY = Math.round(Math.random() * (((canvas.width - 2 * squareSize) / squareSize) - 1) + 1);
	if (!spawnStatus) {
		canvasMap[spawnX][spawnY] = "spawn";
		spawnStatus = true;
		btnSpawn.innerHTML = "Place spawn : 0";
	}
	if (!destinationStatus) {
		do {
			destinationX = Math.round(Math.random() * (((canvas.width - 2 * squareSize) / squareSize) - 1) + 1);
			destinationY = Math.round(Math.random() * (((canvas.width - 2 * squareSize) / squareSize) - 1) + 1);
		} while (destinationX == spawnX && destinationY == spawnY);
		canvasMap[destinationX][destinationY] = "destination";
		destinationStatus = true;
		btnDestination.innerHTML = "Place destination : 0";
	}
}

/**
 * @returns renders the canvas according to the 2D array canvasMap
 */
 function renderCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid();
	if (launchedStatus) {
		dijkstra();
	}
	for (let i = 0; i < canvas.width / squareSize; i++) {
		for (let j = 0; j < canvas.height / squareSize; j++) {
			if (canvasMap[i][j] == "wall") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, colorWhite);
				square.draw();
			}
			else if (canvasMap[i][j] == "spawn") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, colorGreen);
				square.draw();
			}
			else if (canvasMap[i][j] == "destination") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, colorRed);
				square.draw();
			}
			else if (canvasMap[i][j] == "parcours") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, colorBlue);
				square.draw();
				let circle = new Circle(i * squareSize, j * squareSize, squareSize / 7, colorRed);
				circle.draw();
			}
			else if(visited[i][j] && launchedStatus) {
				let circle = new Circle(i * squareSize, j * squareSize, squareSize / 7, colorRed);
				circle.draw();
			}
		}
	}
	requestAnimationFrame(renderCanvas);
}

/***************Click handlers***************/

/**
 * @param {EventListenerObject} event the object returned by the eventlistener that triggered the function
 * @returns changes the value of btnStatus according to which button triggered the event
 */
 function clickStatus(event) {
	if (event.target == btnSpawn) {
		btnStatus = "spawn";
	}
	else if (event.target == btnDestination) {
		btnStatus = "destination";
	}
	else if (event.target == btnWall) {
		btnStatus = "wall";
	}
}

/**
 * @param {EventListenerObject} event the object returned by the eventlistener that triggered the function
 * @returns places blocks according to the value of btnStatus
 */
function clickCanvas(event) {
	if (btnStatus != null) {
		if (btnStatus == "wall") {
			canvas.addEventListener("mousemove", startMoveCanvas);
			canvas.addEventListener("click", stopMoveCanvas, {once: true});
			canvas.addEventListener("mouseout", stopMoveCanvas, {once: true});
		}
		else {
			let canvasX = Math.floor((event.clientX - canvas.offsetLeft) / squareSize);
			let canvasY = Math.floor((event.clientY - canvas.offsetTop) / squareSize);
			if (!(exteriorWallsTest(canvasX, canvasY))) {
				if (btnStatus == "spawn") {
					if (canvasMap[canvasX][canvasY] == "spawn") {
						canvasMap[canvasX][canvasY] = "empty";
						btnSpawn.innerHTML = "Place spawn : 1";
						spawnStatus = false;
					}
					else if (!spawnStatus) {
						if (canvasMap[canvasX][canvasY] == "destination") {
							btnDestination.innerHTML = "Place destination : 1";
							destinationStatus = false;
						}
						canvasMap[canvasX][canvasY] = "spawn";
						btnSpawn.innerHTML = "Place spawn : 0";
						spawnStatus = true;
						spawnX = canvasX;
						spawnY = canvasY;
					}
					btnStatus = null;
				}
				else if (btnStatus == "destination") {
					if (canvasMap[canvasX][canvasY] == "destination") {
						canvasMap[canvasX][canvasY] = "empty";
							btnDestination.innerHTML = "Place destination : 1";
							destinationStatus = false;
					}
					else if (!destinationStatus) {
						if (canvasMap[canvasX][canvasY] == "spawn") {
							btnSpawn.innerHTML = "Place spawn : 1";
							spawnStatus = false;
						}
						canvasMap[canvasX][canvasY] = "destination";
						btnDestination.innerHTML = "Place destination : 0";
						destinationStatus = true;
						destinationX = canvasX;
						destinationY = canvasY;
					}
					btnStatus = null;
				}
			}
		}
	}
	canvas.addEventListener("click", clickCanvas, {once: true});
}

/**
 * @returns starts the selected algorithm
 */
 function clickPlay() {
	if (!spawnStatus && !destinationStatus) {
		randomGeneration();	
	}
	dijkstraInit();
	launchedStatus = true;
	btnPlay.addEventListener("click", clickPlay, {once: true});
}

/**
 * @returns resets the grid
 */
function clickReset() {
	let imgReset = btnReset.lastElementChild;
	imgReset.classList.add("active");
	launchedStatus = false;
	canvas.addEventListener("click", clickCanvas, {once: true});
	exteriorWalls();
	setTimeout(() => {
		imgReset.classList.remove("active");
		btnReset.addEventListener("click", clickReset, {once: true});
	}, 1000);
}

/***************Mousemove handlers***************/

/**
 * @param {EventListenerObject} event the object returned by the eventlistener that triggered the function
 * @returns places walls at the position of the mouse if there isn't already a spawn or a destination
 */
 function startMoveCanvas(event) {
	let canvasX = Math.floor((event.clientX - canvas.offsetLeft) / squareSize);
	let canvasY = Math.floor((event.clientY - canvas.offsetTop) / squareSize);
	if (canvasMap[canvasX][canvasY] != "spawn" && canvasMap[canvasX][canvasY] != "destination") {
		canvasMap[canvasX][canvasY] = "wall";
	}
	btnStatus = null;
}

/**
 * @returns stops the event listener that allows to place walls
 */
function stopMoveCanvas() {
	canvas.removeEventListener("mousemove", startMoveCanvas);
	canvas.addEventListener("click", clickCanvas);
}

/***************Dijkstra functions***************/

/**
 * @returns sets up the grid for the Dijkstra algorithm
 */
 function dijkstraInit() {
	canvas.removeEventListener("click", clickCanvas);
	foundPath=false;
	for (let i = 0; i < gridSize; i++) {
		for (let j = 0; j < gridSize; j++) {
			distance[i][j] = Number.MAX_VALUE;
			visited[i][j] = false;
			if (canvasMap[i][j] == "parcours") {
				canvasMap[i][j] = "empty";
			}
		}
	}
	distance[spawnX][spawnY] = 0;
	predecessor = createArray(gridSize, gridSize);
}

/**
 * @returns finds the minimum unvisited distance
 */
function dijkstraMinimum() {
	let minDistance = Number.MAX_VALUE;
	let minX = -1, minY = -1;
	for (let i = 0; i < gridSize; i++) {
		for (let j = 0; j < gridSize; j++) {
			if (!visited[i][j] && canvasMap[i][j] != "wall" && distance[i][j] < minDistance) {
				minDistance = distance[i][j];
				minX = i;
				minY = j;
			}
		}
	}
	return {x: minX, y: minY};
}

/**
 * @param {Number} x1 X coordinate of point 1
 * @param {Number} y1 Y coordinate of point 1
 * @param {Number} x2 X coordinate of point 2
 * @param {Number} y2 Y coordinate of point 2
 * @returns the distance between point 1 and point 2
 */
function dijkstraWeight(x1, y1, x2, y2) {
	if (canvasMap[x2][y2] == "wall") {
		return Number.MAX_VALUE;
	}
	if (x1 == x2 || y1 == y2) {
		return 1; // adjacent square
	}
	//return 1.5; // diagonal square
	return Number.MAX_VALUE; // if we don't want diagonals
}

/**
 * @param {Number} x1 X coordinate of point 1
 * @param {Number} y1 Y coordinate of point 1
 * @param {Number} x2 X coordinate of point 2
 * @param {Number} y2 Y coordinate of point 2
 * @returns updates the distance between point 1 and point 2
 */
function dijsktraDistance(x1, y1, x2, y2) {
	let majDistance = distance[x1][y1] + dijkstraWeight(x1,y1,x2,y2);
	if (distance[x2][y2] > majDistance) {
		distance[x2][y2] = majDistance;
		predecessor[x2][y2] = {x: x1, y: y1};
	}
}

/**
 * @returns the shortest path between the spawn and the destination
 */
function dijkstra() {
	let paire;
	let tempX, tempY;
	if (!foundPath) {
		paire = dijkstraMinimum();
		if (paire.x != -1) {
			visited[paire.x][paire.y] = true;
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (i != 0 || j != 0) {
						dijsktraDistance(paire.x, paire.y, paire.x + i, paire.y + j);
					}
				}
			}
		}
	}
	let cursorX = destinationX;
	let cursorY = destinationY;
	if (predecessor[destinationX][destinationY]) {
		foundPath = true;
		while (cursorX != spawnX || cursorY != spawnY) {
			if ((cursorX != destinationX || cursorY != destinationY) && (cursorX != spawnX || cursorY != spawnY)) {
				canvasMap[cursorX][cursorY] = "parcours";
			}
			tempX = predecessor[cursorX][cursorY].x;
			tempY = predecessor[cursorX][cursorY].y;
			cursorX = tempX;
			cursorY = tempY;
		}
		canvas.addEventListener("click", clickCanvas, {once: true});
	}
}


btnSpawn.addEventListener("click", clickStatus);
btnDestination.addEventListener("click", clickStatus);
btnWall.addEventListener("click", clickStatus);

btnPlay.addEventListener("click", clickPlay, {once: true});
btnReset.addEventListener("click", clickReset, {once: true});

canvas.addEventListener("click", clickCanvas, {once: true});

canvasSize();
window.addEventListener("resize", canvasSize);

exteriorWalls();

requestAnimationFrame(renderCanvas);