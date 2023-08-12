

class MapGenerator {


	constructor() {

		this.platforms = [];

		this.spawnPoints = [];

	}

	buildSpawnPoints() {

		// Intermitten points where platforms can spawn at

		for (let x = 0; x <= Constants.MAP_CEILING_WIDTH - Constants.PLATFORM_LENGTH; x += Constants.PLATFORM_LENGTH) {
			for (let y = 0; y <= Constants.MAP_HEIGHT - Constants.PLATFORM_LENGTH; y += Constants.PLATFORM_LENGTH) {
				let pos = createVector(x, y);
				this.spawnPoints.push(pos);
			}
		}

	}

	show() {
		for (const platform of this.platforms) {
			platform.show();
		}

		// for (const pos of this.spawnPoints) {
		// 	fill(0, 255, 0);
		// 	ellipse(pos.x, pos.y, 10, 10);
		// }
	}

	
	createPlatform(x, y, width, height, outer = false) {
		let platform = new Platform(createVector(x, y), width, height, Constants.PLATFORM_HEALTH, outer);
		this.platforms.push(platform);
	}

	
	generateSinglePlatform() {

		let invalid = true;

		while (invalid) {

			// const x = Math.random() * (Constants.MAP_CEILING_WIDTH - 200) + 50;
			// const y = Math.random() * (Constants.MAP_HEIGHT - 30) - 50;

			const pos = random(this.spawnPoints);

			// this.createPlatform(x, y, 200, 30);
			if (Math.random() < Constants.PLATFORM_HORIZONTAL_PROBABILITY || (pos.x == 0)) {
				this.createPlatform(pos.x, pos.y, Constants.PLATFORM_LENGTH, Constants.PLATFORM_THICKNESS);
			} else {
				this.createPlatform(pos.x, pos.y, Constants.PLATFORM_THICKNESS, Constants.PLATFORM_LENGTH + Constants.PLATFORM_THICKNESS);
			}
			break;
		}

			
	}

	generateRandomPlatforms() {

		while (this.platforms.length < Constants.MAX_PLATFORMS) {

			this.generateSinglePlatform();

		}
	}


}