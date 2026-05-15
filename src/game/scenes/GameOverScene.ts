import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { won: boolean }) {
    this.add.rectangle(0, 0, 1280, 720, data.won ? 0x142216 : 0x1a0d14).setOrigin(0);
    this.add.text(640, 235, data.won ? 'THE HEART STILL SINGS' : 'THE HEART GOES DARK', { fontSize: '46px', color: data.won ? '#bfffb8' : '#ff9bb9', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 315, data.won ? 'The Page Eater has been shelved.' : 'The monsters reached the Arcane Heart.', { fontSize: '22px', color: '#fff0cf' }).setOrigin(0.5);
    const restart = this.add.text(640, 430, 'Return to Menu', { fontSize: '23px', color: '#120b19', backgroundColor: '#f0cf83', padding: { x: 22, y: 12 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    restart.on('pointerdown', () => this.scene.start('MenuScene'));
  }
}
