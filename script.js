let body = document.body;
let header = document.querySelector("#menu");
let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d", {alpha: false});

let btnPlay = document.querySelector("#btn-play");
let btnReset = document.querySelector("#btn-reset");

const colorWhite = "#ffffff";
const colorGray = "#c9c9c9"
const colorGreen = "#20ab07";
const colorRed = "#ff0000";
const colorLightBlue = "#0061ff";
const colorDarkBlue = "#003080";

let canvasMap;
let squareSize = 30;
let gridSizeWidth, gridSizeHeight;
let spawnX, spawnY;
let destinationX, destinationY;

let distance;
let visited;
let parents;
let foundPath;

let gScore;
let fScore;
let openSet = [];

let launchedStatus = null;

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
 * @returns {Boolean} checks if the coordinates are in or out of the grid
 */
let outsideGridTest = (x, y) => {
	if (x < 0 || y < 0 || x >= gridSizeWidth || y >= gridSizeHeight) {
		return true;
	}
	return false;
};

class Square {
	constructor(xPos, yPos, size, color) {
		this.xPos = xPos;
		this.yPos = yPos;
		this.size = size;
		this.color = color;
	}

	draw() {
		context.fillStyle = this.color;
		context.fillRect(this.xPos, this.yPos, this.size, this.size);
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
		context.lineWidth = 2;
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
	console.log(body.clientWidth, body.clientHeight);
	console.log(header.clientWidth);
	canvas.width = (body.clientWidth - header.clientWidth) - ((body.clientWidth - header.clientWidth) % squareSize);
	canvas.height = body.clientHeight - (body.clientHeight % squareSize);
	gridSizeWidth = canvas.width / squareSize;
	gridSizeHeight = canvas.height / squareSize;
	canvasMap = createArray(gridSizeWidth, gridSizeHeight);
	distance = createArray(gridSizeWidth, gridSizeHeight);
	visited = createArray(gridSizeWidth, gridSizeHeight);
	parents = createArray(gridSizeWidth, gridSizeHeight);
	gScore = createArray(gridSizeWidth, gridSizeHeight);
	fScore = createArray(gridSizeWidth, gridSizeHeight);
	resetMap();
}

/**
 * @returns resets the whole map
 */
function resetMap() {
	launchedStatus = null;
	for (let i = 0; i < Math.round(canvas.width / squareSize); i++) {
		for (let j = 0; j < Math.round(canvas.height / squareSize); j++) {
			canvasMap[i][j] = "empty";
		}
	}
	blockGeneration();
	canvas.addEventListener("click", clickCanvas, {once: true});
}

/**
 * @returns generates the spawn and the destination
 */
function blockGeneration() {
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
	if (launchedStatus == "astar") {
		astar();
	}
	else if (launchedStatus == "dijkstra") {
		dijkstra();
	}
	for (let i = 0; i < Math.round(canvas.width / squareSize); i++) {
		for (let j = 0; j < Math.round(canvas.height / squareSize); j++) {
			if (canvasMap[i][j] == "wall") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, colorDarkBlue);
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
				let square;
				if ((i + j % 2) % 2 == 0) {
					square = new Square(i * squareSize, j * squareSize, squareSize, colorWhite);
				}
				else {
					square = new Square(i * squareSize, j * squareSize, squareSize, colorGray);
				}
				square.draw();
				let circle = new Circle(i * squareSize, j * squareSize, squareSize / 5, colorRed);
				circle.draw();
			}
			else if(visited[i][j] && launchedStatus != null) {
				let square;
				if ((i + j % 2) % 2 == 0) {
					square = new Square(i * squareSize, j * squareSize, squareSize, colorWhite);
				}
				else {
					square = new Square(i * squareSize, j * squareSize, squareSize, colorGray);
				}
				square.draw();
				let circle = new Circle(i * squareSize, j * squareSize, squareSize / 7, colorLightBlue);
				circle.draw();
			}
			else if (canvasMap[i][j] == "empty") {
				let square;
				if ((i + j % 2) % 2 == 0) {
					square = new Square(i * squareSize, j * squareSize, squareSize, colorWhite);
				}
				else {
					square = new Square(i * squareSize, j * squareSize, squareSize, colorGray);
				}
				square.draw();
			}
		}
	}
	let sltSpeedValue = document.querySelector("#slt-speed").value;
	if (sltSpeedValue == "slow" || launchedStatus == null) {
		requestAnimationFrame(renderCanvas);
	}
	else if (sltSpeedValue == "medium") {
		setTimeout(() => {
			renderCanvas();
		}, 1000/(60*2));
	}
	else {
		setTimeout(() => {
			renderCanvas();
		}, 1000/(60*6));
	}
}

/***************Click handlers***************/

/**
 * @returns activates the mousemove event that will place the walls
 */
function clickCanvas() {
	if (launchedStatus == null) {
		canvas.addEventListener("mousemove", startMoveCanvas);
		canvas.addEventListener("click", stopMoveCanvas, {once: true});
		canvas.addEventListener("mouseout", stopMoveCanvas, {once: true});
	}
}

/**
 * @returns starts the selected algorithm
 */
 function clickPlay() {
	let sltAlgoValue = document.querySelector("#slt-algo").value;
	if (sltAlgoValue == "astar") {
		astarInit();
		launchedStatus = sltAlgoValue;
	}
	else if (sltAlgoValue == "dijkstra") {
		dijkstraInit();
		launchedStatus = sltAlgoValue;
	}
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
 * @returns places walls at the position of the mouse if there isn't already the spawn or the destination
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
	foundPath = false;
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
	parents = createArray(gridSizeWidth, gridSizeHeight);
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
		parents[x2][y2] = {x: x1, y: y1};
	}
}

