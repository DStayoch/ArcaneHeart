import Phaser from 'phaser';
import type { BuildSlot } from '../entities/BuildSlot';
import { Room } from '../entities/Room';
import type { RoomId } from '../core/types';
import type { ComboDefinition } from '../core/types';
import { roomDefinitions } from '../data/rooms';
import type { EconomySystem } from './EconomySystem';

export class BuildSystem {
  readonly rooms: Room[] = [];

  constructor(private scene: Phaser.Scene, private economy: EconomySystem) {}

  build(slot: BuildSlot, roomId: RoomId) {
    if (slot.model.roomId) return undefined;
    const def = roomDefinitions[roomId];
    if (!this.economy.spendMana(def.cost)) return undefined;
    slot.model.roomId = roomId;
    slot.setRoomLabel(def.icon, def.color);
    const room = new Room(this.scene, roomId, slot.model.id, slot.model.floor, slot.x, slot.y);
    this.rooms.push(room);
    this.ping(room.x, room.y, def.color);
    return room;
  }

  sell(room: Room, slots: BuildSlot[]) {
    this.economy.addMana(room.sellValue());
    const slot = slots.find((candidate) => candidate.model.id === room.slotId);
    if (slot) {
      slot.model.roomId = undefined;
      slot.clearRoomLabel();
    }
    this.rooms.splice(this.rooms.indexOf(room), 1);
    room.destroy();
  }

  upgrade(room: Room) {
    if (room.level >= 3) return false;
    const cost = room.upgradeCost();
    if (!this.economy.spendMana(cost)) return false;
    room.upgrade();
    this.ping(room.x, room.y, 0xffe8a5);
    return true;
  }

  moveRoom(room: Room, targetSlot: BuildSlot, slots: BuildSlot[]) {
    if (targetSlot.model.roomId && targetSlot.model.id !== room.slotId) return false;
    const oldSlot = slots.find((candidate) => candidate.model.id === room.slotId);
    if (oldSlot) {
      oldSlot.model.roomId = undefined;
      oldSlot.clearRoomLabel();
    }
    targetSlot.model.roomId = room.def.id;
    targetSlot.setRoomLabel(room.def.icon, room.def.color);
    room.slotId = targetSlot.model.id;
    room.floor = targetSlot.model.floor;
    room.homeX = targetSlot.x;
    room.homeY = targetSlot.y;
    this.scene.tweens.add({ targets: room, x: targetSlot.x, y: targetSlot.y, duration: 170, ease: 'Sine.easeOut' });
    this.ping(targetSlot.x, targetSlot.y, room.def.color);
    return true;
  }

  consumeFusion(anchor: Room, contributors: Room[], combo: ComboDefinition, slots: BuildSlot[]) {
    contributors.forEach((room) => {
      const slot = slots.find((candidate) => candidate.model.id === room.slotId);
      if (slot) {
        slot.model.roomId = undefined;
        slot.clearRoomLabel();
      }
      const index = this.rooms.indexOf(room);
      if (index >= 0) this.rooms.splice(index, 1);
      room.destroy();
    });
    anchor.becomeFusedChild(combo, combo.roomIds.length >= 3 ? 0xffaa4f : 0xbdf4ff);
    this.ping(anchor.homeX, anchor.homeY, combo.roomIds.length >= 3 ? 0xffaa4f : 0xbdf4ff);
  }

  private ping(x: number, y: number, color: number) {
    const ring = this.scene.add.circle(x, y, 20, color, 0.2).setStrokeStyle(2, color, 0.9);
    this.scene.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 420, onComplete: () => ring.destroy() });
  }
}
