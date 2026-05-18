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
  private sigilSignature = '';

  constructor(
    private scene: Phaser.Scene,
    private tooltip?: Tooltip,
    private fx?: VisualEffectsSystem,
    private onMerge?: (anchor: Room, contributors: Room[], combo: ComboDefinition) => void,
  ) {
    this.lines = scene.add.graphics().setDepth(20);
  }

  update(rooms: Room[]) {
    const active: ComboDefinition[] = [];
    const sigils: Array<{ combo: ComboDefinition; rooms: Room[]; color: number }> = [];
    this.lines.clear();
    const used = new Set<Room>();
    rooms.forEach((room) => room.setFusionRole(undefined, 'none'));
    rooms.filter((room) => room.fusedCombo).forEach((room) => {
      if (!room.fusedCombo) return;
      const color = room.fusedCombo.roomIds.length >= 3 ? 0xffaa4f : 0xbdf4ff;
      active.push(room.fusedCombo);
      used.add(room);
      room.setFusionRole(room.fusedCombo, 'anchor', color, room.homeX, room.homeY);
      sigils.push({ combo: room.fusedCombo, rooms: [room], color });
    });
    const orderedCombos = [...comboDefinitions].sort((a, b) => b.roomIds.length - a.roomIds.length);
    for (const combo of orderedCombos) {
      const fusionRooms = this.findFusionRooms(combo, rooms.filter((room) => !used.has(room) && !room.fusedCombo));
      if (fusionRooms) {
        active.push(combo);
        const color = combo.roomIds.length >= 3 ? 0xffaa4f : 0xbdf4ff;
        fusionRooms.forEach((room) => used.add(room));
        const [anchor, ...contributors] = fusionRooms;
        anchor.becomeFusedChild(combo, color);
        this.onMerge?.(anchor, contributors, combo);
        sigils.push({ combo, rooms: [anchor], color });
        if (!this.previous.has(combo.id)) this.fx?.fusionActivated(combo, fusionRooms);
      }
    }
    this.renderSigils(sigils);
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

  private findFusionRooms(combo: ComboDefinition, rooms: Room[]) {
    const candidates = combo.roomIds.map((id) => rooms.filter((room) => room.def.id === id && !room.mergedInto));
    if (candidates.some((set) => set.length === 0)) return undefined;
    const picked: Room[] = [];
    const search = (index: number): Room[] | undefined => {
      if (index >= candidates.length) return this.hasAdjacentChain(picked) ? [...picked] : undefined;
      for (const room of candidates[index]) {
        if (picked.includes(room)) continue;
        picked.push(room);
        const result = search(index + 1);
        if (result) return result;
        picked.pop();
      }
      return undefined;
    };
    return search(0);
  }

  private drawFusion(combo: ComboDefinition, rooms: Room[], color: number) {
    const center = this.mergedPosition(rooms);
    const sigil = this.scene.add.star(center.x, center.y, combo.roomIds.length >= 3 ? 8 : 6, 7, 15, color, 0.78).setStrokeStyle(2, 0xfff0bd, 0.9).setDepth(110);
    sigil.setInteractive({ useHandCursor: true });
    sigil.on('pointerover', () => this.tooltip?.show(center.x + 18, center.y - 38, `${combo.name}\n${combo.description}\n${combo.visual}`));
    sigil.on('pointerout', () => this.tooltip?.hide());
    this.scene.tweens.add({ targets: sigil, angle: 360, duration: 2400, repeat: -1 });
    this.sigils.push(sigil);
  }

  private renderSigils(entries: Array<{ combo: ComboDefinition; rooms: Room[]; color: number }>) {
    const signature = entries
      .map((entry) => `${entry.combo.id}:${entry.rooms.map((room) => room.id).join(',')}:${entry.color}`)
      .join('|');
    if (signature === this.sigilSignature) return;
    this.sigils.forEach((sigil) => sigil.destroy());
    this.sigils = [];
    this.sigilSignature = signature;
    entries.forEach((entry) => this.drawFusion(entry.combo, entry.rooms, entry.color));
  }

  private mergedPosition(rooms: Room[]) {
    return rooms.reduce((acc, room) => ({ x: acc.x + room.homeX / rooms.length, y: acc.y + room.homeY / rooms.length }), { x: 0, y: 0 });
  }
}
