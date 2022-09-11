import { createArray, weighDistance, isOutsideGrid } from "/scripts/utils.js";

let foundPath;
let parents;
let gScore;
let fScore;
let openSet = [];

export function astarResize(gridWidth, gridHeight) {
	parents = createArray(gridWidth, gridHeight);
	gScore = createArray(gridWidth, gridHeight);
	fScore = createArray(gridWidth, gridHeight);
}

/**
 * @param {Number} gridWidth width of the grid
 * @param {Number} gridHeight height of the grid
 * @param {Object} spawn the spawn point
 * @param {Object} destination the destination point
 * @param {String[][]} canvasMap the map of the grid
 * @param {Boolean[][]} visited the map of the visited squares
 * @returns sets up the grid for the A* algorithm
 */
export function astarInit(gridWidth, gridHeight, spawn, destination, canvasMap, visited) {
	foundPath = false;
	for (let i = 0; i < gridWidth; i++) {
		for (let j = 0; j < gridHeight; j++) {
			gScore[i][j] = Number.MAX_VALUE;
			fScore[i][j] = Number.MAX_VALUE;
			visited[i][j] = false;
			if (canvasMap[i][j] == "parcours") {
				canvasMap[i][j] = "empty";
			}
		}
	}
	gScore[spawn.x][spawn.y] = 0;
	fScore[spawn.x][spawn.y] = astarPytha(spawn.x, spawn.y, destination.x, destination.y);
	parents = createArray(gridWidth, gridHeight);
	openSet = [];
	openSet.push({x: spawn.x, y: spawn.y});
}

/**
 * @param {Number} x1 X coordinate of the first point
 * @param {Number} y1 Y coordinate of the first point
 * @param {Number} x2 X coordinate of the second point
 * @param {Number} y2 Y coordinate of the second point
 * @returns the distance between the point and the destination (via the Pythagore theoreme)
 */
function astarPytha(x1, y1, x2, y2) {
	return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
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
	for (let i = 0; i < openSet.length; i++) {
		if (openSet[i].x == x && openSet[i].y == y) {
			return false;
		}
	}
	return true;
}

/**
 * @param {Object} spawn the coordinates of the spawn point
 * @param {Object} destination the coordinates of the destination point
 * @param {Number} gridWidth the width of the grid
 * @param {Number} gridHeight the height of the grid
 * @param {String[][]} canvasMap the map of the grid
 * @param {Boolean[][]} visited the map of the visited squares
 * @returns the shortest path between the spawn and the destination
 */
export function astar(spawn, destination, gridWidth, gridHeight, canvasMap, visited) {
	if (openSet.length > 0 && !foundPath) {
		let current = astarMinimum();
		if (current.x != -1) {
			if (current.x == destination.x && current.y == destination.y) {
				let cursorX = destination.x;
				let cursorY = destination.y;
				foundPath = true;
				while (cursorX != spawn.x || cursorY != spawn.y) {
					if ((cursorX != destination.x || cursorY != destination.y) && (cursorX != spawn.x || cursorY != spawn.y)) {
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
						gScoreAttempt = gScore[current.x][current.y] + weighDistance(canvasMap, gridWidth, gridHeight, current.x, current.y, current.x + i, current.y + j);
						if (!isOutsideGrid(current.x + i, current.y + j, gridWidth, gridHeight) && gScoreAttempt < gScore[current.x + i][current.y + j]) {
							parents[current.x + i][current.y + j] = {x: current.x, y: current.y};
							gScore[current.x + i][current.y + j] = gScoreAttempt;
							fScore[current.x + i][current.y + j] = gScore[current.x + i][current.y + j] + astarPytha(current.x + i, current.y + j, destination.x, destination.y);
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