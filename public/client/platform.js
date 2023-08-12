
class Platform {

	constructor(pos, width, height, health, outer = false) {
		this.pos = pos; // COORDS = CORNER 
		this.width = width;
		this.height = height;
		this.health = health;
		this.outer = outer;
	}

	show() {

		rectMode(CORNER);
		
		fill(200);
		// stroke(255);
		noStroke();

		rect(this.pos.x, this.pos.y, this.width, this.height);

		stroke(0);
		fill(0);
		textAlign(CENTER);
		text(this.health, this.pos.x + this.width / 2, this.pos.y + this.height / 2);

	}


}