import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.rectangle(0, 0, 1280, 720, 0x100a18).setOrigin(0);
    for (let i = 0; i < 90; i += 1) {
      this.add.circle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 720), Phaser.Math.Between(1, 3), 0xffe1a1, Phaser.Math.FloatBetween(0.15, 0.55));
    }
    this.add.text(640, 145, 'THE LIVING SPIRE', { fontSize: '62px', color: '#ffe29a', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 224, 'A vertical fantasy tower-defense roguelite', { fontSize: '22px', color: '#d8c7f2' }).setOrigin(0.5);
    this.drawTower();
    const start = this.add.text(640, 570, 'Start Night Watch', { fontSize: '24px', color: '#120b19', backgroundColor: '#f0cf83', padding: { x: 24, y: 12 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    start.on('pointerdown', () => this.scene.start('GameScene'));
    this.add.text(640, 640, 'Build living rooms. Discover spell sentences. Defend the Arcane Heart.', { fontSize: '16px', color: '#e7d8ff' }).setOrigin(0.5);
  }

  private drawTower() {
    const g = this.add.graphics();
    g.fillStyle(0x20142c, 0.92).fillRoundedRect(510, 270, 260, 250, 16);
    g.lineStyle(3, 0x916fb4, 0.8).strokeRoundedRect(510, 270, 260, 250, 16);
    for (let i = 0; i < 6; i += 1) {
      const y = 294 + i * 34;
      g.fillStyle(i % 2 ? 0x2b1d3c : 0x251831, 1).fillRect(532, y, 216, 24);
      g.lineStyle(2, 0xffdf8f, 0.35).lineBetween(616, y + 12, 664, y + 12);
    }
    this.add.ellipse(640, 260, 54, 32, 0xff5da5, 0.9).setStrokeStyle(3, 0xffe29a);
  }
}
