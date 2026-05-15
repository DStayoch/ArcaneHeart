import Phaser from 'phaser';
import { enemyDefinitions } from '../data/enemies';
import type { EnemyDefinition, EnemyId, StatusId } from '../core/types';
import type { PathPoint } from '../utils/path';
import { getPointAtProgress } from '../utils/path';
import { clamp } from '../utils/math';

interface StatusState {
  id: StatusId;
  remaining: number;
  power: number;
}

export class Enemy extends Phaser.GameObjects.Container {
  readonly def: EnemyDefinition;
  hp: number;
  maxHp: number;
  progress = 0;
  alive = true;
  hitMemory = new Map<string, number>();
  private body: Phaser.GameObjects.Ellipse;
  private label: Phaser.GameObjects.Text;
  private bar: Phaser.GameObjects.Rectangle;
  private statuses = new Map<StatusId, StatusState>();
  private path: PathPoint[];
  private elite: boolean;

  constructor(scene: Phaser.Scene, enemyId: EnemyId, path: PathPoint[], elite = false) {
    const start = path[0];
    super(scene, start.x, start.y);
    this.def = enemyDefinitions[enemyId];
    this.path = path;
    this.elite = elite;
    this.maxHp = this.def.hp * (elite ? 1.55 : 1);
    this.hp = this.maxHp;
    const radius = this.def.boss ? 22 : elite ? 17 : 13;
    this.body = scene.add.ellipse(0, 0, radius * 2, radius * 2, this.def.color, 0.95).setStrokeStyle(2, 0xf7e3ab);
    this.label = scene.add.text(0, -1, this.def.icon, { fontSize: this.def.boss ? '18px' : '13px', color: '#fff9e5', fontStyle: 'bold' }).setOrigin(0.5);
    this.bar = scene.add.rectangle(0, radius + 6, radius * 2, 4, 0x5eff9a).setOrigin(0.5);
    this.add([this.body, this.label, this.bar]);
    scene.add.existing(this);
  }

  updateEnemy(deltaMs: number, speedMultiplier: number) {
    if (!this.alive) return;
    this.tickStatuses(deltaMs);
    const slow = Math.max(this.getStatusPower('snared'), this.getStatusPower('chilled'));
    const dazed = this.getStatusPower('dazed');
    const mutationDrag = 1;
    const speed = this.def.speed * (1 - slow) * (1 - dazed) * mutationDrag;
    this.progress += (speed * speedMultiplier * deltaMs) / 1000 / 620;
    const point = getPointAtProgress(this.path, this.progress);
    this.setPosition(point.x, point.y);
    this.bar.width = Math.max(1, (this.hp / this.maxHp) * (this.def.boss ? 44 : this.elite ? 34 : 26));
    this.setDepth(50 + this.progress * 100);
  }

  applyDamage(amount: number, sourceTags: string[] = [], sourceId = 'unknown') {
    if (!this.alive) return 0;
    const repeatedHits = this.hitMemory.get(sourceId) ?? 0;
    this.hitMemory.set(sourceId, repeatedHits + 1);
    let multiplier = 1;
    if (sourceTags.includes('Fire') && this.def.fireResist) multiplier *= this.def.fireResist;
    if (sourceTags.includes('Shadow') && this.def.shadowWeak) multiplier *= this.def.shadowWeak;
    if (this.hasStatus('frail')) multiplier *= 1.28;
    if (this.hasStatus('marked')) multiplier *= 1.18;
    const collectorArmor = this.def.id === 'curse_collector' ? Math.floor(repeatedHits / 3) : 0;
    const final = Math.max(1, amount * multiplier - (this.def.armor ?? 0) - collectorArmor);
    this.hp -= final;
    this.scene.tweens.add({ targets: this.body, scaleX: 1.25, scaleY: 1.25, yoyo: true, duration: 70 });
    if (this.hp <= 0) this.alive = false;
    return final;
  }

  applyStatus(id: StatusId, durationMs: number, power: number) {
    const existing = this.statuses.get(id);
    this.statuses.set(id, { id, remaining: Math.max(existing?.remaining ?? 0, durationMs), power: Math.max(existing?.power ?? 0, power) });
    this.body.setStrokeStyle(2, this.statusColor(), 1);
  }

  rewind(amount: number) {
    this.progress = clamp(this.progress - amount, 0, 1);
  }

  hasReachedHeart() {
    return this.progress >= 1;
  }

  hasStatus(id: StatusId) {
    return this.statuses.has(id);
  }

  getStatusPower(id: StatusId) {
    return this.statuses.get(id)?.power ?? 0;
  }

  currentFloor() {
    return getPointAtProgress(this.path, this.progress).floor;
  }

  private tickStatuses(deltaMs: number) {
    this.statuses.forEach((status, id) => {
      status.remaining -= deltaMs;
      if (id === 'burning') this.applyDamage(status.power * deltaMs / 1000, ['Fire'], 'burning');
      if (status.remaining <= 0) this.statuses.delete(id);
    });
    if (this.statuses.size === 0) this.body.setStrokeStyle(2, 0xf7e3ab);
  }

  private statusColor() {
    if (this.hasStatus('burning')) return 0xff7b2d;
    if (this.hasStatus('snared')) return 0x80ff8a;
    if (this.hasStatus('frail')) return 0xd6b5ff;
    if (this.hasStatus('marked')) return 0xffe577;
    return 0xf7e3ab;
  }
}
