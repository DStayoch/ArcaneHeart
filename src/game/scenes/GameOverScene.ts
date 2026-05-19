import Phaser from 'phaser';

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
        `Combos discovered: ${data.stats.combosDiscovered}/7`,
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
    const monster = this.add.container(914, 354).setDepth(1);
    const aura = this.add.ellipse(8, 28, 330, 240, 0xff5da5, 0.08).setStrokeStyle(2, 0xff9bb9, 0.18);
    const body = this.add.ellipse(58, 34, 210, 150, 0x09050d, 0.96).setStrokeStyle(5, 0x7e3159, 0.86);
    const back = this.add.ellipse(100, 68, 148, 106, 0x1a0d14, 0.9).setStrokeStyle(3, 0xff5da5, 0.34);
    const jawTop = this.add.triangle(-18, 16, -100, -26, 38, -32, 18, 20, 0x120817, 1).setStrokeStyle(3, 0xff9bb9, 0.72);
    const jawBottom = this.add.triangle(-18, 54, -96, 106, 42, 94, 18, 50, 0x120817, 1).setStrokeStyle(3, 0xff9bb9, 0.72);
    const heartGlow = this.add.ellipse(-84, 42, 100, 78, 0xff5da5, 0.18);
    const heart = this.add.graphics();
    heart.fillStyle(0xff5da5, 0.96);
    heart.lineStyle(3, 0xffe29a, 0.92);
    heart.fillPoints([
      new Phaser.Math.Vector2(-84, 72),
      new Phaser.Math.Vector2(-124, 34),
      new Phaser.Math.Vector2(-111, 1),
      new Phaser.Math.Vector2(-91, 9),
      new Phaser.Math.Vector2(-84, 22),
      new Phaser.Math.Vector2(-77, 9),
      new Phaser.Math.Vector2(-57, 1),
      new Phaser.Math.Vector2(-44, 34),
    ], true);
    heart.strokePoints([
      new Phaser.Math.Vector2(-84, 72),
      new Phaser.Math.Vector2(-124, 34),
      new Phaser.Math.Vector2(-111, 1),
      new Phaser.Math.Vector2(-91, 9),
      new Phaser.Math.Vector2(-84, 22),
      new Phaser.Math.Vector2(-77, 9),
      new Phaser.Math.Vector2(-57, 1),
      new Phaser.Math.Vector2(-44, 34),
    ], true);
    const eyeA = this.add.circle(34, -8, 9, 0xffe29a, 0.96);
    const eyeB = this.add.circle(94, 8, 7, 0xffe29a, 0.82);
    const pupilA = this.add.circle(36, -8, 3, 0x120817, 1);
    const pupilB = this.add.circle(96, 8, 2.5, 0x120817, 1);
    monster.add([aura, back, body, jawTop, jawBottom, heartGlow, heart, eyeA, eyeB, pupilA, pupilB]);
    for (let i = 0; i < 9; i += 1) {
      const toothTop = this.add.triangle(-72 + i * 15, -17 + (i % 2) * 5, -7, 0, 0, 22, 7, 0, 0xfff0bd, 0.95);
      const toothBottom = this.add.triangle(-72 + i * 15, 84 - (i % 2) * 4, -7, 0, 0, -22, 7, 0, 0xfff0bd, 0.95);
      monster.add([toothTop, toothBottom]);
    }
    this.tweens.add({ targets: heartGlow, scaleX: 1.2, scaleY: 1.16, alpha: 0.05, duration: 620, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: [jawTop, jawBottom], x: -8, duration: 760, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: monster, y: 344, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}
