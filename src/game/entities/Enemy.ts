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
  private speedScale: number;

  constructor(scene: Phaser.Scene, enemyId: EnemyId, path: PathPoint[], elite = false, healthScale = 1, speedScale = 1) {
    const start = path[0];
    super(scene, start.x, start.y);
    this.def = enemyDefinitions[enemyId];
    this.path = path;
    this.elite = elite;
    this.speedScale = speedScale;
    this.maxHp = this.def.hp * healthScale * (elite ? 1.75 : 1);
    this.hp = this.maxHp;
    const radius = this.def.boss ? 22 : elite ? 17 : 13;
    this.body = scene.add.ellipse(0, 0, radius * 2, radius * 2, this.def.color, 0.95).setStrokeStyle(2, 0xf7e3ab);
    const details = this.createModel(radius);
    this.label = scene.add.text(0, radius + 13, this.def.icon, { fontSize: this.def.boss ? '12px' : '10px', color: '#fff9e5', fontStyle: 'bold' }).setOrigin(0.5);
    this.bar = scene.add.rectangle(0, radius + 6, radius * 2, 4, 0x5eff9a).setOrigin(0.5);
    this.add([this.body, details, this.label, this.bar]);
    scene.add.existing(this);
  }

  updateEnemy(deltaMs: number, speedMultiplier: number) {
    if (!this.alive) return;
    this.tickStatuses(deltaMs);
    const slow = Math.max(this.getStatusPower('snared'), this.getStatusPower('chilled'));
    const dazed = this.getStatusPower('dazed');
    const mutationDrag = 1;
    const speed = this.def.speed * this.speedScale * (1 - slow) * (1 - dazed) * mutationDrag;
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

  private createModel(radius: number) {
    const c = this.scene.add.container(0, 0);
    const g = this.scene.add.graphics();
    c.add(g);
    switch (this.def.id) {
      case 'scribble_goblin':
        g.lineStyle(2, 0x1d3218, 1);
        g.strokeCircle(-4, -4, 4).strokeCircle(5, -5, 3);
        g.lineBetween(-8, 3, 8, -1).lineBetween(-5, 7, 1, 1).lineBetween(4, 7, 8, 1);
        c.add(this.scene.add.triangle(-8, -11, 0, 0, 8, 4, 3, 10, 0x8ee068, 1));
        c.add(this.scene.add.circle(4, -3, 2, 0x101010));
        break;
      case 'candle_knight':
        c.add(this.scene.add.rectangle(0, 0, radius * 1.2, radius * 1.45, 0xffdc78, 1).setStrokeStyle(1, 0x6f4a21));
        c.add(this.scene.add.triangle(0, -radius - 5, -5, 4, 0, -8, 5, 4, 0xff713b, 1));
        c.add(this.scene.add.rectangle(0, 3, radius * 0.9, 4, 0x7a522a, 1));
        break;
      case 'gloom_slime':
        g.fillStyle(0x596890, 0.95).fillEllipse(0, 4, radius * 1.8, radius * 1.25);
        g.fillStyle(0x26304a, 0.9).fillCircle(-4, 1, 2).fillCircle(5, 0, 2);
        g.lineStyle(2, 0x9bb1e8, 0.8).lineBetween(-8, -6, -1, -11).lineBetween(3, -8, 9, -13);
        break;
      case 'winged_inkling':
        c.add(this.scene.add.triangle(-10, 0, 0, 0, -16, -8, -5, 8, 0x171225, 1));
        c.add(this.scene.add.triangle(10, 0, 0, 0, 16, -8, 5, 8, 0x171225, 1));
        c.add(this.scene.add.ellipse(0, 1, radius * 0.95, radius * 1.35, 0x2c2446, 1).setStrokeStyle(1, 0x8974d0));
        c.add(this.scene.add.circle(-3, -2, 2, 0xd7ceff));
        c.add(this.scene.add.circle(3, -2, 2, 0xd7ceff));
        break;
      case 'clockwork_wyvern':
        c.add(this.scene.add.polygon(0, 0, [[-13, 4], [-3, -9], [12, -2], [7, 8]], 0xb08b59, 1).setStrokeStyle(1, 0x332618));
        c.add(this.scene.add.circle(-3, 0, 5, 0xead08d).setStrokeStyle(1, 0x332618));
        c.add(this.scene.add.triangle(10, -6, 0, 0, 12, -10, 18, -2, 0x87683d, 1));
        g.lineStyle(2, 0x43321d, 1).strokeCircle(-3, 0, 7).lineBetween(-3, -7, -3, -11);
        break;
      case 'curse_collector':
        c.add(this.scene.add.rectangle(0, 1, radius * 1.3, radius * 1.35, 0x9bdbd1, 1).setStrokeStyle(1, 0x21443f));
        c.add(this.scene.add.rectangle(0, -7, radius * 1.45, 5, 0x21443f, 1));
        c.add(this.scene.add.text(0, 2, '$', { fontSize: '13px', color: '#11302c', fontStyle: 'bold' }).setOrigin(0.5));
        break;
      case 'page_eater':
        g.fillStyle(0xd95f9d, 1).fillRoundedRect(-24, -13, 48, 26, 11);
        g.fillStyle(0xffc5de, 1).fillTriangle(16, -8, 25, 0, 16, 8);
        g.lineStyle(2, 0x4a1830, 1).lineBetween(-14, -8, -5, 8).lineBetween(-1, -9, 7, 9).lineBetween(11, -7, 17, 7);
        c.add(this.scene.add.circle(-16, -4, 3, 0xfff2ad));
        break;
      default:
        break;
    }
    if (this.elite) c.add(this.scene.add.star(0, -radius - 9, 5, 4, 8, 0xfff08a, 1));
    return c;
  }
}
