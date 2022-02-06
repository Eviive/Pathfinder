let body = document.body;
let canvas = document.querySelector('canvas');
let context = canvas.getContext("2d");

let removeActive = (element) => {
	element.classList.remove("active");
};

let squareSize = 17;
let lineWidth = 2;
let pathColor = "#d6d6d6";

let canvasMap = [];
let exteriorWalls = (x, y) => {
	if (x == 0 || x == canvas.width / squareSize - 1 || y == 0 || y == canvas.height / squareSize - 1) {
		return true;
	}
	return false;
};

let resizeActive = false;

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

function renderCanvas() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid();
	Square.counter = 0;
	Circle.counter = 0;
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
	}, 1000 / 144);
}

function clickCloseResize(element) {
	clearTimeout(resizeElementTimeout);
	removeActive(element);
	setTimeout(() => {
		removeActive(element.offsetParent);
	}, 500);
	resizeActive = false;
}

function clickCanvas(event) {
	let canvasX = Math.floor((event.clientX - canvas.offsetLeft) / squareSize);
	let canvasY = Math.floor((event.clientY - canvas.offsetTop) / squareSize);
	if (!(exteriorWalls(canvasX, canvasY))) {
		if (canvasMap[canvasX][canvasY] == "wall") {
			canvasMap[canvasX][canvasY] = "empty";
		}
		else {
			canvasMap[canvasX][canvasY] = "wall";
		}
	}
}

canvasResponsive();
window.addEventListener("resize", canvasResponsive);

requestAnimationFrame(renderCanvas);

canvas.addEventListener("click", clickCanvas);