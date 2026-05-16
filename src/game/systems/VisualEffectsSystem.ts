import Phaser from 'phaser';
import type { ComboDefinition } from '../core/types';
import type { Enemy } from '../entities/Enemy';
import type { Room } from '../entities/Room';

export class VisualEffectsSystem {
  constructor(private scene: Phaser.Scene) {}

  enemyKilled(enemy: Enemy, mana: number) {
    const color = enemy.def.color;
    for (let i = 0; i < 12; i += 1) {
      const shard = this.scene.add.circle(enemy.x, enemy.y, Phaser.Math.Between(2, 5), i % 3 === 0 ? 0xfff0bd : color, 0.95).setDepth(180);
      this.scene.tweens.add({
        targets: shard,
        x: enemy.x + Phaser.Math.Between(-38, 38),
        y: enemy.y + Phaser.Math.Between(-34, 34),
        alpha: 0,
        scale: 0.2,
        duration: 360,
        ease: 'Cubic.easeOut',
        onComplete: () => shard.destroy(),
      });
    }
    const text = this.scene.add.text(enemy.x, enemy.y - 22, `+${mana}`, { fontSize: '14px', color: '#77f0c2', fontStyle: 'bold' }).setOrigin(0.5).setDepth(190);
    this.scene.tweens.add({ targets: text, y: text.y - 28, alpha: 0, duration: 650, onComplete: () => text.destroy() });
    for (let i = 0; i < 4; i += 1) {
      const wisp = this.scene.add.circle(enemy.x, enemy.y, 4, 0x77f0c2, 0.9).setDepth(185);
      this.scene.tweens.add({
        targets: wisp,
        x: 210 + Phaser.Math.Between(-12, 18),
        y: 25 + Phaser.Math.Between(-8, 8),
        alpha: 0,
        duration: 540 + i * 70,
        ease: 'Sine.easeIn',
        onComplete: () => wisp.destroy(),
      });
    }
  }

  roomUpgraded(room: Room) {
    const burst = this.scene.add.circle(room.x, room.y, 24, room.def.color, 0.24).setStrokeStyle(3, 0xfff0bd, 1).setDepth(120);
    this.scene.tweens.add({ targets: burst, scale: 2.3, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => burst.destroy() });
    const text = this.scene.add.text(room.x, room.y - 34, `Level ${room.level}`, { fontSize: '13px', color: '#fff0bd', fontStyle: 'bold' }).setOrigin(0.5).setDepth(130);
    this.scene.tweens.add({ targets: text, y: text.y - 22, alpha: 0, duration: 720, onComplete: () => text.destroy() });
    for (let i = 0; i < 8; i += 1) {
      const spark = this.scene.add.star(room.x, room.y, 5, 2, 5, i % 2 ? 0xffffff : room.def.color, 0.95).setDepth(125);
      this.scene.tweens.add({
        targets: spark,
        x: room.x + Phaser.Math.Between(-45, 45),
        y: room.y + Phaser.Math.Between(-28, 28),
        angle: Phaser.Math.Between(80, 240),
        alpha: 0,
        duration: 520,
        onComplete: () => spark.destroy(),
      });
    }
  }

  fusionActivated(combo: ComboDefinition, rooms: Room[]) {
    const center = rooms.reduce((acc, room) => ({ x: acc.x + room.x / rooms.length, y: acc.y + room.y / rooms.length }), { x: 0, y: 0 });
    const sigil = this.scene.add.star(center.x, center.y, combo.roomIds.length >= 3 ? 8 : 6, 10, 24, combo.roomIds.length >= 3 ? 0xffaa4f : 0xbdf4ff, 0.35).setStrokeStyle(2, 0xfff0bd, 0.95).setDepth(95);
    const label = this.scene.add.text(center.x, center.y - 38, `Fusion: ${combo.name}`, { fontSize: '15px', color: '#fff0bd', fontStyle: 'bold' }).setOrigin(0.5).setDepth(150);
    this.scene.tweens.add({ targets: sigil, scale: 2.4, angle: 180, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => sigil.destroy() });
    this.scene.tweens.add({ targets: label, y: label.y - 18, alpha: 0, duration: 1200, onComplete: () => label.destroy() });
  }
}
