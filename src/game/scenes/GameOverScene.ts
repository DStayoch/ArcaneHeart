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
    if (!data.won) this.drawHeartEater();
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

  private drawHeartEater() {
    const monster = this.add.container(1010, 396).setDepth(1);
    const aura = this.add.ellipse(0, 16, 330, 210, 0xff5da5, 0.07).setStrokeStyle(2, 0xff9bb9, 0.16);
    const body = this.add.ellipse(34, 18, 210, 132, 0x050309, 0.98).setStrokeStyle(5, 0x8d2f66, 0.82);
    const haunch = this.add.ellipse(92, 44, 150, 92, 0x140816, 0.9).setStrokeStyle(3, 0xff5da5, 0.26);
    const mouthShadow = this.add.ellipse(-64, 24, 112, 74, 0x000000, 0.82);
    const upperJaw = this.add.polygon(-58, -18, [[-96, 26], [-62, -34], [28, -20], [8, 8], [-52, 12]], 0x120817, 1).setStrokeStyle(3, 0xff9bb9, 0.76);
    const lowerJaw = this.add.polygon(-58, 68, [[-96, -22], [-50, 28], [30, 14], [8, -8], [-52, -12]], 0x120817, 1).setStrokeStyle(3, 0xff9bb9, 0.76);
    const tongue = this.add.ellipse(-48, 38, 84, 26, 0x8d2f66, 0.64).setRotation(-0.18);
    const heartGlow = this.add.ellipse(-112, 34, 94, 78, 0xff5da5, 0.2);
    const heart = this.add.graphics();
    const heartPoints = [
      new Phaser.Math.Vector2(-112, 68),
      new Phaser.Math.Vector2(-150, 32),
      new Phaser.Math.Vector2(-138, 2),
      new Phaser.Math.Vector2(-120, 9),
      new Phaser.Math.Vector2(-112, 23),
      new Phaser.Math.Vector2(-104, 9),
      new Phaser.Math.Vector2(-86, 2),
      new Phaser.Math.Vector2(-74, 32),
    ];
    heart.fillStyle(0xff5da5, 0.96);
    heart.lineStyle(3, 0xffe29a, 0.92);
    heart.fillPoints(heartPoints, true);
    heart.strokePoints(heartPoints, true);
    const eyeA = this.add.ellipse(24, -20, 18, 12, 0xffe29a, 0.96).setRotation(-0.2);
    const eyeB = this.add.ellipse(80, -6, 14, 10, 0xffe29a, 0.78).setRotation(0.24);
    const pupilA = this.add.circle(27, -20, 3, 0x120817, 1);
    const pupilB = this.add.circle(82, -6, 2.4, 0x120817, 1);
    const browA = this.add.rectangle(24, -33, 35, 4, 0xff9bb9, 0.46).setRotation(-0.34);
    const browB = this.add.rectangle(78, -18, 26, 3, 0xff9bb9, 0.34).setRotation(0.28);
    const tendrilA = this.add.graphics();
    tendrilA.lineStyle(5, 0x7e3159, 0.58).lineBetween(96, 6, 136, -24).lineBetween(136, -24, 184, -28).lineBetween(184, -28, 218, 2).lineBetween(218, 2, 226, 36).lineBetween(226, 36, 198, 66);
    const tendrilB = this.add.graphics();
    tendrilB.lineStyle(4, 0x8d2f66, 0.44).lineBetween(72, 72, 118, 104).lineBetween(118, 104, 168, 116).lineBetween(168, 116, 218, 90);
    monster.add([aura, tendrilA, tendrilB, haunch, body, mouthShadow, tongue, upperJaw, lowerJaw, heartGlow, heart, eyeA, eyeB, pupilA, pupilB, browA, browB]);
    for (let i = 0; i < 8; i += 1) {
      const toothTop = this.add.triangle(-108 + i * 16, 5 + (i % 2) * 2, -5, 0, 0, 18, 5, 0, 0xfff0bd, 0.96);
      const toothBottom = this.add.triangle(-108 + i * 16, 58 - (i % 2) * 2, -5, 0, 0, -18, 5, 0, 0xfff0bd, 0.96);
      monster.add([toothTop, toothBottom]);
    }
    this.tweens.add({ targets: [heartGlow, heart], scaleX: 1.1, scaleY: 1.08, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: [upperJaw, lowerJaw], x: -8, duration: 840, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: [eyeA, pupilA], alpha: 0.55, duration: 520, yoyo: true, repeat: -1, repeatDelay: 1300 });
    this.tweens.add({ targets: monster, y: 386, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
