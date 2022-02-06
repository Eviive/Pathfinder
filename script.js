let body = document.body;
let canvas = document.querySelector('canvas');
let context = canvas.getContext("2d");

let btnResize = document.querySelector('#btn-resize');
let resizeActive = false;
let btnSpawn = document.querySelector('#btn-spawn');
let btnDestination = document.querySelector('#btn-destination');
let btnWall = document.querySelector('#btn-wall');
let btnPlay = document.querySelector('#btn-play');
let btnReset = document.querySelector('#btn-reset');

let btnStatus = null;
let spawnStatus = false;
let destinationStatus = false;

/**
 * @param {HTMLElement} element
 * @returns removes the "active" class from the element
 */
let removeActive = (element) => {
	element.classList.remove("active");
};

let squareSize = 17;
let lineWidth = 2;
let pathColor = "#d6d6d6";

let canvasMap = [];
/**
 * @param {Number} x X position
 * @param {Number} y Y position
 * @returns {Boolean} checks if the coordinates are part of the exterior walls
 */
let exteriorWalls = (x, y) => {
	if (x == 0 || x == canvas.width / squareSize - 1 || y == 0 || y == canvas.height / squareSize - 1) {
		return true;
	}
	return false;
};

class Square {
	constructor(xPos, yPos, size, color) {
		this.xPos = xPos + lineWidth / 1.2;
		this.yPos = yPos + lineWidth / 1.2;
		this.size = size - lineWidth * 1.2;
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
		this.radius = radius;
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
 * @param {EventListenerObject} event the object returned by the eventlistener that triggered the function
 * @returns makes the canvas responsive
 */
function canvasResponsive(event) {
	/***************if the function is called by an event***************/
	if (event && !resizeActive && body.clientWidth > 500) {
		let resizeWrapper = document.querySelector('.wrapper-resize');
		let resizeElement = document.querySelector('.resize');
		resizeActive = true;
		resizeWrapper.classList.add("active");
		resizeElement.classList.add("active");
		resizeElementTimeout = setTimeout(() => {
			removeActive(resizeElement);
			setTimeout(() => {
				removeActive(resizeWrapper);
			}, 500);
			resizeActive = false;
		}, 4000);
	}
	
	let bodyMinWidth = parseInt(window.getComputedStyle(body).getPropertyValue("min-width"));
	/**
	 * @param {Number} value 
	 * @returns 75% of value
	 */
	let pourcentage = function (value) {
		return value / 100 * 75;
	};
	canvas.height = Math.ceil(Math.max(Math.min(pourcentage(window.innerHeight), pourcentage(window.innerWidth)) / squareSize, pourcentage(bodyMinWidth) / squareSize)) * squareSize;
	canvas.width = canvas.height;
	drawGrid();
	
	for (let i = 0; i < canvas.width / squareSize; i++) {
		canvasMap[i] = [];
		for (let j = 0; j < canvas.height / squareSize; j++) {
			if (exteriorWalls(i, j)) {
				canvasMap[i][j] = "wall";
			}
			else {
				canvasMap[i][j] = "empty";
			}
		}
	}

	// let previousSize = canvas.height;
	// let ratio = canvas.height / previousSize;
	// drawings.forEach(element => {
	// 	element.xPos = element.xPos * ratio;
	// 	element.yPos = element.yPos * ratio;
	// 	element.width = element.width * ratio;
	// 	element.height = element.height * ratio;
	// 	element.updateSize();
	// });
}

/**
 * @returns draws the grid responsively
 */
function drawGrid() {
	let cSize = canvas.width;

	context.beginPath();
	context.lineWidth = lineWidth;
	context.strokeStyle = pathColor;

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
 * @returns renders the canvas according to the 2D array canvasMap 60 times per second
 */
function renderCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid();
	for (let i = 0; i < canvas.width / squareSize; i++) {
		for (let j = 0; j < canvas.height / squareSize; j++) {
			if (canvasMap[i][j] == "wall") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, "#ffffff");
				square.draw();
			}
			else if (canvasMap[i][j] == "spawn") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, "#27d507");
				square.draw();
			}
			else if (canvasMap[i][j] == "destination") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, "#ff0000");
				square.draw();
			}
			else if (canvasMap[i][j] == "visited") {
				let circle = new Circle(i * squareSize, j * squareSize, squareSize / 7, "#ff0000");
				circle.draw();
			}
			else if (canvasMap[i][j] == "parcours") {
				let square = new Square(i * squareSize, j * squareSize, squareSize, "#0000ff");
				square.draw();
				let circle = new Circle(i * squareSize, j * squareSize, squareSize / 7, "#ff0000");
				circle.draw();
			}
		}
	}
	setTimeout(() => {
		requestAnimationFrame(renderCanvas);
	}, 1000 / 60);
}

/**
 * @returns closes the resize popup
 */
function clickResize() {
	let element = btnResize.offsetParent;
	clearTimeout(resizeElementTimeout);
	removeActive(element);
	setTimeout(() => {
		removeActive(element.offsetParent);
	}, 500);
	resizeActive = false;
}

/***************do one function instead of three***************/
/**
 * @returns changes the value of btnStatus to "spawn"
 */
function clickSpawn() {
	btnStatus = "spawn";
}

/**
 * @returns changes the value of btnStatus to "destination"
 */
function clickDestination() {
	btnStatus = "destination";
}

/**
 * @returns changes the value of btnStatus to "wall"
 */
function clickWall() {
	btnStatus = "wall";
}
/************************************************************/

/**
 * @param {EventListenerObject} event the object returned by the eventlistener that triggered the function
 * @returns places blocks according to the value of btnStatus
 */
function clickCanvas(event) {
	if (btnStatus != null) {
		if (btnStatus == "wall") {
			canvas.removeEventListener("click", clickCanvas);
			canvas.addEventListener("mousemove", startMoveCanvas);
			canvas.addEventListener("click", stopMoveCanvas, {once: true});
			canvas.addEventListener("mouseout", stopMoveCanvas, {once: true});
		}
		else {
			let canvasX = Math.floor((event.clientX - canvas.offsetLeft) / squareSize);
			let canvasY = Math.floor((event.clientY - canvas.offsetTop) / squareSize);
			if (!(exteriorWalls(canvasX, canvasY))) {
				/*********do one function instead of if/else if for the spawn******
				 *********and destination because they do the exact same thing*****/
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
					}
					btnStatus = null;
				}
			}
		}
	}
}

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

/**
 * @returns starts the selected algorithm
 */
function clickPlay() {
	// TODO
}

/**
 * @returns resets the grid
 */
function clickReset() {
	// TODO
}

canvasResponsive();
window.addEventListener("resize", canvasResponsive);
btnResize.addEventListener("click", clickResize);

btnSpawn.addEventListener("click", clickSpawn);
btnDestination.addEventListener("click", clickDestination);
btnWall.addEventListener("click", clickWall);

btnPlay.addEventListener("click", clickPlay);
btnReset.addEventListener("click", clickReset);

requestAnimationFrame(renderCanvas);

canvas.addEventListener("click", clickCanvas);