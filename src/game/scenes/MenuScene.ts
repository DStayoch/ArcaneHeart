import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.rectangle(0, 0, 1280, 720, 0x09050d).setOrigin(0);
    this.drawBackdrop();
    this.drawMoon();
    this.drawThreats();
    this.drawTitle();
    this.drawTower();
    this.drawFooterCopy();
    const start = this.add.text(640, 592, 'Start Night Watch', { fontSize: '25px', color: '#120b19', backgroundColor: '#f0cf83', padding: { x: 28, y: 13 }, fontStyle: 'bold' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    start.setDepth(40);
    const startGlow = this.add.rectangle(640, 592, start.width + 34, start.height + 18, 0xffd978, 0.18).setStrokeStyle(2, 0xfff0bd, 0.72).setDepth(39);
    this.tweens.add({ targets: startGlow, alpha: 0.34, scaleX: 1.05, scaleY: 1.14, duration: 920, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: start, y: 586, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    start.on('pointerover', () => {
      start.setStyle({ backgroundColor: '#ffe09b' });
      startGlow.setFillStyle(0xffe6a6, 0.34);
    });
    start.on('pointerout', () => {
      start.setStyle({ backgroundColor: '#f0cf83' });
      startGlow.setFillStyle(0xffd978, 0.18);
    });
    start.on('pointerdown', () => this.scene.start('GameScene'));
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('GameScene'));
  }

  private drawTower() {
    const g = this.add.graphics();
    const tower = this.add.container(640, 404);
    const aura = this.add.ellipse(0, 64, 370, 430, 0x9f6bff, 0.08).setStrokeStyle(2, 0xffdf8f, 0.18);
    const body = this.add.graphics();
    body.fillStyle(0x20142c, 0.96).fillRoundedRect(-150, -132, 300, 286, 18);
    body.lineStyle(4, 0xa87bd6, 0.9).strokeRoundedRect(-150, -132, 300, 286, 18);
    body.fillStyle(0x130b1d, 0.78).fillTriangle(0, -250, -138, -120, 138, -120);
    body.lineStyle(3, 0xffdf8f, 0.35).lineBetween(0, -250, -138, -120).lineBetween(0, -250, 138, -120);
    tower.add([aura, body]);

    for (let i = 0; i < 7; i += 1) {
      const y = -102 + i * 36;
      const floor = this.add.rectangle(0, y, 246, 26, i % 2 ? 0x2d1e3e : 0x251831, 1).setStrokeStyle(1, 0xffdf8f, 0.2);
      const rune = this.add.star(i % 2 ? -74 : 74, y, 5, 3, 7, i % 3 === 0 ? 0x77f0c2 : 0xffe29a, 0.8);
      const room = this.add.rectangle(i % 2 ? 88 : -88, y, 42, 18, i % 2 ? 0x75a7ff : 0xf06d3b, 0.74).setStrokeStyle(1, 0xfff0bd, 0.55);
      tower.add([floor, rune, room]);
      this.tweens.add({ targets: rune, angle: 360, duration: 2600 + i * 240, repeat: -1 });
      this.tweens.add({ targets: room, alpha: 0.42, duration: 820 + i * 70, yoyo: true, repeat: -1 });
    }

    const heartGlow = this.add.ellipse(0, -150, 104, 72, 0xff5da5, 0.16);
    const heart = this.add.ellipse(0, -150, 62, 38, 0xff5da5, 0.95).setStrokeStyle(3, 0xffe29a, 0.95);
    tower.add([heartGlow, heart]);
    this.tweens.add({ targets: [heartGlow, heart], scaleX: 1.12, scaleY: 1.18, alpha: 0.7, duration: 720, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    for (let i = 0; i < 8; i += 1) {
      const spark = this.add.circle(Phaser.Math.Between(-96, 96), Phaser.Math.Between(-118, 118), Phaser.Math.Between(2, 4), 0xfff0bd, 0.8);
      tower.add(spark);
      this.tweens.add({
        targets: spark,
        y: spark.y - Phaser.Math.Between(28, 58),
        alpha: 0,
        duration: 1200 + i * 130,
        repeat: -1,
        delay: i * 170,
        onRepeat: () => {
          spark.setPosition(Phaser.Math.Between(-96, 96), Phaser.Math.Between(-118, 118));
          spark.setAlpha(0.8);
        },
      });
    }

    this.tweens.add({ targets: tower, y: 398, duration: 2100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private drawBackdrop() {
    const mist = this.add.graphics();
    mist.fillStyle(0x180d22, 0.95).fillRect(0, 0, 1280, 720);
    mist.fillStyle(0x2b1838, 0.52).fillEllipse(640, 730, 1180, 270);
    mist.fillStyle(0x12332b, 0.18).fillEllipse(220, 610, 420, 160);
    mist.fillStyle(0x39204f, 0.22).fillEllipse(1060, 590, 460, 190);

    for (let i = 0; i < 120; i += 1) {
      const star = this.add.circle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(0, 680), Phaser.Math.Between(1, 3), i % 4 === 0 ? 0x77f0c2 : 0xffe1a1, Phaser.Math.FloatBetween(0.12, 0.62));
      this.tweens.add({ targets: star, alpha: Phaser.Math.FloatBetween(0.05, 0.78), duration: Phaser.Math.Between(900, 2400), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 900) });
    }

    for (let i = 0; i < 18; i += 1) {
      const mote = this.add.star(Phaser.Math.Between(90, 1190), Phaser.Math.Between(170, 690), 5, 2, 5, i % 2 ? 0xbdf4ff : 0xffdf8f, 0.34);
      this.tweens.add({ targets: mote, x: mote.x + Phaser.Math.Between(-24, 24), y: mote.y - Phaser.Math.Between(34, 82), angle: 180, alpha: 0.08, duration: Phaser.Math.Between(2200, 4200), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  private drawMoon() {
    const moon = this.add.container(1050, 112);
    moon.add(this.add.circle(0, 0, 58, 0xf3e6bb, 0.9));
    moon.add(this.add.circle(18, -8, 54, 0x180d22, 0.84));
    moon.add(this.add.circle(-10, 6, 92, 0xffe1a1, 0.08));
    this.tweens.add({ targets: moon, y: 122, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private drawThreats() {
    const left = this.add.container(208, 430).setAlpha(0.5);
    left.add(this.add.ellipse(0, 0, 98, 54, 0xd95f9d, 0.32).setStrokeStyle(2, 0xffc4db, 0.35));
    left.add(this.add.triangle(40, -2, 0, -24, 84, 0, 0, 24, 0xf18bbf, 0.34));
    left.add(this.add.circle(-26, -8, 7, 0xfff0bd, 0.45));
    this.tweens.add({ targets: left, x: 236, y: 420, alpha: 0.68, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const right = this.add.container(1076, 410).setAlpha(0.48);
    right.add(this.add.circle(0, 0, 48, 0x8fb8ff, 0.32).setStrokeStyle(2, 0xd9f1ff, 0.35));
    right.add(this.add.circle(0, 0, 28, 0x10192c, 0.8));
    const hand = this.add.graphics();
    hand.lineStyle(3, 0xffe577, 0.42).lineBetween(0, 0, 0, -34).lineBetween(0, 0, 32, 12);
    right.add(hand);
    this.tweens.add({ targets: right, x: 1048, y: 424, angle: 8, alpha: 0.66, duration: 2100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private drawTitle() {
    const glow = this.add.text(640, 118, 'THE LIVING SPIRE', { fontSize: '66px', color: '#ff5da5', fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0.32);
    const title = this.add.text(640, 112, 'THE LIVING SPIRE', { fontSize: '64px', color: '#ffe29a', fontStyle: 'bold' }).setOrigin(0.5);
    const subtitle = this.add.text(640, 178, 'Build living rooms. Fuse spell sentences. Survive the tower night.', { fontSize: '20px', color: '#d8c7f2' }).setOrigin(0.5);
    this.add.text(640, 214, '18 waves of climbing chaos, mini-bosses, and hungry mega bosses', { fontSize: '15px', color: '#77f0c2' }).setOrigin(0.5).setAlpha(0.95);
    this.tweens.add({ targets: glow, alpha: 0.58, scaleX: 1.025, scaleY: 1.12, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: title, y: 106, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: subtitle, alpha: 0.72, duration: 1400, yoyo: true, repeat: -1 });

    for (let i = 0; i < 10; i += 1) {
      const x = 316 + i * 72;
      const rune = this.add.star(x, 238, i % 2 ? 6 : 5, 3, 8, i % 3 === 0 ? 0xbdf4ff : 0xffdf8f, 0.54);
      this.tweens.add({ targets: rune, y: 226 + (i % 2) * 20, angle: 360, alpha: 0.22, duration: 1800 + i * 140, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  private drawFooterCopy() {
    this.add.text(640, 650, 'Space or click to begin', { fontSize: '15px', color: '#e7d8ff' }).setOrigin(0.5).setAlpha(0.82);
    this.add.text(640, 674, 'Tip: merged rooms now carry their fusion sigil with them.', { fontSize: '13px', color: '#bda7d6' }).setOrigin(0.5);
  }
}
