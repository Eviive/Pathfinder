// TODO: plusieurs algorithmes
// TODO: plusieurs vitesses d'algorithme
// TODO: génération d'obstacles

let body = document.body;
let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");

let btnPlay = document.querySelector("#btn-play");
let btnReset = document.querySelector("#btn-reset");

const lineWidth = 2;
const colorWhite = "#ffffff";
const colorGray = "#c9c9c9"
const colorGreen = "#20ab07";
const colorRed = "#ff0000";
const colorLightBlue = "#0061ff";
const colorDarkBlue = "#003080"

let canvasMap;
let squareSize = 30;
let gridSizeWidth, gridSizeHeight;
let spawnX, spawnY;
let destinationX, destinationY;

let distance;
let visited;
let predecessor;
let foundPath;
let launchedStatus = false;


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
let outsideGridTest = (x, y) => {
	if (x < 0 || y < 0 || x >= gridSizeWidth || y >= gridSizeHeight) {
		return true;
	}
	return false;
};

class Square {
	constructor(xPos, yPos, xSize, ySize, color) {
		this.xPos = xPos;
		this.yPos = yPos;
		this.xSize = xSize;
		this.ySize = ySize;
		this.color = color;
	}

	draw() {
		context.fillStyle = this.color;
		context.fillRect(this.xPos, this.yPos, this.xSize, this.ySize);
	}
}

class Circle {
	constructor(xPos, yPos, radius, color) {
		this.xPos = xPos + squareSize / 2;
		this.yPos = yPos + squareSize / 2;
		this.radius = radius * 0.8;
		this.color = color;
	}

	draw() {
		context.beginPath();
		context.lineWidth = lineWidth;
		context.arc(this.xPos, this.yPos, this.radius, 0, Math.PI * 2, false);
		context.fillStyle = this.color;
		context.fill();
		context.closePath();
	}
}

/**
 * @returns adapts the size of the canvas
 */
function canvasSize() {
	let header = document.querySelector("#menu");
	canvas.width = (body.clientWidth - header.clientWidth) - (body.clientWidth - header.clientWidth) % squareSize;
	canvas.height = body.clientHeight - body.clientHeight % squareSize;
	gridSizeWidth = canvas.width / squareSize;
	gridSizeHeight = canvas.height / squareSize;
	canvasMap = createArray(gridSizeWidth, gridSizeHeight);
	distance = createArray(gridSizeWidth, gridSizeHeight);
	visited = createArray(gridSizeWidth, gridSizeHeight);
	predecessor = createArray(gridSizeWidth, gridSizeHeight);
	resetMap();
}

/**
 * @returns draws the exterior walls
 */
function resetMap() {
	launchedStatus = false;
	for (let i = 0; i < Math.round(canvas.width / squareSize); i++) {
		for (let j = 0; j < Math.round(canvas.height / squareSize); j++) {
			canvasMap[i][j] = "empty";
		}
	}
	canvas.addEventListener("click", clickCanvas, {once: true});
	randomGeneration();
}

/**
 * @returns generates a random spawn and destination
 */
function randomGeneration() {
	if (canvas.width + 100 < canvas.height) {
		spawnX = destinationX = Math.floor(canvas.width / squareSize / 2);
		spawnY = Math.floor(canvas.height / squareSize * 4/5);
		destinationY = Math.floor(canvas.height / squareSize * 1/5);
	}
	else {
		spawnY = destinationY = Math.ceil(canvas.height / squareSize / 2) - 1;
		spawnX = Math.floor(canvas.width / squareSize * 1/5);
		destinationX = Math.floor(canvas.width / squareSize * 4/5);
	}
	canvasMap[spawnX][spawnY] = "spawn";
	canvasMap[destinationX][destinationY] = "destination";
}

