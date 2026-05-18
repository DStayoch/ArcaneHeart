import Phaser from 'phaser';

export class Tooltip extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private readonly maxWidth = 340;
  private readonly minWidth = 220;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.bg = scene.add.rectangle(0, 0, 300, 92, 0x0f0916, 0.94).setOrigin(0).setStrokeStyle(1, 0xe7c982, 0.8);
    this.text = scene.add.text(12, 10, '', { fontSize: '13px', color: '#fff2ca', wordWrap: { width: 276, useAdvancedWrap: true }, lineSpacing: 3 });
    this.add([this.bg, this.text]);
    this.setDepth(500).setVisible(false);
    scene.add.existing(this);
  }

  show(x: number, y: number, copy: string) {
    this.text.setWordWrapWidth(this.maxWidth - 24, true);
    this.text.setText(copy);
    const width = Phaser.Math.Clamp(this.text.width + 24, this.minWidth, this.maxWidth);
    this.text.setWordWrapWidth(width - 24, true);
    this.text.setText(copy);
    this.bg.width = width;
    this.bg.height = Math.max(72, this.text.height + 22);
    this.setPosition(Math.min(x, 1280 - width - 14), Math.min(y, 720 - this.bg.height - 14));
    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }
}
