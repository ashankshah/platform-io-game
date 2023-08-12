

class Player {

	constructor(pos, score = 10, health = 80, isOther = false) {
		
		this.pos = pos; // COORDS = CORNER
		this.vel = createVector();
		this.score = score;
		this.health = health;


		this.isOnGround = false;

		this.isOther = isOther;
		this.id = null;

		// FIXME: Overwriteable from console: easy hacking
		this.size = Constants.PLAYER_SIZE;
		this.maxSpeedX = Constants.PLAYER_MAX_SPEED_X;
		this.gravity = Constants.PLAYER_GRAVITY;
		this.terminalVelocity = Constants.PLAYER_TERMINAL_VELOCITY;

		// Half size
		this.sizeh = this.size / 2;

	}

	setId(id) {
		this.id = id;
	}

	setPos(x, y) {
		this.pos.x = x;
		this.pos.y = y;
	}


	show() {

		// ellipseMode(CORNER);
		rectMode(CORNER);

		// Color player
		fill(0, 0, 255);
		if (this.isOther) fill(255, 0, 0);

		stroke(255);
		// ellipse(this.pos.x, this.pos.y, this.size, this.size);
		rect(this.pos.x, this.pos.y, this.size, this.size);

		if (this.id != null && this.isOther) {
			stroke(255);
			fill(255);
			textAlign(CENTER);
			text(this.id, this.pos.x + this.sizeh, this.pos.y - 10);
		}

		//Line to mouse

		// const center = createVector(this.pos.x + this.sizeh, this.pos.y + this.sizeh);
		// const dir = createVector(mouseX - (width / 2 - this.pos.x + this.sizeh), mouseY - (height / 2 - this.pos.y + this.sizeh))

		// const angle = Math.atan2((mouseY - (height / 2 - center.y)), (mouseX - (width / 2 - center.x))); 
		// const dir = p5.Vector.fromAngle(angle).mult(15);

		// const dir = p5.Vector.sub(mousePos, center).add(center);

		// stroke(255);
		// strokeWeight(10);
		// line(center.x, center.y, dir.x, dir.y);
		// strokeWeight(1);
	}
	
    // Function to update player
    update(platforms) {
		
		//based on difference
		// this.score += (Constants.MAP_HEIGHT - this.pos.y) * Constants.PLAYER_BASE_POINTS;

		//based on percentage
		//1 - ratio of y pos to map height (flipped canvas coords), offset of 0.2 so points are not very low at bottom, multiplied by maxp possible points per frame
		this.score += ((1 - (this.pos.y/Constants.MAP_HEIGHT)) + 0.2) * Constants.PLAYER_MAX_POINTS;

		// Apply gravity to player's vertical speed
		this.vel.y += this.gravity;

		// Limit horizontal speed
		if (Math.abs(this.vel.x) > this.maxSpeedX) {
			this.vel.x = Math.sign(this.vel.x) * this.maxSpeedX;
		}

		// Limit falling speed
		if (this.vel.y > this.terminalVelocity) {
			this.vel.y = Math.sign(this.vel.y) * this.terminalVelocity;
		}

		// Update player position
		this.pos.add(this.vel);

		this.platformCollisions(platforms);
  
	}

	platformCollisions(platforms) {

		// CHATGPT

		// Can only ever be touching 2 platforms at once

		let bottom = 0;
		let top = 0;
		let left = 0;
		let right = 0;

		// Loop through all platforms (assuming platforms is an array of objects with x, y, width, and height properties)
		for (const platform of platforms) {

			// Not <= or >= to stop from corner snapping on top/bottom
			// Check if the player is colliding with the top of a platform
			if (
				this.pos.y + this.size >= platform.pos.y &&
				this.pos.y <= platform.pos.y &&
				this.pos.x + this.size >= platform.pos.x &&
				this.pos.x <= platform.pos.x + platform.width
			) {
				this.pos.y = platform.pos.y - this.size;
				this.vel.y = 0;
				top++;
			}

			// Check if the player is colliding with the bottom of a platform
			else if (
				this.pos.y <= platform.pos.y + platform.height &&
				this.pos.y + this.size >= platform.pos.y + platform.height &&
				this.pos.x + this.size >= platform.pos.x &&
				this.pos.x <= platform.pos.x + platform.width

				// Cannot be touching both the top of a platform and the bottom of another platform
				// Fixes snapping when 2 platforms are stacked
				&& top == 0

			) {
				this.pos.y = platform.pos.y + platform.height;
				this.vel.y = -0.001; // nonzero to not reset jump
				// this.vel.y = 0;
				bottom++;
			}
			
			// Check if the player is colliding with the left of a platform
			else if (
				this.pos.x + this.size >= platform.pos.x &&
				this.pos.x <= platform.pos.x &&
				this.pos.y + this.size >= platform.pos.y &&
				this.pos.y <= platform.pos.y + platform.height
			) {
				// Only stick to walls when holding
				this.pos.x = platform.pos.x - this.size - 1;
				this.vel.x = 0;
				this.vel.y = 0;
				left++;
			}
			
			// Check if the player is colliding with the right of a platform
			else if (
				this.pos.x <= platform.pos.x + platform.width &&
				this.pos.x + this.size >= platform.pos.x + platform.width &&
				this.pos.y + this.size >= platform.pos.y &&
				this.pos.y <= platform.pos.y + platform.height
			) {
				// Only stick to walls when holding
				this.pos.x = platform.pos.x + platform.width + 1;
				this.vel.x = 0;
				this.vel.y = 0;
				right++
			}

			// Clip after touching 2 platforms
			if (left + right + top + bottom >= 2) {
				break;
			}
		}
		
	}


}