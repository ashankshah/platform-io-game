class Platform {

	constructor(pos, width, height, health) {
		this.pos = pos; // COORDS = CORNER 
		this.width = width;
		this.height = height;
		this.health = health
	}

	show() {

		rectMode(CORNER);
		
		fill(200);
		stroke(255);

		rect(this.pos.x, this.pos.y, this.width, this.height);

	}


}