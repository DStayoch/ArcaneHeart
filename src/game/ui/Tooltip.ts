import Phaser from 'phaser';

export class Tooltip extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private readonly panelWidth = 340;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.bg = scene.add.rectangle(0, 0, this.panelWidth, 92, 0x0f0916, 0.94).setOrigin(0).setStrokeStyle(1, 0xe7c982, 0.8);
    this.text = scene.add.text(12, 10, '', { fontSize: '13px', color: '#fff2ca', wordWrap: { width: this.panelWidth - 24, useAdvancedWrap: true }, lineSpacing: 3 });
    this.add([this.bg, this.text]);
    this.setDepth(500).setVisible(false);
    scene.add.existing(this);
  }

  show(x: number, y: number, copy: string) {
    this.text.setWordWrapWidth(this.panelWidth - 24, true);
    this.text.setText(copy);
    const height = Math.max(72, this.text.height + 24);
    this.bg.setSize(this.panelWidth, height);
    this.setPosition(Math.min(x, 1280 - this.panelWidth - 14), Math.min(y, 720 - height - 14));
    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }
}
