export class Drawing {

	constructor(xPos, yPos, size, color) {
		if (this.constructor === Drawing) {
			throw new Error("Abstract class 'Drawing' cannot be instantiated directly.");
		}
		this.xPos = xPos;
		this.yPos = yPos;
		this.size = size;
		this.color = color;
	}

}