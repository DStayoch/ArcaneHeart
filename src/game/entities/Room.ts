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
  private model: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, roomId: RoomId, slotId: string, floor: number, x: number, y: number) {
    super(scene, x, y);
    this.id = `${roomId}-${slotId}`;
    this.def = roomDefinitions[roomId];
    this.slotId = slotId;
    this.floor = floor;
    this.bg = scene.add.rectangle(0, 0, 92, 38, this.def.color, 0.92).setStrokeStyle(2, 0xfff0bd, 0.9);
    this.model = this.createModel();
    this.text = scene.add.text(34, 10, `Lv ${this.level}`, { fontSize: '10px', color: '#130d18', fontStyle: 'bold' }).setOrigin(0.5);
    this.add([this.bg, this.model, this.text]);
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
    this.text.setText(`Lv ${this.level}`);
    this.scene.tweens.add({ targets: this, scaleX: 1.12, scaleY: 1.12, yoyo: true, duration: 120 });
  }

  private createModel() {
    const c = this.scene.add.container(-16, 0);
    const g = this.scene.add.graphics();
    c.add(g);
    switch (this.def.id) {
      case 'root_library':
        c.add(this.scene.add.rectangle(-8, 0, 18, 24, 0x7b4d2e, 1).setStrokeStyle(1, 0x2b1a10));
        c.add(this.scene.add.rectangle(8, 0, 18, 24, 0x3f6b3e, 1).setStrokeStyle(1, 0x172617));
        g.lineStyle(2, 0x95e784, 1).lineBetween(-13, 10, -4, -3).lineBetween(-4, -3, 10, -11).lineBetween(-1, 8, 9, 1);
        break;
      case 'fire_imp_kitchen':
        c.add(this.scene.add.ellipse(0, 4, 30, 17, 0x3b2a28, 1).setStrokeStyle(2, 0xffc36b));
        c.add(this.scene.add.triangle(-7, -4, -8, 7, 0, -11, 8, 7, 0xff7438, 1));
        c.add(this.scene.add.circle(10, -7, 4, 0xffd36b));
        g.lineStyle(2, 0x5e1b10, 1).lineBetween(10, -3, 14, 2);
        break;
      case 'moon_bell':
        c.add(this.scene.add.ellipse(0, 0, 24, 27, 0xdfe8ff, 1).setStrokeStyle(2, 0x6477a0));
        c.add(this.scene.add.circle(0, 13, 3, 0xfff0bd));
        g.lineStyle(2, 0xaebdff, 0.9).strokeCircle(0, 0, 20);
        break;
      case 'mirror_hatchery':
        c.add(this.scene.add.polygon(0, 0, [[0, -16], [16, 0], [0, 16], [-16, 0]], 0xbaf7ff, 1).setStrokeStyle(2, 0x227987));
        c.add(this.scene.add.circle(-8, 9, 5, 0xffd9fb));
        c.add(this.scene.add.circle(10, 8, 4, 0xd4fff8));
        g.lineStyle(1, 0xffffff, 0.9).lineBetween(-8, -4, 8, -12);
        break;
      case 'grave_moth_chapel':
        c.add(this.scene.add.rectangle(0, 4, 26, 22, 0x5b456d, 1).setStrokeStyle(2, 0xdac7ff));
        c.add(this.scene.add.triangle(0, -12, -16, 4, 0, -20, 16, 4, 0x2b2038, 1));
        c.add(this.scene.add.ellipse(-7, -1, 10, 6, 0xded4ff, 0.9));
        c.add(this.scene.add.ellipse(7, -1, 10, 6, 0xded4ff, 0.9));
        break;
      case 'clockwork_orrery':
        c.add(this.scene.add.circle(0, 1, 13, 0xe4b85a, 1).setStrokeStyle(2, 0x513b18));
        c.add(this.scene.add.circle(-15, -7, 4, 0x8fc5ff));
        c.add(this.scene.add.circle(16, 8, 5, 0xff9070));
        g.lineStyle(2, 0x513b18, 1).strokeCircle(0, 1, 20).lineBetween(0, 1, 0, -9).lineBetween(0, 1, 8, 5);
        break;
      case 'storm_harp':
        g.lineStyle(3, 0x31568f, 1).lineBetween(-13, 13, -3, -15).lineBetween(-3, -15, 13, 12);
        g.lineStyle(1, 0xdbecff, 1).lineBetween(-8, 9, 0, -10).lineBetween(-2, 10, 4, -8).lineBetween(5, 10, 8, -3);
        c.add(this.scene.add.star(14, -9, 5, 2, 5, 0xfff68a, 1));
        break;
      case 'cauldron_nursery':
        c.add(this.scene.add.ellipse(0, 7, 32, 18, 0x2f574c, 1).setStrokeStyle(2, 0xa7ffcf));
        c.add(this.scene.add.rectangle(0, -1, 25, 8, 0x62d2a2, 1));
        c.add(this.scene.add.circle(-8, -11, 4, 0xd4ffe7, 0.9));
        c.add(this.scene.add.circle(4, -14, 3, 0xfff4a3, 0.9));
        c.add(this.scene.add.circle(13, -9, 3, 0xbfffe1, 0.9));
        break;
      default:
        c.add(this.scene.add.text(0, 0, this.def.icon, { fontSize: '18px', color: '#130d18', fontStyle: 'bold' }).setOrigin(0.5));
        break;
    }
    return c;
  }
}