/**
 * @returns renders the canvas according to the 2D array canvasMap
 */
 function renderCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	if (launchedStatus) {
		dijkstra();
	}
	for (let i = 0; i < Math.round(canvas.width / squareSize); i++) {
		for (let j = 0; j < Math.round(canvas.height / squareSize); j++) {
			if (canvasMap[i][j] == "wall") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, squareSize, colorDarkBlue);
				square.draw();
			}
			else if (canvasMap[i][j] == "spawn") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, squareSize, colorGreen);
				square.draw();
			}
			else if (canvasMap[i][j] == "destination") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, squareSize, colorRed);
				square.draw();
			}
			else if (canvasMap[i][j] == "parcours") {
				let square;
				if ((i + j % 2) % 2 == 0) {
					square = new Square(i * squareSize, j * squareSize, squareSize, squareSize, colorWhite);
				}
				else {
					square = new Square(i * squareSize, j * squareSize, squareSize, squareSize, colorGray);
				}
				square.draw();
				let circle = new Circle(i * squareSize, j * squareSize, squareSize / 5, colorRed);
				circle.draw();
			}
			else if(visited[i][j] && launchedStatus) {
				let square;
				if ((i + j % 2) % 2 == 0) {
					square = new Square(i * squareSize, j * squareSize, squareSize, squareSize, colorWhite);
				}
				else {
					square = new Square(i * squareSize, j * squareSize, squareSize, squareSize, colorGray);
				}
				square.draw();
				let circle = new Circle(i * squareSize, j * squareSize, squareSize / 7, colorLightBlue);
				circle.draw();
			}
			else if (canvasMap[i][j] == "empty") {
				let square;
				if ((i + j % 2) % 2 == 0) {
					square = new Square(i * squareSize, j * squareSize, squareSize, squareSize, colorWhite);
				}
				else {
					square = new Square(i * squareSize, j * squareSize, squareSize, squareSize, colorGray);
				}
				square.draw();
			}
		}
	}
	requestAnimationFrame(renderCanvas);
	// setTimeout(() => {
	// 	renderCanvas();
	// }, 1000/(60*5));
}

/***************Click handlers***************/

/**
 * @param {EventListenerObject} event the object returned by the eventlistener that triggered the function
 * @returns places blocks according to the value of btnStatus
 */
function clickCanvas() {
	if (!launchedStatus) {
		canvas.addEventListener("mousemove", startMoveCanvas);
		canvas.addEventListener("click", stopMoveCanvas, {once: true});
		canvas.addEventListener("mouseout", stopMoveCanvas, {once: true});
	}
}

/**
 * @returns starts the selected algorithm
 */
 function clickPlay() {
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
	resetMap();
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
	if (!outsideGridTest(canvasX, canvasY) && canvasMap[canvasX][canvasY] != "spawn" && canvasMap[canvasX][canvasY] != "destination") {
		canvasMap[canvasX][canvasY] = "wall";
	}
}

/**
 * @returns stops the event listener that allows to place walls
 */
function stopMoveCanvas() {
	canvas.removeEventListener("mousemove", startMoveCanvas);
	canvas.addEventListener("click", clickCanvas, {once: true});
}

/***************Dijkstra functions***************/

/**
 * @returns sets up the grid for the Dijkstra algorithm
 */
 function dijkstraInit() {
	canvas.removeEventListener("click", clickCanvas);
	foundPath=false;
	for (let i = 0; i < gridSizeWidth; i++) {
		for (let j = 0; j < gridSizeHeight; j++) {
			distance[i][j] = Number.MAX_VALUE;
			visited[i][j] = false;
			if (canvasMap[i][j] == "parcours") {
				canvasMap[i][j] = "empty";
			}
		}
	}
	distance[spawnX][spawnY] = 0;
	predecessor = createArray(gridSizeWidth, gridSizeHeight);
}

/**
 * @returns finds the minimum unvisited distance
 */
function dijkstraMinimum() {
	let minDistance = Number.MAX_VALUE;
	let minX = -1, minY = -1;
	for (let i = 0; i < gridSizeWidth; i++) {
		for (let j = 0; j < gridSizeHeight; j++) {
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
	if (outsideGridTest(x2, y2) || canvasMap[x2][y2] == "wall") {
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
	if (!outsideGridTest(x2, y2) && distance[x2][y2] > majDistance) {
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

btnPlay.addEventListener("click", clickPlay, {once: true});
btnReset.addEventListener("click", clickReset, {once: true});

canvas.addEventListener("click", clickCanvas, {once: true});

canvasSize();
window.addEventListener("resize", canvasSize);

resetMap();

requestAnimationFrame(renderCanvas);