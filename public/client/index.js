/*
Client Side Program

Handle client-side information
Draw game for player
Send keyboard inputs to server
Recieve game updates

*/

let Constants;

let socket;
let ping = 0;

const players = {};

let p;

let mapGen;

function preload() {
	Constants = loadJSON("../constants.json");
}

function setup() {

	// Freezing so no overwrite hacking
	Constants = Object.freeze(Constants);

	// Connecting to local development server
	socket = io.connect('http://localhost:' + Constants.DEV_PORT);

	// socket.on(Constants.MESSAGES.JOIN, data => {
	// 	let o = new Player(createVector(data.x, data.y), true);
	// 	players[data.id] = o;
	// })

	// What to do when recieve player data
	socket.on(Constants.MESSAGES.POSITION, data => {
		if (data.id == undefined) return; // Player hasn't loaded fully yet
		if (!(data.id in players)) {
			players[data.id] = new Player(createVector(data.x, data.y), true);
		}
		players[data.id].setId(data.id);
		players[data.id].setPos(data.x, data.y);
	});

	// Disconnect other player
	socket.on(Constants.MESSAGES.DISCONNECT, data => {
		delete players[data.id];
		console.log("DISCONNECTED: " + data.id);
	});

	// Check ping on interval
	setInterval(() => {
		const start = Date.now();

		// Measure round-trip ping
		socket.emit("ping", () => {
			ping = Date.now() - start;
		});
	}, 100);

	// Setting up screen
	createCanvas(Constants.CANVAS_WIDTH, Constants.CANVAS_HEIGHT);

	// p = new Player(createVector(Constants.MAP_HEIGHT / 2 - 200, Constants.CANVAS_WIDTH / 2));
	p = new Player(createVector(Constants.CANVAS_HEIGHT - 200, Constants.CANVAS_WIDTH / 2));
	
	// Join game (Slight lag between when log on and acknowledged by server)
	socket.on('connect', () => {
		console.log("CLIENT FULLY CONNECTED - ID: " + socket.id);
		p.setId(socket.id);
		// socket.emit(Constants.MESSAGES.JOIN, {x: p.pos.x, y: p.pos.y, id: socket.id});
	});

	mapGen = new MapGenerator();

	mapGen.createPlatform(0, Constants.MAP_HEIGHT, Constants.MAP_FLOOR_WIDTH, 50, outer = true); // floor
	mapGen.createPlatform(0, 0, Constants.MAP_FLOOR_WIDTH, 50, outer = true); // CEILING
	mapGen.createPlatform(Constants.MAP_CEILING_WIDTH, 0, 50, Constants.MAP_HEIGHT + 50, outer = true); // right wall
	mapGen.createPlatform(0, 0, 50, Constants.MAP_HEIGHT + 50, outer = true); // left wall


	mapGen.buildSpawnPoints();

	mapGen.generateRandomPlatforms();




	// createPlatform(150, 400, 200, 30);
	// createPlatform(650, 200, 200, 30);
	// createPlatform(500, 300, 200, 30);
	// createPlatform(360, 100, 30, 400);

}

function keyCheck() {
	/*
	Continuous movement of player with multiple keys
	*/

	p.vel.x = 0;

	// KeyCodes for WAD, Arrows, Spacebar
	let left = keyIsDown(65) || keyIsDown(37);
	let right = keyIsDown(68) || keyIsDown(39);
	let jump = keyIsDown(87) || keyIsDown(32) || keyIsDown(38);
	
	if (left && !right) {
		p.vel.x = -Constants.PLAYER_MAX_SPEED_X;
	}
	
	if (right && !left) {
		p.vel.x = Constants.PLAYER_MAX_SPEED_X;
	}

	// Decimal graivty makes y velocity is always nonzero
	if (jump) {
		if (p.vel.y == 0) {
			p.vel.y = Constants.PLAYER_JUMP_POWER;
		}
	}
	
	const data = {
		t: Date.now(),
		id: socket.id,
		x: p.pos.x,
		y: p.pos.y
	};

	socket.emit(Constants.MESSAGES.POSITION, data);


}

