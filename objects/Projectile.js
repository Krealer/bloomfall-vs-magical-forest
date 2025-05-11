// objects/Projectile.js

export default class Projectile extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, damage = 50) {
    super(scene, x, y, texture);

    this.scene = scene;
    this.damage = damage;
    this.speed = 150; // pixels per second

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.1); // Shrink projectile to fit visually
    this.body.setVelocityX(this.speed);

    // Enable overlap detection between projectile and enemies
    scene.physics.add.overlap(this, scene.enemies, this.hitEnemy, null, this);
  }

  // Called when projectile hits an enemy
  hitEnemy(projectile, enemy) {
    enemy.takeDamage(this.damage); // Enemy handles its own health logic
    projectile.destroy();          // Remove the projectile on impact
  }

  // Called every frame — used here to remove offscreen projectiles
  preUpdate(time, delta) {
    if (this.x > this.scene.game.config.width) {
      this.destroy();
    }
  }
}
