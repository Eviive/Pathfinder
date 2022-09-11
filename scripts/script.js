import { COLORS, createArray, isOutsideGrid } from "./utils.js";

import { Square } from "./drawings/Square.js";
import { Circle } from "./drawings/Circle.js";

import { dijkstraResize, dijkstraInit, dijkstra } from "./algorithms/dijkstra.js";
import { astarResize, astarInit, astar } from "./algorithms/astar.js";

let body = document.body;
let menu = document.querySelector("#menu");
let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d", {alpha: false});

let btnPlay = document.querySelector("#btn-play");
let btnReset = document.querySelector("#btn-reset");

let sltSpeed = document.querySelector("#slt-speed");
let sltAlgo = document.querySelector("#slt-algo");

let canvasMap;
let visited;
let squareSize = 30;
let gridWidth, gridHeight;
let spawnX, spawnY;
let destinationX, destinationY;
let launchedStatus = null;

/**
 * @returns adapts the size of the canvas
 */
function canvasSize() {
	canvas.width = (body.clientWidth - menu.clientWidth) - ((body.clientWidth - menu.clientWidth) % squareSize);
	canvas.height = body.clientHeight - (body.clientHeight % squareSize);
	gridWidth = canvas.width / squareSize;
	gridHeight = canvas.height / squareSize;
	canvasMap = createArray(gridWidth, gridHeight);
	visited = createArray(gridWidth, gridHeight);
	astarResize(gridWidth, gridHeight);
	dijkstraResize(gridWidth, gridHeight);
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
	} else {
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
		astar({x: spawnX, y: spawnY}, {x: destinationX, y: destinationY}, gridWidth, gridHeight, canvasMap, visited);
	} else if (launchedStatus == "dijkstra") {
		dijkstra({x: spawnX, y: spawnY}, {x: destinationX, y: destinationY}, gridWidth, gridHeight, canvasMap, visited);
	}
	for (let i = 0; i < Math.round(canvas.width / squareSize); i++) {
		for (let j = 0; j < Math.round(canvas.height / squareSize); j++) {
			let square, circle;
			switch (canvasMap[i][j]) {
				case "wall":
					square = new Square(i * squareSize, j * squareSize, squareSize, COLORS.darkBlue);
					break;

				case "spawn":
					square = new Square(i * squareSize, j * squareSize, squareSize, COLORS.green);
					break;
					
				case "destination":
					square = new Square(i * squareSize, j * squareSize, squareSize, COLORS.red);
					break;

				case "parcours":
					if ((i + j % 2) % 2 == 0) {
						square = new Square(i * squareSize, j * squareSize, squareSize, COLORS.white);
					} else {
						square = new Square(i * squareSize, j * squareSize, squareSize, COLORS.gray);
					}
					circle = new Circle(i * squareSize + squareSize / 2, j * squareSize + squareSize / 2, squareSize / 5, COLORS.red);
					break;
				
				default:
					// here the square is either visited or empty
					if (visited[i][j] && launchedStatus != null) {
						if ((i + j % 2) % 2 == 0) {
							square = new Square(i * squareSize, j * squareSize, squareSize, COLORS.white);
						} else {
							square = new Square(i * squareSize, j * squareSize, squareSize, COLORS.gray);
						}
						circle = new Circle(i * squareSize + squareSize / 2, j * squareSize + squareSize / 2, squareSize / 7, COLORS.lightBlue);
					} else if (canvasMap[i][j] == "empty") {
						if ((i + j % 2) % 2 == 0) {
							square = new Square(i * squareSize, j * squareSize, squareSize, COLORS.white);
						} else {
							square = new Square(i * squareSize, j * squareSize, squareSize, COLORS.gray);
						}
					}
					break;
			}

			square && square.draw(context);
			circle && circle.draw(context);
		}
	}
	const speed = sltSpeed.value;
	if (speed == "slow" || launchedStatus == null) {
		requestAnimationFrame(renderCanvas);
	} else if (speed == "medium") {
		setTimeout(() => {
			renderCanvas();
		}, 1000/(60*2));
	} else {
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
	const algo = sltAlgo.value;
	if (algo == "astar") {
		astarInit(gridWidth, gridHeight, {x: spawnX, y: spawnY}, {x: destinationX, y: destinationY}, canvasMap, visited);
		launchedStatus = algo;
	} else if (algo == "dijkstra") {
		dijkstraInit(gridWidth, gridHeight, {x: spawnX, y: spawnY}, canvasMap, visited);
		launchedStatus = algo;
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
	if (!isOutsideGrid(canvasX, canvasY) && canvasMap[canvasX][canvasY] != "spawn" && canvasMap[canvasX][canvasY] != "destination") {
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

/***************onLoad event***************/

window.addEventListener("load", () => {
	btnPlay.addEventListener("click", clickPlay);
	btnReset.addEventListener("click", clickReset, {once: true});
	
	canvas.addEventListener("click", clickCanvas, {once: true});
	
	canvasSize();
	window.addEventListener("resize", canvasSize);
	
	resetMap();
	
	requestAnimationFrame(renderCanvas);
});