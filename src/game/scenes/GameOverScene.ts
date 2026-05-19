import Phaser from 'phaser';
import { comboDefinitions } from '../data/combos';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { won: boolean; stats?: { wave: number; roomsBuilt: number; bossesDefeated: number; evolvedFusions: number; enemiesDefeated: number; leaks: number; combosDiscovered: number } }) {
    this.add.rectangle(0, 0, 1280, 720, data.won ? 0x142216 : 0x1a0d14).setOrigin(0);
    for (let i = 0; i < 80; i += 1) {
      this.add.circle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 720), Phaser.Math.Between(1, 3), data.won ? 0xbfffb8 : 0xff9bb9, Phaser.Math.FloatBetween(0.08, 0.38));
    }
    this.add.text(640, 150, data.won ? 'THE HEART STILL SINGS' : 'THE HEART GOES DARK', { fontSize: '46px', color: data.won ? '#bfffb8' : '#ff9bb9', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(640, 218, data.won ? 'The final chapter closed with the tower awake.' : 'The monsters reached the Arcane Heart.', { fontSize: '22px', color: '#fff0cf' }).setOrigin(0.5);
    if (!data.won) this.drawBrokenHeart();
    if (data.stats) {
      const rows = [
        `Wave reached: ${data.stats.wave}`,
        `Enemies defeated: ${data.stats.enemiesDefeated}`,
        `Bosses defeated: ${data.stats.bossesDefeated}`,
        `Rooms built: ${data.stats.roomsBuilt}`,
        `Combos discovered: ${data.stats.combosDiscovered}/${comboDefinitions.length}`,
        `Evolved fusions: ${data.stats.evolvedFusions}`,
        `Heart breaches: ${data.stats.leaks}`,
      ];
      this.add.rectangle(640, 382, 520, 250, 0x120b19, 0.86).setStrokeStyle(2, data.won ? 0xbfffb8 : 0xff9bb9, 0.8);
      this.add.text(426, 274, `Night Watch Record\n${rows.join('\n')}`, { fontSize: '18px', color: '#fff0cf', lineSpacing: 9 });
    }
    const restart = this.add.text(640, 575, 'Return to Menu', { fontSize: '23px', color: '#120b19', backgroundColor: '#f0cf83', padding: { x: 22, y: 12 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    restart.on('pointerdown', () => this.scene.start('MenuScene'));
  }

  private drawBrokenHeart() {
    const c = this.add.container(640, 88).setDepth(2);
    const glow = this.add.ellipse(0, 4, 150, 104, 0xff5da5, 0.14).setStrokeStyle(2, 0xff9bb9, 0.28);
    const heart = this.add.graphics();
    const left = [
      new Phaser.Math.Vector2(0, 48),
      new Phaser.Math.Vector2(-54, 10),
      new Phaser.Math.Vector2(-44, -24),
      new Phaser.Math.Vector2(-15, -22),
      new Phaser.Math.Vector2(-2, -4),
      new Phaser.Math.Vector2(-12, 8),
      new Phaser.Math.Vector2(0, 18),
      new Phaser.Math.Vector2(-8, 30),
    ];
    const right = [
      new Phaser.Math.Vector2(0, 48),
      new Phaser.Math.Vector2(54, 10),
      new Phaser.Math.Vector2(44, -24),
      new Phaser.Math.Vector2(15, -22),
      new Phaser.Math.Vector2(2, -4),
      new Phaser.Math.Vector2(13, 8),
      new Phaser.Math.Vector2(1, 18),
      new Phaser.Math.Vector2(9, 30),
    ];
    heart.fillStyle(0xff5da5, 0.96);
    heart.lineStyle(3, 0xffe29a, 0.92);
    heart.fillPoints(left, true);
    heart.strokePoints(left, true);
    heart.fillPoints(right, true);
    heart.strokePoints(right, true);
    const crack = this.add.graphics();
    crack.lineStyle(5, 0x120817, 1).lineBetween(0, -12, -10, 5).lineBetween(-10, 5, 5, 18).lineBetween(5, 18, -5, 36);
    crack.lineStyle(2, 0xffe29a, 0.8).lineBetween(0, -12, -10, 5).lineBetween(-10, 5, 5, 18).lineBetween(5, 18, -5, 36);
    const shardA = this.add.triangle(-72, 10, -18, -6, 10, 4, 0, 22, 0xff5da5, 0.6).setStrokeStyle(1, 0xffe29a, 0.5);
    const shardB = this.add.triangle(74, 20, -10, -5, 18, 0, 2, 18, 0xff5da5, 0.44).setStrokeStyle(1, 0xffe29a, 0.42);
    c.add([glow, heart, crack, shardA, shardB]);
    this.tweens.add({ targets: glow, scaleX: 1.14, scaleY: 1.08, alpha: 0.05, duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: [shardA, shardB], y: '+=8', alpha: 0.16, duration: 980, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
