export const COLORS = {
	white: "#ffffff",
	gray: "#c9c9c9",
	green: "#20ab07",
	red: "#ff0000",
	lightBlue: "#0061ff",
	darkBlue: "#003080"
};

/**
 * @param {Number} length size of a dimension
 * @returns a 2D array
 */
export const createArray = (length) => Array.from(Array(length), () => new Array(length));

/**
 * @param {String[][]} canvasMap the map of the grid
 * @param {Number} gridWidth the width of the grid
 * @param {Number} gridHeight the height of the grid
 * @param {Number} x1 X coordinate of point 1
 * @param {Number} y1 Y coordinate of point 1
 * @param {Number} x2 X coordinate of point 2
 * @param {Number} y2 Y coordinate of point 2
 * @returns the distance between point 1 and point 2
 */
export function weighDistance(canvasMap, gridWidth, gridHeight, x1, y1, x2, y2) {
	if (isOutsideGrid(x2, y2, gridWidth, gridHeight) || canvasMap[x2][y2] == "wall") {
		return Number.MAX_VALUE;
	}
	if (x1 == x2 || y1 == y2) {
		return 1; // adjacent square
	}
	//return 1.5; // diagonal square
	return Number.MAX_VALUE; // if we don't want diagonals
}

/**
 * @param {Number} x X position
 * @param {Number} y Y position
 * @param {Number} gridWidth width of the grid
 * @param {Number} gridHeight height of the grid
 * @returns {Boolean} checks if the coordinates are in or out of the grid
 */
export const isOutsideGrid = (x, y, gridWidth, gridHeight) => x < 0 || y < 0 || x >= gridWidth || y >= gridHeight;