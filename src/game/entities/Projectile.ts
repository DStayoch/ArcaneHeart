import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { Room } from './Room';
import { distance } from '../utils/math';

export class Projectile extends Phaser.GameObjects.Arc {
  readonly source: Room;
  readonly target: Enemy;
  readonly damage: number;
  readonly splashRadius: number;
  speed: number;

  constructor(scene: Phaser.Scene, source: Room, target: Enemy, damage: number, color: number, splashRadius = 0, speed = 420) {
    super(scene, source.x, source.y, 5, 0, 360, false, color, 1);
    this.source = source;
    this.target = target;
    this.damage = damage;
    this.splashRadius = splashRadius;
    this.speed = speed;
    scene.add.existing(this);
  }

  updateProjectile(deltaMs: number) {
    if (!this.active || !this.target.alive) {
      this.destroy();
      return false;
    }
    const dist = distance(this, this.target);
    if (dist < 10) return true;
    const step = Math.min(dist, this.speed * deltaMs / 1000);
    this.x += ((this.target.x - this.x) / dist) * step;
    this.y += ((this.target.y - this.y) / dist) * step;
    return false;
  }
}
