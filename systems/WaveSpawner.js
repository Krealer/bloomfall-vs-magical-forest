// systems/WaveSpawner.js

import Enemy from '../objects/Enemy.js';

export default class WaveSpawner {
  constructor(scene) {
    this.scene = scene;

    this.spawnDelay = 5000;     // Initial delay between spawns (5 seconds)
    this.minDelay = 1500;       // Minimum delay as game progresses
    this.spawnAcceleration = 100; // How much to decrease delay every wave (in ms)

    this.enemyTypes = ['shardfang', 'zingrief'];
    this.spawnTimer = null;
  }

  start() {
    // Wait 20 seconds before beginning the first wave
    this.scene.time.delayedCall(20000, () => {
      this.scheduleNextSpawn();
    });
  }

  scheduleNextSpawn() {
    // Spawn one enemy now
    this.spawnEnemy();

    // Slowly reduce delay over time, but never below minimum
    this.spawnDelay = Math.max(this.spawnDelay - this.spawnAcceleration, this.minDelay);

    // Schedule the next spawn
    this.spawnTimer = this.scene.time.addEvent({
      delay: this.spawnDelay,
      callback: () => this.scheduleNextSpawn(),
      callbackScope: this
    });
  }

  spawnEnemy() {
    const type = Phaser.Utils.Array.GetRandom(this.enemyTypes);
    const lane = Phaser.Math.Between(0, 4); // 5 rows (0–4)

    const x = this.scene.game.config.width + 40;
    const y = lane * this.scene.tileSize + 130;

    const enemy = new Enemy(this.scene, x, y, type);
    enemy.setScale(0.2); // Consistent enemy sizing

    this.scene.enemies.push(enemy);
  }
}
