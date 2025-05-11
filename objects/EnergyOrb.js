// objects/EnergyOrb.js

export default class EnergyOrb extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'energy_orb');

    this.scene = scene;

    // Add orb to the scene
    scene.add.existing(this);
    this.setInteractive();

    this.setScale(0.1); // 👈 Shrink orb size here (was full size)

    // On click or tap: collect the orb and gain energy
    this.on('pointerdown', () => {
      scene.energy += 50;
      scene.energyText.setText(`Energy: ${scene.energy}`);
      this.destroy();
    });

    // Optional: floating animation to give it some life
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }
}
