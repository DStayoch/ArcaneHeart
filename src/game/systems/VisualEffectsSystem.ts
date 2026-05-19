import Phaser from 'phaser';
import type { ComboDefinition } from '../core/types';
import { comboDefinitions } from '../data/combos';
import type { Enemy } from '../entities/Enemy';
import type { Room } from '../entities/Room';

export class VisualEffectsSystem {
  constructor(private scene: Phaser.Scene) {}

  enemyKilled(enemy: Enemy, mana: number) {
    const color = enemy.def.color;
    const count = enemy.def.boss ? 28 : 12;
    if (enemy.def.boss) {
      const shock = this.scene.add.star(enemy.x, enemy.y, 10, 20, 58, color, 0.24).setStrokeStyle(4, 0xfff0bd, 0.9).setDepth(178);
      this.scene.tweens.add({ targets: shock, scale: 2.4, angle: 220, alpha: 0, duration: 920, ease: 'Cubic.easeOut', onComplete: () => shock.destroy() });
      this.scene.cameras.main.shake(180, 0.004);
    }
    for (let i = 0; i < count; i += 1) {
      const shard = this.scene.add.circle(enemy.x, enemy.y, Phaser.Math.Between(2, enemy.def.boss ? 7 : 5), i % 3 === 0 ? 0xfff0bd : color, 0.95).setDepth(180);
      this.scene.tweens.add({
        targets: shard,
        x: enemy.x + Phaser.Math.Between(enemy.def.boss ? -80 : -38, enemy.def.boss ? 80 : 38),
        y: enemy.y + Phaser.Math.Between(enemy.def.boss ? -64 : -34, enemy.def.boss ? 64 : 34),
        alpha: 0,
        scale: 0.2,
        duration: 360,
        ease: 'Cubic.easeOut',
        onComplete: () => shard.destroy(),
      });
    }
    const text = this.scene.add.text(enemy.x, enemy.y - 22, `+${Math.round(mana)}`, { fontSize: '14px', color: '#77f0c2', fontStyle: 'bold' }).setOrigin(0.5).setDepth(190);
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
    if (enemy.def.rewardEssence) {
      for (let i = 0; i < enemy.def.rewardEssence; i += 1) {
        const essence = this.scene.add.star(enemy.x, enemy.y, 6, 3, 8, 0xd8c0ff, 0.95).setDepth(186);
        this.scene.tweens.add({
          targets: essence,
          x: 340 + i * 10,
          y: 24,
          alpha: 0,
          angle: 180,
          duration: 720 + i * 80,
          ease: 'Sine.easeIn',
          onComplete: () => essence.destroy(),
        });
      }
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
    const sigil = this.scene.add.star(center.x, center.y, combo.roomIds.length >= 3 ? 8 : 6, 10, 24, combo.color, 0.35).setStrokeStyle(2, 0xfff0bd, 0.95).setDepth(95);
    const label = this.scene.add.text(center.x, center.y - 38, `Fusion: ${combo.name}`, { fontSize: '15px', color: '#fff0bd', fontStyle: 'bold' }).setOrigin(0.5).setDepth(150);
    this.scene.tweens.add({ targets: sigil, scale: 2.4, angle: 180, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => sigil.destroy() });
    this.scene.tweens.add({ targets: label, y: label.y - 18, alpha: 0, duration: 1200, onComplete: () => label.destroy() });
  }

  fusionCast(comboId: string, room: Room, targets: Enemy[]) {
    const color = this.fusionColor(comboId);
    const evolved = room.evolvedFusion;
    const ring = this.scene.add.circle(room.x, room.y, evolved ? 24 : 18, color, evolved ? 0.28 : 0.18).setStrokeStyle(evolved ? 5 : 3, evolved ? 0xfff0bd : color, 0.95).setDepth(140);
    this.scene.tweens.add({ targets: ring, scale: comboId === 'solar_orchard' ? evolved ? 6.8 : 5.4 : evolved ? 4.3 : 3.2, alpha: 0, duration: evolved ? 780 : 620, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    targets.slice(0, evolved ? 10 : 7).forEach((target, index) => {
      const beam = this.scene.add.graphics().setDepth(135);
      beam.lineStyle(evolved ? 5 : comboId === 'echo_lightning' ? 4 : 3, evolved ? 0xfff0bd : color, 0.85).lineBetween(room.x, room.y, target.x, target.y);
      this.scene.tweens.add({ targets: beam, alpha: 0, duration: (evolved ? 300 : 220) + index * 35, onComplete: () => beam.destroy() });
      this.spawnThemedBurst(comboId, target.x, target.y, color, index);
    });
  }

  fusionEvolved(room: Room) {
    const combo = room.fusedCombo;
    const color = combo ? this.fusionColor(combo.id) : 0xffe28a;
    const halo = this.scene.add.star(room.x, room.y, 10, 28, 62, 0xffe28a, 0.28).setStrokeStyle(4, color, 0.95).setDepth(210);
    const label = this.scene.add.text(room.x, room.y - 50, room.evolutionTitle(), { fontSize: '16px', color: '#fff0bd', fontStyle: 'bold' }).setOrigin(0.5).setDepth(220);
    this.scene.tweens.add({ targets: halo, scale: 2.1, angle: 220, alpha: 0, duration: 1100, ease: 'Cubic.easeOut', onComplete: () => halo.destroy() });
    this.scene.tweens.add({ targets: label, y: label.y - 20, alpha: 0, duration: 1400, onComplete: () => label.destroy() });
    for (let i = 0; i < 18; i += 1) {
      const spark = this.scene.add.star(room.x, room.y, 5, 2, 7, i % 3 === 0 ? 0xffffff : color, 0.95).setDepth(215);
      this.scene.tweens.add({
        targets: spark,
        x: room.x + Phaser.Math.Between(-78, 78),
        y: room.y + Phaser.Math.Between(-54, 54),
        angle: Phaser.Math.Between(90, 360),
        alpha: 0,
        scale: 0.25,
        duration: 760 + i * 16,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  private spawnThemedBurst(comboId: string, x: number, y: number, color: number, offset: number) {
    const count = comboId === 'solar_orchard' ? 9 : 5;
    for (let i = 0; i < count; i += 1) {
      const particle = comboId === 'lunar_brambles'
        ? this.scene.add.rectangle(x, y, 4, 14, color, 0.9).setRotation(Phaser.Math.FloatBetween(-1.2, 1.2))
        : comboId === 'funeral_chime'
          ? this.scene.add.ellipse(x, y, 10, 5, color, 0.82)
          : comboId === 'solar_orchard'
            ? this.scene.add.circle(x, y - 28, 5, i % 2 ? 0xffaa4f : 0xff5f68, 0.95)
            : this.scene.add.star(x, y, 5, 2, 5, color, 0.9);
      particle.setDepth(145);
      this.scene.tweens.add({
        targets: particle,
        x: x + Phaser.Math.Between(-34, 34),
        y: y + Phaser.Math.Between(-30, 24) + offset * 2,
        angle: Phaser.Math.Between(90, 360),
        alpha: 0,
        scale: comboId === 'solar_orchard' ? 1.8 : 0.35,
        duration: 420 + i * 18,
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  private fusionColor(comboId: string) {
    return comboDefinitions.find((combo) => combo.id === comboId)?.color ?? 0xffffff;
  }
}
