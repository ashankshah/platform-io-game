class Projectile {
	constructor(pos, velocity, width, height) {
		this.pos = pos; // COORDS = CORNER
		this.vel = velocity; // Bullet velocity
		this.width = width;
		this.height = height;
	}
  
	show() {

		ellipseMode(CENTER);
	
		fill(255, 255, 0);
		stroke(255);
	
		ellipse(this.pos.x, this.pos.y, this.width, this.height);
	}
  
	update() {
		this.pos.add(this.vel);
	}

}