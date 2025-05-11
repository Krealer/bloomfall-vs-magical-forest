// main.js

// Import scenes
import BootScene from './scenes/BootScene.js';  // Preloads assets
import GameScene from './scenes/GameScene.js';  // Main gameplay scene
// UIScene is planned for later (e.g., wave UI, pause menu)
// import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO, // Automatically choose WebGL or Canvas
  width: 960,        // Game width
  height: 540,       // Game height
  backgroundColor: '#1a1a1a', // Fallback background

  parent: 'game-container', // Attach canvas to <div id="game-container">

  // Physics system: simple top-down 2D
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // No gravity — top-down game
      debug: false       // Set to true if you want collision boxes shown
    }
  },

  // Register scenes in order — the first one will auto-start
  scene: [
    BootScene,
    GameScene
    // UIScene will be added later
  ],

  // Scale settings for responsive design
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// Launch the game!
const game = new Phaser.Game(config);