/**
 * @returns the shortest path between the spawn and the destination
 */
function dijkstra() {
	if (!foundPath) {
		let current = dijkstraMinimum();
		if (current.x != -1) {
			visited[current.x][current.y] = true;
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (i != 0 || j != 0) {
						dijsktraDistance(current.x, current.y, current.x + i, current.y + j);
					}
				}
			}
		}
	}
	let cursorX = destinationX;
	let cursorY = destinationY;
	if (parents[destinationX][destinationY]) {
		foundPath = true;
		while (cursorX != spawnX || cursorY != spawnY) {
			if ((cursorX != destinationX || cursorY != destinationY) && (cursorX != spawnX || cursorY != spawnY)) {
				canvasMap[cursorX][cursorY] = "parcours";
			}
			let tempX = parents[cursorX][cursorY].x;
			let tempY = parents[cursorX][cursorY].y;
			cursorX = tempX;
			cursorY = tempY;
		}
		canvas.addEventListener("click", clickCanvas, {once: true});
	}
}

/***************A* functions***************/

/**
 * @returns sets up the grid for the A* algorithm
 */
function astarInit() {
	foundPath = false;
	for (let i = 0; i < gridSizeWidth; i++) {
		for (let j = 0; j < gridSizeHeight; j++) {
			gScore[i][j] = Number.MAX_VALUE;
			fScore[i][j] = Number.MAX_VALUE;
			visited[i][j] = false;
			if (canvasMap[i][j] == "parcours") {
				canvasMap[i][j] = "empty";
			}
		}
	}
	gScore[spawnX][spawnY] = 0;
	fScore[spawnX][spawnY] = astarPytha(spawnX, spawnY);
	parents = createArray(gridSizeWidth, gridSizeHeight);
	openSet = [];
	openSet.push({x: spawnX, y: spawnY});
}

/**
 * @param {Number} x X coordinate of one point
 * @param {Number} y Y coordinate of one point
 * @returns the distance between the point and the destination (via the Pythagore theoreme)
 */
function astarPytha(x, y) {
	return Math.sqrt((destinationX - x) * (destinationX - x) + (destinationY - y) * (destinationY - y));
}

/**
 * @returns finds the minimum unvisited distance
 */
function astarMinimum() {
	let minDistance = Number.MAX_VALUE;
	let minX = -1, minY = -1, index = -1;
	for (let i = 0; i < openSet.length; i++) {
		if (fScore[openSet[i].x][openSet[i].y] < minDistance) {
			minDistance = fScore[openSet[i].x][openSet[i].y];
			minX = openSet[i].x;
			minY = openSet[i].y;
			index = i;
		}
	}
	return {x: minX, y: minY, i: index};
}

/**
 * @param {Number} x X coordinate of one point
 * @param {Number} y Y coordinate of one point
 * @returns true if the point is in the openSet, otherwise false
 */
function astarNotPresent(x, y) {
	let notPresent = true;
	for (let i = 0; i < openSet.length; i++) {
		if (openSet[i].x == x && openSet[i].y == y) {
			notPresent = false;
		}
	}
	return notPresent;
}

/**
 * @returns the shortest path between the spawn and the destination
 */
function astar() {
	if (openSet.length > 0 && !foundPath) {
		let current = astarMinimum();
		if (current.x != -1) {
			if (current.x == destinationX && current.y == destinationY) {
				let cursorX = destinationX;
				let cursorY = destinationY;
				foundPath = true;
				while (cursorX != spawnX || cursorY != spawnY) {
					if ((cursorX != destinationX || cursorY != destinationY) && (cursorX != spawnX || cursorY != spawnY)) {
						canvasMap[cursorX][cursorY] = "parcours";
					}
					let tempX = parents[cursorX][cursorY].x;
					let tempY = parents[cursorX][cursorY].y;
					cursorX = tempX;
					cursorY = tempY;
				}
				openSet = [];
			}
			openSet.splice(current.i, 1);
			let gScoreAttempt;
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (i != 0 || j != 0) {
						gScoreAttempt = gScore[current.x][current.y] + dijkstraWeight(current.x, current.y, current.x + i, current.y + j);
						if (!outsideGridTest(current.x + i, current.y + j) && gScoreAttempt < gScore[current.x + i][current.y + j]) {
							parents[current.x + i][current.y + j] = {x: current.x, y: current.y};
							gScore[current.x + i][current.y + j] = gScoreAttempt;
							fScore[current.x + i][current.y + j] = gScore[current.x + i][current.y + j] + astarPytha(current.x + i, current.y + j);
							if (astarNotPresent(current.x + i, current.y + j)) {
								openSet.push({x: current.x + i, y: current.y + j});
								visited[current.x + i][current.y + j] = true;
							}
						}
					}
				}
			}
		}
	}
}

btnPlay.addEventListener("click", clickPlay);
btnReset.addEventListener("click", clickReset, {once: true});

canvas.addEventListener("click", clickCanvas, {once: true});

canvasSize();
window.addEventListener("resize", canvasSize);

resetMap();

requestAnimationFrame(renderCanvas);