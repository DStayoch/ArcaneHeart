import Phaser from 'phaser';
import { FLOOR_COUNT, FLOOR_HEIGHT, PATH_WIDTH, TOWER_TOP, TOWER_X } from '../core/constants';
import type { BuildSlotModel } from '../core/types';
import { BuildSlot } from '../entities/BuildSlot';
import { createSpirePath } from '../utils/path';

export class TowerMapSystem {
  readonly slots: BuildSlot[] = [];
  readonly path = createSpirePath();

  constructor(private scene: Phaser.Scene) {}

  create() {
    const g = this.scene.add.graphics();
    g.fillStyle(0x181020, 1).fillRoundedRect(350, 78, 540, 620, 16);
    g.lineStyle(3, 0x6f527d, 0.8).strokeRoundedRect(350, 78, 540, 620, 16);
    for (let floor = 0; floor < FLOOR_COUNT; floor += 1) {
      const y = TOWER_TOP + floor * FLOOR_HEIGHT;
      const tint = floor % 2 === 0 ? 0x241832 : 0x2b1d3c;
      g.fillStyle(tint, 0.96).fillRect(380, y, 480, FLOOR_HEIGHT - 5);
      g.lineStyle(1, 0x775e8e, 0.45).lineBetween(392, y + FLOOR_HEIGHT - 5, 848, y + FLOOR_HEIGHT - 5);
      this.scene.add.text(396, y + 18, `${FLOOR_COUNT - floor}`, { fontSize: '13px', color: '#bda7d6' });
      this.makeSlot({ id: `f${floor}-left`, floor, side: 'left', x: TOWER_X - 176, y: y + 28 });
      this.makeSlot({ id: `f${floor}-right`, floor, side: 'right', x: TOWER_X + 176, y: y + 28 });
    }
    this.drawPath(g);
    this.scene.add.text(TOWER_X, 68, 'ARCANE HEART', { fontSize: '17px', color: '#ffe9a4', fontStyle: 'bold' }).setOrigin(0.5);
    this.drawHeart(TOWER_X, 96);
  }

  getAdjacent(slot: BuildSlot) {
    return this.slots.filter((other) => other !== slot && Math.abs(other.model.floor - slot.model.floor) <= 1);
  }

  private makeSlot(model: BuildSlotModel) {
    const slot = new BuildSlot(this.scene, model);
    this.slots.push(slot);
  }

  private drawPath(g: Phaser.GameObjects.Graphics) {
    g.lineStyle(PATH_WIDTH, 0x120c17, 0.56);
    for (let i = 0; i < this.path.length - 1; i += 1) {
      g.lineBetween(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y);
    }
    g.lineStyle(5, 0xffde8a, 0.5);
    for (let i = 0; i < this.path.length - 1; i += 1) {
      g.lineBetween(this.path[i].x, this.path[i].y, this.path[i + 1].x, this.path[i + 1].y);
    }
  }

  private drawHeart(x: number, y: number) {
    const heart = this.scene.add.graphics();
    heart.fillStyle(0xff5da5, 0.95);
    heart.lineStyle(3, 0xffe9a4, 1);
    heart.beginPath();
    heart.moveTo(x, y + 18);
    heart.bezierCurveTo(x - 42, y - 8, x - 27, y - 34, x - 7, y - 22);
    heart.bezierCurveTo(x, y - 36, x + 27, y - 34, x + 7, y - 22);
    heart.bezierCurveTo(x + 27, y - 34, x + 42, y - 8, x, y + 18);
    heart.closePath();
    heart.fillPath();
    heart.strokePath();
    this.scene.add.circle(x - 7, y - 7, 4, 0xffc4db, 0.8);
    this.scene.add.circle(x + 8, y - 6, 3, 0xffc4db, 0.7);
  }
}
