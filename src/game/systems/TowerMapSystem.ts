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
    this.drawBackgroundSpire();
    this.scene.add.rectangle(TOWER_X, 388, 258, 620, 0x181020, 1).setStrokeStyle(3, 0x6f527d, 0.8);
    for (let floor = 0; floor < FLOOR_COUNT; floor += 1) {
      const y = TOWER_TOP + floor * FLOOR_HEIGHT;
      const tint = floor % 2 === 0 ? 0x241832 : 0x2b1d3c;
      g.fillStyle(tint, 0.96).fillRect(TOWER_X - 120, y, 240, FLOOR_HEIGHT - 5);
      g.lineStyle(1, 0x775e8e, 0.45).lineBetween(TOWER_X - 110, y + FLOOR_HEIGHT - 5, TOWER_X + 110, y + FLOOR_HEIGHT - 5);
      this.scene.add.text(TOWER_X - 112, y + 18, `${FLOOR_COUNT - floor}`, { fontSize: '13px', color: '#bda7d6' });
      this.drawSideBridge(g, TOWER_X - 252, y + 28, TOWER_X - 122, y + 28);
      this.drawSideBridge(g, TOWER_X + 122, y + 28, TOWER_X + 252, y + 28);
      this.makeSlot({ id: `f${floor}-left`, floor, side: 'left', x: TOWER_X - 294, y: y + 28 });
      this.makeSlot({ id: `f${floor}-right`, floor, side: 'right', x: TOWER_X + 294, y: y + 28 });
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
    g.lineStyle(2, 0xfff0bd, 0.42);
    for (let i = 0; i < this.path.length - 1; i += 1) {
      const a = this.path[i];
      const b = this.path[i + 1];
      for (let step = 1; step <= 4; step += 1) {
        const t = step / 5;
        const x = Phaser.Math.Linear(a.x, b.x, t);
        const y = Phaser.Math.Linear(a.y, b.y, t);
        g.lineBetween(x - 18, y, x + 18, y - 5);
      }
    }
  }

  private drawSideBridge(g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number) {
    g.lineStyle(2, 0x6f527d, 0.5).lineBetween(x1, y1, x2, y2);
    g.lineStyle(1, 0xffde8a, 0.22).lineBetween(x1, y1 - 5, x2, y2 - 5);
  }

  private drawBackgroundSpire() {
    const bg = this.scene.add.graphics().setDepth(-10);
    bg.fillStyle(0x2a1738, 0.22);
    bg.fillTriangle(TOWER_X, 12, 278, 700, 962, 700);
    bg.fillStyle(0x3a214d, 0.18);
    bg.fillRoundedRect(440, 86, 360, 630, 28);
    bg.lineStyle(4, 0xb38ddb, 0.12);
    bg.strokeRoundedRect(440, 86, 360, 630, 28);

    bg.fillStyle(0xffd98f, 0.12);
    for (let i = 0; i < 9; i += 1) {
      const y = 135 + i * 58;
      bg.fillRoundedRect(328, y, 34, 22, 12);
      bg.fillRoundedRect(878, y + 18, 34, 22, 12);
    }

    bg.lineStyle(5, 0x6aaa67, 0.12);
    bg.beginPath();
    bg.moveTo(322, 702);
    bg.lineTo(382, 610);
    bg.lineTo(350, 530);
    bg.lineTo(414, 450);
    bg.strokePath();
    bg.beginPath();
    bg.moveTo(918, 704);
    bg.lineTo(850, 620);
    bg.lineTo(882, 548);
    bg.lineTo(812, 468);
    bg.strokePath();

    this.scene.add.circle(TOWER_X, 74, 58, 0xff5da5, 0.1).setDepth(-9);
    this.scene.add.circle(TOWER_X, 74, 18, 0xffe9a4, 0.12).setDepth(-8);
  }

  private drawHeart(x: number, y: number) {
    const heart = this.scene.add.graphics().setDepth(12);
    const points = [
      new Phaser.Math.Vector2(x, y + 24),
      new Phaser.Math.Vector2(x - 34, y - 2),
      new Phaser.Math.Vector2(x - 27, y - 24),
      new Phaser.Math.Vector2(x - 8, y - 23),
      new Phaser.Math.Vector2(x, y - 12),
      new Phaser.Math.Vector2(x + 8, y - 23),
      new Phaser.Math.Vector2(x + 27, y - 24),
      new Phaser.Math.Vector2(x + 34, y - 2),
    ];
    heart.fillStyle(0xff5da5, 0.96);
    heart.lineStyle(3, 0xffe9a4, 0.95);
    heart.fillPoints(points, true);
    heart.strokePoints(points, true);
    this.scene.add.circle(x - 10, y - 10, 4, 0xffc4db, 0.85).setDepth(13);
    this.scene.add.circle(x + 9, y - 9, 3, 0xffc4db, 0.72).setDepth(13);
  }
}