let bullets = []; 

function mouseClicked() {
	if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
		const bulletPos = createVector(p.pos.x + p.sizeh, p.pos.y + p.sizeh);
		//mouseX - (width / 2 - this.pos.x), mouseY - (height / 2 - this.pos.y)
		const angle = Math.atan2((mouseY - (height / 2 - p.pos.y)-p.sizeh) - bulletPos.y, (mouseX - (width / 2 - p.pos.x)-p.sizeh) - bulletPos.x); 
		const bulletVel = p5.Vector.fromAngle(angle).mult(Constants.BULLET_MAGNITUDE); // Adjust bullet speed as needed
		projectile = new Projectile(bulletPos, bulletVel, 10, 10)
		bullets.push(projectile);
	}
}

function updateHealthBar(health) {
	let maxHealth = 100;
	let healthFraction = health / maxHealth;
	let barWidth = map(healthFraction, 0, 1, 0, width - 20); // Map health to bar width
	let greenWidth = barWidth;
  
	// Draw the background of the health bar
	fill(200);
	rect(300, 550, width/2 - 20, 20);
  
	// Draw the green portion of the health bar based on the current health value
	fill(0, 255, 0);
	rect(300, 550, greenWidth/2, 20);
}


function draw() {

	background(20);

	// --------------------------------------------------
	// Debug logs

	textAlign(LEFT)

	stroke(255);
	fill(255);
	text("FPS: " + Math.round(frameRate()), 15, 15);

	text("Ping: " + Math.round(ping), 15, 30);

	text("(" + Math.round(mouseX) + ", " + Math.round(mouseY) + ")", mouseX, mouseY);

	text("Score: " + Math.round(p.score), 20, 580)
	

	// --------------------------------------------------
	// Update movement

	keyCheck();

	p.update(mapGen.platforms);

	mapGen.generateRandomPlatforms();

	
	// --------------------------------------------------
	// Camera follow player
	// EVERYTHING DRAWN BEFORE THIS WILL STICK TO CANVAS IN SPOT
	// EVERYTHING DRAWN AFTER WILL MOVE RELATIVE TO PLAYER VIEW IN MAP

	translate(
		width  / 2 - p.pos.x + p.sizeh - p.vel.x * Constants.CAMERA_LAG, 
		height / 2 - p.pos.y + p.sizeh - p.vel.y * Constants.CAMERA_LAG
	);

	// fill(100);
	// ellipse(p.pos.x + p.sizeh, p.pos.y + p.sizeh, 100, 100);

	// --------------------------------------------------
	// Display elements

	mapGen.show();

	p.show();

	for (const id in players) {
		players[id].show();
	}

	// Show minimap ----------------

	strokeWeight(4);
	stroke(250);
	fill(255, 50);


	minimapWidth = Constants.MAP_CEILING_WIDTH * Constants.MINIMAP_SCALE;
	minimapHeight = Constants.MAP_HEIGHT * Constants.MINIMAP_SCALE;

	// Lock to view
	rect(
		p.pos.x - p.sizeh + Constants.CANVAS_WIDTH  / 2 - minimapWidth  - 10 + p.vel.x * Constants.CAMERA_LAG, 
		p.pos.y - p.sizeh + Constants.CANVAS_HEIGHT / 2 - minimapHeight - 10 + p.vel.y * Constants.CAMERA_LAG, 
		minimapWidth, minimapHeight
	);

	// -0.001: Small epsilon minimap scale to fit within bounds of drawing
	smallx = (p.pos.x + p.sizeh) * (Constants.MINIMAP_SCALE - 0.000);
	smally = (p.pos.y + p.sizeh) * (Constants.MINIMAP_SCALE - 0.000);

	stroke(255);
	strokeWeight(1);
	fill(0, 0, 255);
	ellipse(
		p.pos.x - p.sizeh + Constants.CANVAS_WIDTH  / 2 - minimapWidth  - 10 + p.vel.x * Constants.CAMERA_LAG + smallx,
		p.pos.y - p.sizeh + Constants.CANVAS_HEIGHT / 2 - minimapHeight - 10 + p.vel.y * Constants.CAMERA_LAG + smally,
		6, 6
	)

	stroke(200);
	strokeWeight(2);

	// Dont read this part

	for (const platform of mapGen.platforms) {

		let sx = platform.pos.x * Constants.MINIMAP_SCALE;
		let sy = platform.pos.y * Constants.MINIMAP_SCALE;

		let sw = platform.width * Constants.MINIMAP_SCALE - Constants.PLATFORM_THICKNESS * Constants.MINIMAP_SCALE;
		let sh = platform.height * Constants.MINIMAP_SCALE - Constants.PLATFORM_THICKNESS * Constants.MINIMAP_SCALE;

		// Horizontal boi
		if (sw > sh) {
			line(
				p.pos.x - p.sizeh + Constants.CANVAS_WIDTH  / 2 - minimapWidth  - 10 + p.vel.x * Constants.CAMERA_LAG + sx,
				p.pos.y - p.sizeh + Constants.CANVAS_HEIGHT / 2 - minimapHeight - 10 + p.vel.y * Constants.CAMERA_LAG + sy,
				p.pos.x - p.sizeh + Constants.CANVAS_WIDTH  / 2 - minimapWidth  - 10 + p.vel.x * Constants.CAMERA_LAG + sx + sw,
				p.pos.y - p.sizeh + Constants.CANVAS_HEIGHT / 2 - minimapHeight - 10 + p.vel.y * Constants.CAMERA_LAG + sy
			)
		
		// Vertical boi
		} else {
			line(
				p.pos.x - p.sizeh + Constants.CANVAS_WIDTH  / 2 - minimapWidth  - 10 + p.vel.x * Constants.CAMERA_LAG + sx,
				p.pos.y - p.sizeh + Constants.CANVAS_HEIGHT / 2 - minimapHeight - 10 + p.vel.y * Constants.CAMERA_LAG + sy,
				p.pos.x - p.sizeh + Constants.CANVAS_WIDTH  / 2 - minimapWidth  - 10 + p.vel.x * Constants.CAMERA_LAG + sx,
				p.pos.y - p.sizeh + Constants.CANVAS_HEIGHT / 2 - minimapHeight - 10 + p.vel.y * Constants.CAMERA_LAG + sy + sh
			)
		}
		

	}

	strokeWeight(1);
	// -----------------------------

	for (let i = bullets.length - 1; i >= 0; i--) {
		
		const bullet = bullets[i];
		bullet.show();
		bullet.update();
		
		for (const platform of mapGen.platforms) {
            if (
                bullet.pos.x + bullet.width > platform.pos.x &&
                bullet.pos.x < platform.pos.x + platform.width &&
                bullet.pos.y + bullet.height > platform.pos.y &&
                bullet.pos.y < platform.pos.y + platform.height
            ) {
                // Remove the bullet and platform
                bullets.splice(i, 1);
				if (!platform.outer) {
					platform.health -= 1;
					if(platform.health == 0){
						mapGen.platforms.splice(mapGen.platforms.indexOf(platform), 1);
					}
				}
				
                break; // Exit the loop since the bullet is destroyed
            }
        }
	}

	translate(
        -width / 2 + p.pos.x - p.sizeh + p.vel.x * Constants.CAMERA_LAG,
        -height / 2 + p.pos.y - p.sizeh + p.vel.y * Constants.CAMERA_LAG
    );


	updateHealthBar(p.health);

	// --------------------------------------------------
	// Send out data
	// FIXME: Running every frame, only run on server tick rate

	
}
