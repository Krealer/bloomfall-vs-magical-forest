export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // HEROES
    const heroPath = 'assets/sprites/heroes/';
    [
      'aelric',
      'krealer',
      'ml',
      'mossan',
      'nira',
      'sapphire',
      'shop',
      'thavira',
      'young_krealer',
      'zealer'
    ].forEach(name => this.load.image(name, `${heroPath}${name}.png`));

    // ENEMIES
    const enemyPath = 'assets/sprites/enemies/';
    [
      'blazehound',
      'draewolf',
      'forest_prowler',
      'foxwolf',
      'shardfang',
      'thornsoul',
      'zingrief'
    ].forEach(name => this.load.image(name, `${enemyPath}${name}.png`));

    // PROJECTILES
    const projPath = 'assets/sprites/projectiles/';
    [
      'energy_orb',
      'ml-shot',
      'mossan-shot',
      'zealer-shot'
    ].forEach(name => this.load.image(name, `${projPath}${name}.png`));
  }

  create() {
    // Go to the game scene
    this.scene.start('GameScene');
  }
}
