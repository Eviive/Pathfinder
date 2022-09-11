import { createArray, weighDistance, isOutsideGrid } from "/scripts/utils.js";

let foundPath;
let distance;
let parents;

/**
 * @param {Number} gridWidth the width of the grid
 * @param {Number} gridHeight the height of the grid
 */
export function dijkstraResize(gridWidth, gridHeight) {
	distance = createArray(gridWidth, gridHeight);
	parents = createArray(gridWidth, gridHeight);
}

/**
 * @param {Number} gridWidth the width of the grid
 * @param {Number} gridHeight the height of the grid
 * @param {Object} spawn the coordinates of the spawn point
 * @param {String[][]} canvasMap the map of the grid
 * @param {Boolean[][]} visited the map of the visited squares
 * @returns sets up the grid for the Dijkstra algorithm
 */
export function dijkstraInit(gridWidth, gridHeight, spawn, canvasMap, visited) {
	foundPath = false;
	for (let i = 0; i < gridWidth; i++) {
		for (let j = 0; j < gridHeight; j++) {
			distance[i][j] = Number.MAX_VALUE;
			visited[i][j] = false;
			if (canvasMap[i][j] == "parcours") {
				canvasMap[i][j] = "empty";
			}
		}
	}
	distance[spawn.x][spawn.y] = 0;
	parents = createArray(gridWidth, gridHeight);
}

/**
 * @param {Number} gridWidth the width of the grid
 * @param {Number} gridHeight the height of the grid
 * @param {String[][]} canvasMap the map of the grid
 * @param {Boolean[][]} visited the map of the visited squares
 * @returns finds the minimum unvisited distance
 */
function dijkstraMinimum(gridWidth, gridHeight, canvasMap, visited) {
	let minDistance = Number.MAX_VALUE;
	let minX = -1, minY = -1;
	for (let i = 0; i < gridWidth; i++) {
		for (let j = 0; j < gridHeight; j++) {
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
 * @param {Number} gridWidth the width of the grid
 * @param {Number} gridHeight the height of the grid
 * @param {String[][]} canvasMap the map of the grid
 * @param {Boolean[][]} visited the map of the visited squares
 * @param {Number} x1 X coordinate of point 1
 * @param {Number} y1 Y coordinate of point 1
 * @param {Number} x2 X coordinate of point 2
 * @param {Number} y2 Y coordinate of point 2
 * @returns updates the distance between point 1 and point 2
 */
function dijsktraDistance(canvasMap, gridWidth, gridHeight, x1, y1, x2, y2) {
	let majDistance = distance[x1][y1] + weighDistance(canvasMap, gridWidth, gridHeight, x1,y1,x2,y2);
	if (!isOutsideGrid(x2, y2, gridWidth, gridHeight) && distance[x2][y2] > majDistance) {
		distance[x2][y2] = majDistance;
		parents[x2][y2] = {x: x1, y: y1};
	}
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
export function dijkstra(spawn, destination, gridWidth, gridHeight, canvasMap, visited) {
	if (!foundPath) {
		let current = dijkstraMinimum(gridWidth, gridHeight, canvasMap, visited);
		if (current.x != -1) {
			visited[current.x][current.y] = true;
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (i != 0 || j != 0) {
						dijsktraDistance(canvasMap, gridWidth, gridHeight, current.x, current.y, current.x + i, current.y + j);
					}
				}
			}
		}
	}
	let cursorX = destination.x;
	let cursorY = destination.y;
	if (parents[destination.x][destination.y]) {
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
	}
}