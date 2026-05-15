import Phaser from 'phaser';

export class Tooltip extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.bg = scene.add.rectangle(0, 0, 300, 92, 0x0f0916, 0.94).setOrigin(0).setStrokeStyle(1, 0xe7c982, 0.8);
    this.text = scene.add.text(12, 10, '', { fontSize: '13px', color: '#fff2ca', wordWrap: { width: 276 }, lineSpacing: 3 });
    this.add([this.bg, this.text]);
    this.setDepth(500).setVisible(false);
    scene.add.existing(this);
  }

  show(x: number, y: number, copy: string) {
    this.setPosition(Math.min(x, 970), Math.min(y, 610));
    this.text.setText(copy);
    this.bg.height = Math.max(72, this.text.height + 22);
    this.setVisible(true);
  }

  hide() {
    this.setVisible(false);
  }
}
