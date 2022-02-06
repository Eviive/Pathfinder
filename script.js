let body = document.body;
let canvas = document.querySelector("canvas");
let context = canvas.getContext("2d");

let btnPopup = document.querySelector("#btn-popup");
let popupActive = false;
let popupElementTimeout;

let btnSpawn = document.querySelector("#btn-spawn");
let btnDestination = document.querySelector("#btn-destination");
let btnWall = document.querySelector("#btn-wall");
let btnPlay = document.querySelector("#btn-play");
let btnReset = document.querySelector("#btn-reset");

let btnStatus = null;
let spawnStatus = false;
let destinationStatus = false;

let squareSize = 17;
let lineWidth = 2;
let pathColor = "#d6d6d6";

let canvasMap = [];

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

/**
 * @param {HTMLElement} element
 * @returns removes the "active" class from the element
 */
let removeActive = (element) => {
	element.classList.remove("active");
};

/**
 * @param {Number} value 
 * @returns 75% of value
 */
let pourcentage = (value) => {
	return value / 100 * 75;
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
 * @param {String} popupText the text that the popup will display
 * @returns triggers a popup
 */
function triggerPopup(popupText) {
	let popupWrapper = document.querySelector(".wrapper-popup");
	let popupElement = document.querySelector(".popup");
	let popupSpan = document.querySelector(".popup-msg");
	popupSpan.innerHTML = popupText;
	popupActive = true;
	popupWrapper.classList.add("active");
	popupElement.classList.add("active");
	popupElementTimeout = setTimeout(() => {
		removeActive(popupElement);
		setTimeout(() => {
			removeActive(popupWrapper);
		}, 500);
		popupActive = false;
	}, 4000);
}

/**
 * @param {EventListenerObject} event the object returned by the eventlistener that triggered the function
 * @returns makes the canvas responsive
 */
function canvasResponsive(event) {
	/***************if the function is called by an event***************/
	if (event && !popupActive && body.clientWidth > 500) {
		triggerPopup("Changing the size of your window will stop the algorithm.");
	}
	
	let bodyMinWidth = parseInt(window.getComputedStyle(body).getPropertyValue("min-width"));
	canvas.height = Math.ceil(Math.max(Math.min(pourcentage(window.innerHeight), pourcentage(window.innerWidth)) / squareSize, pourcentage(bodyMinWidth) / squareSize)) * squareSize;
	canvas.width = canvas.height;
	drawGrid();

	exteriorWalls();

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
	/***************TODO : tester un setTimeout pour voir ce que ça donne***************/
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
		canvasMap[i] = [];
		for (let j = 0; j < canvas.height / squareSize; j++) {
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
 * @returns renders the canvas according to the 2D array canvasMap
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
	requestAnimationFrame(renderCanvas);
}

/**
 * @returns closes the popup
 */
function clickResize() {
	let element = btnPopup.offsetParent;
	clearTimeout(popupElementTimeout);
	removeActive(element);
	setTimeout(() => {
		removeActive(element.offsetParent);
	}, 500);
	popupActive = false;
}

/***************TODO: one function instead of three***************/
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
			if (!(exteriorWallsTest(canvasX, canvasY))) {
				/*********TODO: one function instead of if/else if for the spawn******
				 *********and destination because they do the exact same thing********/
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
	if (spawnStatus && destinationStatus) {
		triggerPopup("Il y a à la fois le spawn et la destination");
	}
	else if (spawnStatus && !destinationStatus) {
		triggerPopup("Il manque le block de destination");
	}
	else if (!spawnStatus && destinationStatus) {
		triggerPopup("Il manque le block de spawn");
	}
	else {
		triggerPopup("Il manque à la fois le block de spawn et le block de destination");
	}
	btnPlay.addEventListener("click", clickPlay, {once: true});
}

/**
 * @returns resets the grid
 */
function clickReset() {
	let imgReset = btnReset.lastElementChild;
	imgReset.classList.add("active");
	exteriorWalls();
	setTimeout(() => {
		removeActive(imgReset);
		btnReset.addEventListener("click", clickReset, {once: true});
	}, 1500);
}

canvasResponsive();
window.addEventListener("resize", canvasResponsive);
btnPopup.addEventListener("click", clickResize);

requestAnimationFrame(renderCanvas);

btnSpawn.addEventListener("click", clickSpawn);
btnDestination.addEventListener("click", clickDestination);
btnWall.addEventListener("click", clickWall);

btnPlay.addEventListener("click", clickPlay, {once: true});
btnReset.addEventListener("click", clickReset, {once: true});

canvas.addEventListener("click", clickCanvas);