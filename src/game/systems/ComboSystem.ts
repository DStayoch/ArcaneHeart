import Phaser from 'phaser';
import { comboDefinitions } from '../data/combos';
import type { ComboDefinition } from '../core/types';
import type { Room } from '../entities/Room';
import type { Tooltip } from '../ui/Tooltip';
import type { VisualEffectsSystem } from './VisualEffectsSystem';

export class ComboSystem {
  private lines: Phaser.GameObjects.Graphics;
  private sigils: Phaser.GameObjects.GameObject[] = [];
  private previous = new Set<string>();

  constructor(private scene: Phaser.Scene, private tooltip?: Tooltip, private fx?: VisualEffectsSystem) {
    this.lines = scene.add.graphics().setDepth(20);
  }

  update(rooms: Room[]) {
    const active: ComboDefinition[] = [];
    this.lines.clear();
    this.sigils.forEach((sigil) => sigil.destroy());
    this.sigils = [];
    rooms.forEach((room) => room.setFusionActive(false));
    for (const combo of comboDefinitions) {
      const matched = combo.roomIds.map((id) => rooms.filter((room) => room.def.id === id));
      if (matched.every((set) => set.length > 0) && this.hasAdjacentChain(matched.flat())) {
        active.push(combo);
        const color = combo.roomIds.length >= 3 ? 0xffaa4f : 0xbdf4ff;
        const fusionRooms = matched.flat();
        fusionRooms.forEach((room) => room.setFusionActive(true, color));
        this.drawFusion(combo, fusionRooms, color);
        if (!this.previous.has(combo.id)) this.fx?.fusionActivated(combo, fusionRooms);
      }
    }
    this.previous = new Set(active.map((combo) => combo.id));
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

  private drawFusion(combo: ComboDefinition, rooms: Room[], color: number) {
    this.lines.lineStyle(5, color, 0.42);
    for (let i = 0; i < rooms.length - 1; i += 1) {
      this.lines.lineBetween(rooms[i].x, rooms[i].y, rooms[i + 1].x, rooms[i + 1].y);
    }
    const center = rooms.reduce((acc, room) => ({ x: acc.x + room.x / rooms.length, y: acc.y + room.y / rooms.length }), { x: 0, y: 0 });
    const sigil = this.scene.add.star(center.x, center.y, combo.roomIds.length >= 3 ? 8 : 6, 7, 15, color, 0.78).setStrokeStyle(2, 0xfff0bd, 0.9).setDepth(110);
    sigil.setInteractive({ useHandCursor: true });
    sigil.on('pointerover', () => this.tooltip?.show(center.x + 18, center.y - 38, `${combo.name}\n${combo.description}\n${combo.visual}`));
    sigil.on('pointerout', () => this.tooltip?.hide());
    this.scene.tweens.add({ targets: sigil, angle: 360, duration: 2400, repeat: -1 });
    this.sigils.push(sigil);
  }
}
