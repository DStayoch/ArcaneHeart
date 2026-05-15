import Phaser from 'phaser';
import type { BuildSlotModel } from '../core/types';

export class BuildSlot extends Phaser.GameObjects.Container {
  readonly model: BuildSlotModel;
  private bg: Phaser.GameObjects.Rectangle;
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, model: BuildSlotModel) {
    super(scene, model.x, model.y);
    this.model = model;
    this.bg = scene.add.rectangle(0, 0, 92, 38, 0x21162d, 0.82).setStrokeStyle(2, 0x8267a6, 0.7);
    this.label = scene.add.text(0, 0, '+', { fontSize: '22px', color: '#eadcff' }).setOrigin(0.5);
    this.add([this.bg, this.label]);
    this.setSize(92, 38);
    this.setInteractive({ useHandCursor: true });
    scene.add.existing(this);
  }

  setRoomLabel(text: string, color: number) {
    this.model.roomId = this.model.roomId;
    this.bg.setFillStyle(color, 0.78).setStrokeStyle(2, 0xfff0bd, 0.9);
    this.label.setText(text).setColor('#120d18');
  }

  clearRoomLabel() {
    this.bg.setFillStyle(0x21162d, 0.82).setStrokeStyle(2, 0x8267a6, 0.7);
    this.label.setText('+').setColor('#eadcff');
  }

  setPreview(on: boolean) {
    this.bg.setStrokeStyle(on ? 3 : 2, on ? 0xffe28a : 0x8267a6, on ? 1 : 0.7);
  }
}
