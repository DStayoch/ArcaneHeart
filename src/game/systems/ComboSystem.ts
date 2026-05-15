import Phaser from 'phaser';
import { comboDefinitions } from '../data/combos';
import type { ComboDefinition } from '../core/types';
import type { Room } from '../entities/Room';

export class ComboSystem {
  private lines: Phaser.GameObjects.Graphics;

  constructor(private scene: Phaser.Scene) {
    this.lines = scene.add.graphics().setDepth(20);
  }

  update(rooms: Room[]) {
    const active: ComboDefinition[] = [];
    this.lines.clear();
    for (const combo of comboDefinitions) {
      const matched = combo.roomIds.map((id) => rooms.filter((room) => room.def.id === id));
      if (matched.every((set) => set.length > 0) && this.hasAdjacentChain(matched.flat())) {
        active.push(combo);
        this.drawCombo(matched.flat(), combo.roomIds.length >= 3 ? 0xffaa4f : 0xbdf4ff);
      }
    }
    return active;
  }

  private hasAdjacentChain(rooms: Room[]) {
    for (let a = 0; a < rooms.length; a += 1) {
      for (let b = a + 1; b < rooms.length; b += 1) {
        if (Math.abs(rooms[a].floor - rooms[b].floor) <= 1) return true;
      }
    }
    return rooms.length <= 1;
  }

  private drawCombo(rooms: Room[], color: number) {
    this.lines.lineStyle(3, color, 0.55);
    for (let i = 0; i < rooms.length - 1; i += 1) {
      this.lines.lineBetween(rooms[i].x, rooms[i].y, rooms[i + 1].x, rooms[i + 1].y);
    }
  }
}
