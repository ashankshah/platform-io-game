class Projectile {
    constructor(pos, velocity, width, height) {
      this.pos = pos; // COORDS = CORNER
      this.vel = velocity; // Bullet velocity
      this.width = width;
      this.height = height;
    }
  
    show() {
      rectMode(CORNER);
  
      fill(255, 255, 0);
      stroke(255);
  
      rect(this.pos.x, this.pos.y, this.width, this.height);
    }
  
    update() {
      this.pos.add(this.vel);
    }

}