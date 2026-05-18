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
}
