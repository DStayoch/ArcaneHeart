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
    this.scene.add.rectangle(TOWER_X, 388, 258, 620, 0x181020, 0.5).setStrokeStyle(3, 0x8d6ab0, 0.82);
    for (let floor = 0; floor < FLOOR_COUNT; floor += 1) {
      const y = TOWER_TOP + floor * FLOOR_HEIGHT;
      const tint = floor % 2 === 0 ? 0x241832 : 0x2b1d3c;
      g.fillStyle(tint, 0.72).fillRect(TOWER_X - 120, y, 240, FLOOR_HEIGHT - 5);
      g.lineStyle(1, 0x775e8e, 0.45).lineBetween(TOWER_X - 110, y + FLOOR_HEIGHT - 5, TOWER_X + 110, y + FLOOR_HEIGHT - 5);
      this.scene.add.text(TOWER_X - 112, y + 18, `${FLOOR_COUNT - floor}`, { fontSize: '13px', color: '#bda7d6' });
      this.drawSideBridge(g, TOWER_X - 164, y + 28, TOWER_X - 122, y + 28);
      this.drawSideBridge(g, TOWER_X + 122, y + 28, TOWER_X + 164, y + 28);
      this.makeSlot({ id: `f${floor}-left`, floor, side: 'left', x: TOWER_X - 140, y: y + 28 });
      this.makeSlot({ id: `f${floor}-right`, floor, side: 'right', x: TOWER_X + 140, y: y + 28 });
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
    const bg = this.scene.add.graphics().setDepth(-2);
    const stone = 0x412d5a;
    const stoneDark = 0x1b1128;
    const trim = 0xba91df;
    const gold = 0xffdf91;

    bg.fillStyle(0x07040b, 0.52).fillEllipse(TOWER_X, 696, 560, 76);

    // Far silhouette: makes the playable stair path feel like it sits inside an actual wizard tower.
    bg.fillStyle(0x11091a, 0.36);
    bg.fillRoundedRect(TOWER_X - 182, 248, 54, 410, 22);
    bg.fillRoundedRect(TOWER_X + 128, 248, 54, 410, 22);
    bg.fillTriangle(TOWER_X - 155, 174, TOWER_X - 208, 266, TOWER_X - 102, 266);
    bg.fillTriangle(TOWER_X + 155, 174, TOWER_X + 102, 266, TOWER_X + 208, 266);
    bg.fillRoundedRect(TOWER_X - 128, 150, 256, 540, 34);

    bg.fillStyle(stoneDark, 0.48).fillRoundedRect(TOWER_X - 118, 188, 236, 502, 24);
    bg.fillStyle(stone, 0.34).fillRoundedRect(TOWER_X - 92, 116, 184, 590, 30);
    bg.fillStyle(0x543d70, 0.3).fillRoundedRect(TOWER_X - 66, 72, 132, 194, 28);

    bg.fillStyle(0x26143a, 0.58).fillTriangle(TOWER_X, 8, TOWER_X - 112, 126, TOWER_X + 112, 126);
    bg.lineStyle(4, trim, 0.28);
    bg.lineBetween(TOWER_X, 8, TOWER_X - 112, 126);
    bg.lineBetween(TOWER_X, 8, TOWER_X + 112, 126);
    bg.lineStyle(2, gold, 0.18);
    for (let x = TOWER_X - 72; x <= TOWER_X + 72; x += 24) {
      bg.lineBetween(x, 50, x + 34, 122);
    }

    bg.fillStyle(0x271634, 0.4).fillRoundedRect(TOWER_X - 174, 300, 52, 340, 20);
    bg.fillRoundedRect(TOWER_X + 122, 300, 52, 340, 20);
    bg.fillStyle(0x21122e, 0.48).fillTriangle(TOWER_X - 148, 244, TOWER_X - 190, 316, TOWER_X - 106, 316);
    bg.fillTriangle(TOWER_X + 148, 244, TOWER_X + 106, 316, TOWER_X + 190, 316);

    bg.lineStyle(4, trim, 0.16);
    bg.lineBetween(TOWER_X - 122, 338, TOWER_X - 174, 388);
    bg.lineBetween(TOWER_X + 122, 338, TOWER_X + 174, 388);
    bg.lineBetween(TOWER_X - 122, 512, TOWER_X - 174, 570);
    bg.lineBetween(TOWER_X + 122, 512, TOWER_X + 174, 570);

    bg.lineStyle(2, 0xd9c2ff, 0.13);
    for (let y = 152; y < 664; y += 38) {
      const inset = y < 260 ? 54 : 82;
      bg.lineBetween(TOWER_X - inset, y, TOWER_X + inset, y + 8);
    }
    for (let y = 182; y < 654; y += 76) {
      bg.lineStyle(1, 0x0a0610, 0.16);
      bg.lineBetween(TOWER_X, y, TOWER_X, y + 38);
      bg.lineBetween(TOWER_X - 58, y + 14, TOWER_X - 58, y + 50);
      bg.lineBetween(TOWER_X + 58, y + 14, TOWER_X + 58, y + 50);
    }

    for (let i = 0; i < 8; i += 1) {
      const y = 156 + i * 58;
      this.drawWindow(bg, TOWER_X - 42, y, i % 2 === 0);
      this.drawWindow(bg, TOWER_X + 42, y + 24, i % 2 !== 0);
    }
    this.drawWindow(bg, TOWER_X - 150, 354, true);
    this.drawWindow(bg, TOWER_X + 150, 430, false);
    this.drawWindow(bg, TOWER_X - 150, 546, false);
    this.drawWindow(bg, TOWER_X + 150, 586, true);

    bg.fillStyle(0x8d2f66, 0.35).fillTriangle(TOWER_X - 98, 176, TOWER_X - 140, 238, TOWER_X - 98, 230);
    bg.fillStyle(0x2f7f72, 0.3).fillTriangle(TOWER_X + 98, 214, TOWER_X + 142, 278, TOWER_X + 98, 268);
    bg.lineStyle(2, gold, 0.22).lineBetween(TOWER_X - 98, 176, TOWER_X - 98, 230);
    bg.lineBetween(TOWER_X + 98, 214, TOWER_X + 98, 268);

    bg.lineStyle(5, 0x6aaa67, 0.2);
    bg.beginPath();
    bg.moveTo(TOWER_X - 92, 690);
    bg.lineTo(TOWER_X - 156, 612);
    bg.lineTo(TOWER_X - 118, 530);
    bg.lineTo(TOWER_X - 178, 438);
    bg.strokePath();
    bg.beginPath();
    bg.moveTo(TOWER_X + 92, 690);
    bg.lineTo(TOWER_X + 154, 620);
    bg.lineTo(TOWER_X + 118, 548);
    bg.lineTo(TOWER_X + 176, 462);
    bg.strokePath();

    bg.fillStyle(0x09050d, 0.36);
    bg.fillRoundedRect(TOWER_X - 28, 640, 56, 60, 26);
    bg.lineStyle(2, gold, 0.12).strokeRoundedRect(TOWER_X - 28, 640, 56, 60, 26);

    this.scene.add.circle(TOWER_X, 78, 78, 0xff5da5, 0.13).setDepth(-9);
    this.scene.add.circle(TOWER_X, 92, 27, 0xffe9a4, 0.17).setDepth(-8);
  }

  private drawWindow(bg: Phaser.GameObjects.Graphics, x: number, y: number, lit: boolean) {
    bg.fillStyle(lit ? 0xffd98f : 0x140d1e, lit ? 0.24 : 0.35);
    bg.fillRoundedRect(x - 12, y, 24, 34, 10);
    bg.fillStyle(0x09060d, 0.22).fillRect(x - 1, y + 4, 2, 26);
    bg.fillRect(x - 9, y + 17, 18, 2);
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
