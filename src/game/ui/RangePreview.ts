import Phaser from 'phaser';
import type { Room } from '../entities/Room';

export class RangePreview {
  private circle: Phaser.GameObjects.Arc;

  constructor(private scene: Phaser.Scene) {
    this.circle = scene.add.circle(0, 0, 10, 0xbdf4ff, 0.06).setStrokeStyle(2, 0xffdf8f, 0.38).setDepth(18).setVisible(false);
  }

  show(room: Room) {
    this.circle.setPosition(room.x, room.y);
    this.circle.setRadius(room.range());
    this.circle.setVisible(true);
    this.scene.tweens.add({ targets: this.circle, alpha: 0.14, duration: 180, yoyo: true });
  }

  hide() {
    this.circle.setVisible(false);
  }
}
