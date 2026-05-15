import Phaser from 'phaser';
import type { BuildSlot } from '../entities/BuildSlot';
import { Room } from '../entities/Room';
import type { RoomId } from '../core/types';
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

  private ping(x: number, y: number, color: number) {
    const ring = this.scene.add.circle(x, y, 20, color, 0.2).setStrokeStyle(2, color, 0.9);
    this.scene.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 420, onComplete: () => ring.destroy() });
  }
}
