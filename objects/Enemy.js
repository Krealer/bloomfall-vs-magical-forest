// objects/Enemy.js

export default class Enemy extends Phaser.GameObjects.Image {
  constructor(scene, x, y, type) {
    super(scene, x, y, type);

    this.scene = scene;
    this.type = type;

    // Enemy stats per type
    const stats = {
      shardfang: { hp: 100, speed: 20, damage: 50 },
      zingrief:  { hp: 300, speed: 5, damage: 75 }
    };

    const { hp, speed, damage } = stats[type] || { hp: 100, speed: 20, damage: 50 };
    this.hp = hp;
    this.speed = speed;
    this.damage = damage;

    this.target = null; // Who the enemy is currently attacking

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.2);
    this.body.setVelocityX(-this.speed);

    // Check for overlapping with heroes — especially Thavira
    this.scene.physics.add.overlap(this, scene.children.list, this.checkForThavira, null, this);
  }

  checkForThavira(enemy, other) {
    if (!other.texture || !other.texture.key) return;
    if (other.texture.key !== 'thavira') return;

    if (!this.target) {
      this.target = other;

      // Freeze enemy
      this.body.setVelocity(0);
      this.body.moves = false;
      this.body.allowGravity = false;

      // Begin attack loop
      this.attackTimer = this.scene.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => this.attackTarget(),
        callbackScope: this
      });
    }
  }

  attackTarget() {
    // If Thavira is already gone, resume walking
    if (!this.target || !this.target.active) {
      this.target = null;
      this.body.moves = true;
      this.body.setVelocityX(-this.speed);
      if (this.attackTimer) this.attackTimer.remove();
      return;
    }

    // Damage Thavira
    this.target.hp -= this.damage;

    if (this.target.hp <= 0) {
      // ✅ Free the grid tile
      const { row, col } = this.target.gridPosition || {};
      if (row !== undefined && col !== undefined) {
        this.scene.grid[row][col].occupied = false;
      }

      this.target.destroy();
      this.target = null;

      this.body.moves = true;
      this.body.setVelocityX(-this.speed);

      if (this.attackTimer) this.attackTimer.remove();
    }
  }

  takeDamage(amount) {
    this.hp -= amount;

    if (this.hp <= 0) {
      if (this.attackTimer) this.attackTimer.remove();

      this.scene.enemies = this.scene.enemies.filter(e => e !== this);
      this.destroy();
    }
  }

  preUpdate() {
    // ✅ Skip if scene is restarting or unavailable
    if (!this.scene || !this.scene.grid || this.scene.scene.isSleeping?.()) return;

    // ❌ Don't move if currently attacking Thavira
    if (this.target) return;

    // Reached the base (left side)
    if (this.x < 0) {
      const scene = this.scene;
      scene.enemies = scene.enemies.filter(e => e !== this);
      this.destroy();

      scene.baseHP--;
      scene.energyText.setText(`Energy: ${scene.energy}`);

      if (scene.baseHP <= 0) {
        scene.scene.restart();
        alert('Game Over! Bloomfall has fallen...');
      }
    }
  }
}
