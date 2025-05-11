import WaveSpawner from '../systems/WaveSpawner.js';
import Projectile from '../objects/Projectile.js';
import EnergyOrb from '../objects/EnergyOrb.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init() {
    // Grid size and tile dimensions
    this.gridRows = 5;
    this.gridCols = 14;
    this.tileSize = 60;

    // Game state variables
    this.energy = 100;         // Starting energy
    this.baseHP = 5;           // Base HP (used if enemies reach far left — optional)
    this.selectedHero = null; // Currently selected hero for placement

    // Arrays to track all heroes and enemies
    this.heroes = [];
    this.enemies = [];
  }

  create() {
    // Set up the grid, UI, input, and start waves
    this.createGrid();
    this.createUI();
    this.setupInput();

    this.waveSpawner = new WaveSpawner(this);
    this.waveSpawner.start(); // Begin spawning enemies
  }

  createGrid() {
    this.grid = [];

    // Create a 2D array of tile data with visual rectangles
    for (let row = 0; row < this.gridRows; row++) {
      this.grid[row] = [];

      for (let col = 0; col < this.gridCols; col++) {
        const x = col * this.tileSize + 100;
        const y = row * this.tileSize + 100;

        const tile = this.add.rectangle(
          x,
          y,
          this.tileSize - 2,
          this.tileSize - 2,
          0x2a2a2a
        ).setOrigin(0); // Align top-left

        this.grid[row][col] = { x, y, occupied: false };
      }
    }
  }

  createUI() {
    // Show current energy in top-left
    this.energyText = this.add.text(10, 10, `Energy: ${this.energy}`, {
      font: '18px Arial',
      fill: '#fff'
    });

    const rowY = 40;
    const spacing = 250; // Horizontal gap between buttons

    // Row 1: Young Krealer + Thavira
    this.add.text(10, rowY, 'Place Young Krealer (50)', {
      font: '16px Arial', fill: '#fff'
    }).setInteractive().on('pointerdown', () => this.selectHero('young_krealer'));

    this.add.text(10 + spacing, rowY, 'Place Thavira (75)', {
      font: '16px Arial', fill: '#fff'
    }).setInteractive().on('pointerdown', () => this.selectHero('thavira'));

    // Row 2: Zealer + Remove
    this.add.text(10, rowY + 30, 'Place Zealer (100)', {
      font: '16px Arial', fill: '#fff'
    }).setInteractive().on('pointerdown', () => this.selectHero('zealer'));

    this.add.text(10 + spacing, rowY + 30, 'Remove (0)', {
      font: '16px Arial', fill: '#f88'
    }).setInteractive().on('pointerdown', () => this.selectHero('remove'));
  }

  setupInput() {
    // Listen for clicks on the grid
    this.input.on('pointerdown', this.handlePointerDown, this);
  }

  selectHero(type) {
    // Store the selected hero type
    this.selectedHero = type;
  }

  handlePointerDown(pointer) {
    if (!this.selectedHero) return;

    // Convert pointer position to grid coordinates
    const col = Math.floor((pointer.x - 100) / this.tileSize);
    const row = Math.floor((pointer.y - 100) / this.tileSize);

    // Prevent out-of-bounds clicks
    if (
      row < 0 || row >= this.gridRows ||
      col < 0 || col >= this.gridCols
    ) return;

    const tileObj = this.grid[row][col];

    // 🚮 REMOVE hero logic
    if (this.selectedHero === 'remove') {
      if (tileObj.occupied) {
        const hero = this.children.list.find(obj =>
          obj.gridPosition?.row === row && obj.gridPosition?.col === col
        );
        if (hero) {
          hero.destroy();
          tileObj.occupied = false;
        }
      }
      this.selectedHero = null;
      return;
    }

    // ✅ PLACE hero logic
    if (!tileObj.occupied) {
      let cost = 0;
      if (this.selectedHero === 'young_krealer') cost = 50;
      else if (this.selectedHero === 'zealer') cost = 100;
      else if (this.selectedHero === 'thavira') cost = 75;

      // Only place if player has enough energy
      if (this.energy >= cost) {
        // Create hero sprite at center of tile
        const sprite = this.add.image(
          tileObj.x + this.tileSize / 2,
          tileObj.y + this.tileSize / 2,
          this.selectedHero
        );

        // Scale sprite appropriately
        if (['zealer', 'young_krealer', 'thavira'].includes(this.selectedHero)) {
          sprite.setScale(0.15);
        } else {
          sprite.setScale(0.5);
        }

        // Mark tile as used and tag sprite with grid position
        tileObj.occupied = true;
        sprite.gridPosition = { row, col };

        // Deduct energy
        this.energy -= cost;
        this.energyText.setText(`Energy: ${this.energy}`);

        // Give the hero its unique behavior
        this.addHeroBehavior(sprite, this.selectedHero, row, col);
        this.selectedHero = null;
      }
    }
  }

  addHeroBehavior(sprite, type, row, col) {
    // Young Krealer = generates orbs every 5 seconds
    if (type === 'young_krealer') {
      this.time.addEvent({
        delay: 10000,
        loop: true,
        callback: () => {
          new EnergyOrb(this, sprite.x + 10, sprite.y - 20);
        }
      });
    }

    // Zealer = fires projectiles every 2 seconds
    if (type === 'zealer') {
      this.time.addEvent({
        delay: 5000,
        loop: true,
        callback: () => {
          new Projectile(this, sprite.x + 20, sprite.y, 'zealer-shot', 50);
        }
      });
    }

    // Thavira = has HP, acts as a blocker
    if (type === 'thavira') {
      sprite.hp = 300;
      this.physics.add.existing(sprite);
      sprite.body.immovable = true;
    }
  }

  update(time, delta) {
    this.enemies.forEach(enemy => {
      // Only move if not attacking Thavira
      if (!enemy.target) {
        enemy.x -= enemy.speed * delta / 1000;
      }

      // Enemy reached the far left = base is damaged
      if (enemy.x < 0) {
        enemy.destroy();
        this.enemies = this.enemies.filter(e => e !== enemy);

        this.baseHP--;
        this.energyText.setText(`Energy: ${this.energy}`); // optional energy refresh

        // Game Over
        if (this.baseHP <= 0) {
          this.scene.restart();
          alert('Game Over! Bloomfall has fallen...');
        }
      }
    });
  }
}
