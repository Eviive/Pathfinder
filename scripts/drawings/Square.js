import { Drawing } from "./Drawing.js";

export class Square extends Drawing {
	
	constructor(xPos, yPos, size, color) {
		super(xPos, yPos, size, color);
	}

	draw(context) {
		context.fillStyle = this.color;
		context.fillRect(this.xPos, this.yPos, this.size, this.size);
	}

}