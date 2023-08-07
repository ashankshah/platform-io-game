/*
Client Side Program

Handle client-side information
Draw game for player
Send keyboard inputs to server
Recieve game updates

*/

let socket;
let ping = 0;

const players = {};

let Constants;

let p;

const platforms = [];

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

	p = new Player(createVector(Constants.CANVAS_HEIGHT - 100, Constants.CANVAS_WIDTH / 2));
	
	// Join game (Slight lag between when log on and acknowledged by server)
	socket.on('connect', () => {
		console.log("CLIENT FULLY CONNECTED - ID: " + socket.id);
		p.setId(socket.id);
		// socket.emit(Constants.MESSAGES.JOIN, {x: p.pos.x, y: p.pos.y, id: socket.id});
	});

	createPlatform(0, Constants.CANVAS_HEIGHT - 50, Constants.CANVAS_WIDTH, 50);
	createPlatform(0, 0, 50, Constants.CANVAS_HEIGHT);
	createPlatform(Constants.CANVAS_WIDTH - 50, 0, 50, Constants.CANVAS_HEIGHT);
	createPlatform(0, 0, Constants.CANVAS_WIDTH, 50);

	createPlatform(150, 400, 200, 30);
	createPlatform(650, 200, 200, 30);
	createPlatform(500, 300, 200, 30);

	createPlatform(360, 100, 30, 400);
}

function createPlatform(x, y, width, height) {
	let platform = new Platform(createVector(x, y), width, height, 3);
	platforms.push(platform);
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
	  const bulletVel = p5.Vector.fromAngle(angle).mult(10); // Adjust bullet speed as needed
	  projectile = new Projectile(bulletPos, bulletVel, 10, 10)
	  bullets.push(projectile);
	}
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

	text("(" + mouseX + ", " + mouseY + ")", mouseX, mouseY);

	// --------------------------------------------------
	// Update movement

	keyCheck();
	p.update(platforms);

	// --------------------------------------------------
	// Camera follow player

	translate(
		width  / 2 - p.pos.x + p.sizeh - p.vel.x * Constants.CAMERA_LAG, 
		height / 2 - p.pos.y + p.sizeh - p.vel.y * Constants.CAMERA_LAG
	);

	// fill(100);
	// ellipse(p.pos.x + p.sizeh, p.pos.y + p.sizeh, 100, 100);

	// --------------------------------------------------
	// Display elements

	p.show();
	for (const platform of platforms) {
		platform.show();
	}

	for (const id in players) {
		players[id].show();
	}
	
	// --------------------------------------------------
	// Send out data
	// FIXME: Running every frame, only run on server tick rate

	for (let i = bullets.length - 1; i >= 0; i--) {
		const bullet = bullets[i];
		bullet.update();
		bullet.show();
		// if (bullet.isOffscreen()) {
		//   bullets.splice(i, 1);
		// }
		for (const platform of platforms) {
            if (
                bullet.pos.x + bullet.width > platform.pos.x &&
                bullet.pos.x < platform.pos.x + platform.width &&
                bullet.pos.y + bullet.height > platform.pos.y &&
                bullet.pos.y < platform.pos.y + platform.height
            ) {
                // Remove the bullet and platform
                bullets.splice(i, 1);
				platform.health -= 1;
				if(platform.health == 0){
					platforms.splice(platforms.indexOf(platform), 1);
				}
                break; // Exit the loop since the bullet is destroyed
            }
        }
	  }
}
