import { Drawing } from "./Drawing.js";

export class Circle extends Drawing {

	constructor(xPos, yPos, size, color) {
		super(xPos, yPos, size, color);
	}

	draw(context) {
		context.beginPath();
		context.lineWidth = 2;
		context.arc(this.xPos, this.yPos, this.size, 0, Math.PI * 2, false);
		context.fillStyle = this.color;
		context.fill();
		context.closePath();
	}

}