import Phaser from 'phaser';
import { roomDefinitions } from '../data/rooms';
import type { RoomDefinition, RoomId, TargetPriority } from '../core/types';

export class Room extends Phaser.GameObjects.Container {
  readonly id: string;
  readonly def: RoomDefinition;
  level = 1;
  priority: TargetPriority = 'first';
  cooldownRemaining = 0;
  slotId: string;
  floor: number;
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, roomId: RoomId, slotId: string, floor: number, x: number, y: number) {
    super(scene, x, y);
    this.id = `${roomId}-${slotId}`;
    this.def = roomDefinitions[roomId];
    this.slotId = slotId;
    this.floor = floor;
    this.bg = scene.add.rectangle(0, 0, 92, 38, this.def.color, 0.92).setStrokeStyle(2, 0xfff0bd, 0.9);
    this.text = scene.add.text(0, 0, `${this.def.icon} 1`, { fontSize: '15px', color: '#130d18', fontStyle: 'bold' }).setOrigin(0.5);
    this.add([this.bg, this.text]);
    this.setSize(92, 38);
    this.setInteractive({ useHandCursor: true });
    scene.add.existing(this);
  }

  damage() {
    return this.def.baseDamage * (this.level === 1 ? 1 : this.level === 2 ? 1.3 : 1.6);
  }

  range() {
    return this.def.range * (this.def.tags.includes('Storm') || this.def.tags.includes('Moon') ? 1.03 : 1);
  }

  cooldown() {
    const supportBoost = this.level === 3 ? 0.86 : 1;
    return this.def.cooldownMs * supportBoost;
  }

  upgradeCost() {
    return Math.round(this.def.cost * (this.level === 1 ? 0.7 : 1.2));
  }

  sellValue() {
    return Math.round(this.def.cost * 0.55 + (this.level - 1) * this.def.cost * 0.25);
  }

  upgrade() {
    if (this.level >= 3) return;
    this.level += 1;
    this.text.setText(`${this.def.icon} ${this.level}`);
    this.scene.tweens.add({ targets: this, scaleX: 1.12, scaleY: 1.12, yoyo: true, duration: 120 });
  }
}
