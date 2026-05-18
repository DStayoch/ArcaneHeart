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
  private armorScale: number;

  constructor(scene: Phaser.Scene, enemyId: EnemyId, path: PathPoint[], elite = false, healthScale = 1, speedScale = 1, armorScale = 0) {
    const start = path[0];
    super(scene, start.x, start.y);
    this.def = enemyDefinitions[enemyId];
    this.path = path;
    this.elite = elite;
    this.speedScale = speedScale;
    this.armorScale = armorScale;
    this.maxHp = this.def.hp * healthScale * (elite ? 1.75 : 1);
    this.hp = this.maxHp;
    const radius = this.def.boss ? 22 : elite ? 17 : 13;
    this.body = scene.add.ellipse(0, 3, radius * 2.2, radius * 1.65, this.def.color, 0.28).setStrokeStyle(1, 0xf7e3ab, 0.45);
    const details = this.createModel(radius);
    this.label = scene.add.text(0, radius + 13, this.def.icon, { fontSize: this.def.boss ? '11px' : '9px', color: '#fff9e5', fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0.75);
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
    if (sourceTags.includes('Root') && this.def.rootResist) multiplier *= this.def.rootResist;
    if (sourceTags.includes('Storm') && this.def.stormResist) multiplier *= this.def.stormResist;
    if (sourceTags.includes('Time') && this.def.timeResist) multiplier *= this.def.timeResist;
    if (sourceTags.includes('Moon') && this.def.moonResist) multiplier *= this.def.moonResist;
    if (sourceTags.includes('Alchemy') && this.def.alchemyResist) multiplier *= this.def.alchemyResist;
    if (sourceTags.includes('Shadow') && this.def.shadowWeak) multiplier *= this.def.shadowWeak;
    if (this.hasStatus('frail')) multiplier *= 1.28;
    if (this.hasStatus('marked')) multiplier *= 1.18;
    const collectorArmor = this.def.id === 'curse_collector' ? Math.floor(repeatedHits / 3) : 0;
    const final = Math.max(1, amount * multiplier - (this.def.armor ?? 0) - this.armorScale - collectorArmor);
    this.hp -= final;
    this.scene.tweens.add({ targets: this.body, scaleX: 1.25, scaleY: 1.25, yoyo: true, duration: 70 });
    if (this.hp <= 0) this.alive = false;
    return final;
  }

  applyStatus(id: StatusId, durationMs: number, power: number) {
    const existing = this.statuses.get(id);
    const resistedPower = power * this.statusResistance(id);
    this.statuses.set(id, { id, remaining: Math.max(existing?.remaining ?? 0, durationMs), power: Math.max(existing?.power ?? 0, resistedPower) });
    this.body.setStrokeStyle(2, this.statusColor(), 1);
  }

  rewind(amount: number) {
    this.progress = clamp(this.progress - amount * (1 - (this.def.rewindResist ?? 0)), 0, 1);
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

  private statusResistance(id: StatusId) {
    if (id === 'burning') return 1 - (this.def.burnResist ?? 0);
    if (id === 'snared' || id === 'chilled' || id === 'dazed') return 1 - (this.def.slowResist ?? 0);
    return 1;
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
    c.add(this.scene.add.ellipse(0, radius * 0.7, radius * 2.35, radius * 0.55, 0x030206, 0.32));
    switch (this.def.id) {
      case 'scribble_goblin':
        c.add(this.scene.add.star(0, -3, 7, radius * 0.55, radius * 0.95, 0x8ee068, 0.96).setStrokeStyle(2, 0x20381c));
        c.add(this.scene.add.triangle(-10, -8, -3, -11, -15, -18, -13, -3, 0x6fc457, 1));
        c.add(this.scene.add.triangle(10, -8, 3, -11, 15, -18, 13, -3, 0x6fc457, 1));
        c.add(this.scene.add.circle(-5, -6, 3, 0xf8ffad));
        c.add(this.scene.add.circle(6, -5, 3, 0xf8ffad));
        c.add(this.scene.add.circle(-4, -6, 1.3, 0x111111));
        c.add(this.scene.add.circle(7, -5, 1.3, 0x111111));
        g.lineStyle(2, 0x193015, 1).lineBetween(-7, 2, 6, 3).lineBetween(-10, 8, -3, 3).lineBetween(9, 8, 3, 3);
        g.lineStyle(1, 0xeaff9c, 0.7).lineBetween(-14, -1, -23, -7).lineBetween(13, 0, 23, -4);
        this.scene.tweens.add({ targets: c, angle: 4, duration: 140, yoyo: true, repeat: -1, repeatDelay: 220 });
        break;
      case 'candle_knight':
        c.add(this.scene.add.rectangle(0, 1, radius * 1.35, radius * 1.75, 0xffdf88, 1).setStrokeStyle(2, 0x6f4a21));
        c.add(this.scene.add.rectangle(0, -5, radius * 1.52, 5, 0xfff4c3, 0.95));
        const flame = this.scene.add.triangle(0, -radius - 9, -7, -3, 0, -20, 7, -3, 0xff6b34, 1);
        const innerFlame = this.scene.add.triangle(0, -radius - 14, -4, -5, 0, -25, 4, -5, 0xfff08a, 0.9);
        c.add([flame, innerFlame]);
        c.add(this.scene.add.rectangle(0, 3, radius * 0.92, 4, 0x6f4a21, 1));
        g.lineStyle(2, 0x9b6b2c, 1).lineBetween(-12, 3, -22, 10).lineBetween(12, 1, 23, -8);
        c.add(this.scene.add.rectangle(25, -7, 4, 17, 0xd9e5ff, 1).setRotation(0.55));
        this.scene.tweens.add({ targets: [flame, innerFlame], scaleX: 0.72, scaleY: 1.22, duration: 160, yoyo: true, repeat: -1 });
        break;
      case 'gloom_slime':
        g.fillStyle(0x596890, 0.92).fillEllipse(0, 5, radius * 2.15, radius * 1.35);
        g.fillStyle(0x7f91c7, 0.85).fillEllipse(-7, 2, 14, 10).fillEllipse(8, 1, 11, 8);
        g.fillStyle(0x26304a, 1).fillCircle(-5, 0, 2.2).fillCircle(6, -1, 2.2);
        g.lineStyle(2, 0x9bb1e8, 0.9).lineBetween(-10, -8, -3, -16).lineBetween(2, -9, 11, -18).lineBetween(11, -4, 20, -11);
        c.add(this.scene.add.circle(-13, 6, 3, 0x9bb1e8, 0.7));
        c.add(this.scene.add.circle(15, 7, 2, 0x9bb1e8, 0.55));
        this.scene.tweens.add({ targets: c, scaleX: 1.18, scaleY: 0.86, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        break;
      case 'winged_inkling':
        const wingL = this.scene.add.triangle(-11, 1, 0, -2, -24, -14, -8, 12, 0x15101f, 1).setStrokeStyle(1, 0x6650a0);
        const wingR = this.scene.add.triangle(11, 1, 0, -2, 24, -14, 8, 12, 0x15101f, 1).setStrokeStyle(1, 0x6650a0);
        c.add([wingL, wingR]);
        c.add(this.scene.add.ellipse(0, 1, radius * 1.05, radius * 1.5, 0x2c2446, 1).setStrokeStyle(2, 0x8974d0));
        c.add(this.scene.add.triangle(0, 13, -5, 5, 5, 5, 0, 20, 0x15101f, 1));
        c.add(this.scene.add.circle(-4, -3, 2.5, 0xd7ceff));
        c.add(this.scene.add.circle(4, -3, 2.5, 0xd7ceff));
        g.lineStyle(1, 0xb9a9ff, 0.75).lineBetween(-15, -4, -8, 2).lineBetween(15, -4, 8, 2);
        this.scene.tweens.add({ targets: wingL, scaleY: 0.42, angle: -10, duration: 120, yoyo: true, repeat: -1 });
        this.scene.tweens.add({ targets: wingR, scaleY: 0.42, angle: 10, duration: 120, yoyo: true, repeat: -1 });
        break;
      case 'clockwork_wyvern':
        c.add(this.scene.add.polygon(0, 0, [[-17, 5], [-4, -12], [15, -4], [10, 10]], 0xb08b59, 1).setStrokeStyle(2, 0x332618));
        c.add(this.scene.add.triangle(-8, -2, -22, -11, -14, 3, -24, 10, 0x7b5e37, 1));
        const gear = this.scene.add.circle(-3, 0, 7, 0xead08d).setStrokeStyle(2, 0x332618);
        c.add(gear);
        c.add(this.scene.add.triangle(12, -7, 2, -1, 15, -14, 23, -3, 0x87683d, 1).setStrokeStyle(1, 0x332618));
        c.add(this.scene.add.circle(15, -6, 2, 0x9ff4ff));
        g.lineStyle(2, 0x43321d, 1).strokeCircle(-3, 0, 10).lineBetween(-3, -10, -3, -16).lineBetween(-12, 0, -18, 0);
        g.lineStyle(1, 0xffdf8a, 0.9).lineBetween(-3, 0, 3, -5).lineBetween(-3, 0, -7, 7);
        this.scene.tweens.add({ targets: gear, angle: 360, duration: 950, repeat: -1 });
        break;
      case 'curse_collector':
        c.add(this.scene.add.rectangle(0, 2, radius * 1.45, radius * 1.55, 0x9bdbd1, 1).setStrokeStyle(2, 0x21443f));
        c.add(this.scene.add.rectangle(0, -9, radius * 1.65, 6, 0x21443f, 1));
        const receiptL = this.scene.add.rectangle(-11, 4, 5, 15, 0xf4e6b8, 1).setRotation(-0.25);
        const receiptR = this.scene.add.rectangle(11, 4, 5, 15, 0xf4e6b8, 1).setRotation(0.25);
        c.add([receiptL, receiptR]);
        c.add(this.scene.add.text(0, 2, '$', { fontSize: '13px', color: '#11302c', fontStyle: 'bold' }).setOrigin(0.5));
        c.add(this.scene.add.circle(-5, -3, 1.7, 0x11302c));
        c.add(this.scene.add.circle(5, -3, 1.7, 0x11302c));
        g.lineStyle(1, 0xffef9e, 0.9).lineBetween(-18, -13, -24, -18).lineBetween(17, -12, 23, -18);
        this.scene.tweens.add({ targets: [receiptL, receiptR], angle: 12, duration: 180, yoyo: true, repeat: -1, repeatDelay: 260 });
        break;
      case 'wax_baron':
        c.add(this.scene.add.ellipse(0, 1, radius * 1.85, radius * 1.95, 0xffc86e, 1).setStrokeStyle(3, 0x6f3b18));
        c.add(this.scene.add.rectangle(0, -radius - 1, radius * 2.2, 7, 0x6f3b18, 1));
        c.add(this.scene.add.rectangle(0, -radius - 10, radius * 1.45, 16, 0x4f2611, 1).setStrokeStyle(1, 0xffe0a0));
        c.add(this.scene.add.triangle(0, -radius - 24, -8, -8, 0, -25, 8, -8, 0xff7438, 1));
        c.add(this.scene.add.circle(-6, -4, 2.4, 0x281107));
        c.add(this.scene.add.circle(7, -4, 2.4, 0x281107));
        g.lineStyle(2, 0x7a3514, 1).lineBetween(-11, 6, 11, 6).lineBetween(-18, 2, -27, -7).lineBetween(18, 2, 27, -7);
        break;
      case 'ink_duchess':
        const dressL = this.scene.add.triangle(-12, 4, 0, -11, -33, -20, -10, 18, 0x191326, 1).setStrokeStyle(2, 0x7b6bd6);
        const dressR = this.scene.add.triangle(12, 4, 0, -11, 33, -20, 10, 18, 0x191326, 1).setStrokeStyle(2, 0x7b6bd6);
        c.add([dressL, dressR]);
        c.add(this.scene.add.ellipse(0, 0, radius * 1.45, radius * 1.75, 0x5d4fa8, 1).setStrokeStyle(2, 0xd7ceff));
        c.add(this.scene.add.star(0, -radius - 6, 5, 4, 9, 0xffe577, 1));
        c.add(this.scene.add.circle(-5, -3, 2.2, 0xffffff));
        c.add(this.scene.add.circle(6, -3, 2.2, 0xffffff));
        this.scene.tweens.add({ targets: [dressL, dressR], scaleY: 0.55, duration: 150, yoyo: true, repeat: -1 });
        break;
      case 'ledger_lich':
        c.add(this.scene.add.rectangle(0, 2, radius * 1.65, radius * 1.95, 0xa4ecd9, 1).setStrokeStyle(3, 0x173a36));
        c.add(this.scene.add.rectangle(0, -3, radius * 1.3, radius * 1.25, 0xf4e6b8, 1).setStrokeStyle(2, 0x173a36));
        c.add(this.scene.add.circle(-5, -5, 2.4, 0x173a36));
        c.add(this.scene.add.circle(5, -5, 2.4, 0x173a36));
        c.add(this.scene.add.text(0, 7, '$', { fontSize: '16px', color: '#173a36', fontStyle: 'bold' }).setOrigin(0.5));
        g.lineStyle(2, 0xeafff7, 0.8).lineBetween(-18, -16, -29, -22).lineBetween(18, -16, 29, -22).lineBetween(-20, 15, 20, 15);
        break;
      case 'page_eater':
        g.fillStyle(0xd95f9d, 1).fillRoundedRect(-31, -15, 62, 30, 13);
        g.fillStyle(0xf18bbf, 1).fillRoundedRect(-23, -10, 36, 20, 9);
        g.fillStyle(0xfff0d0, 1).fillTriangle(18, -10, 31, 0, 18, 10);
        g.lineStyle(2, 0x4a1830, 1).lineBetween(-18, -10, -10, 10).lineBetween(-5, -11, 3, 11).lineBetween(9, -10, 16, 9);
        c.add(this.scene.add.circle(-20, -5, 4, 0xfff2ad));
        c.add(this.scene.add.circle(-19, -5, 1.6, 0x4a1830));
        const pageA = this.scene.add.rectangle(0, -20, 22, 7, 0xf4e6b8, 0.95).setRotation(-0.3);
        const pageB = this.scene.add.rectangle(-8, 22, 24, 7, 0xf4e6b8, 0.9).setRotation(0.22);
        c.add([pageA, pageB]);
        this.scene.tweens.add({ targets: [pageA, pageB], x: '+=5', angle: 18, duration: 210, yoyo: true, repeat: -1, repeatDelay: 180 });
        break;
      case 'starved_atlas':
        g.fillStyle(0x4c8d56, 1).fillRoundedRect(-33, -20, 66, 40, 8);
        g.lineStyle(3, 0xd7f5a3, 1).strokeRoundedRect(-33, -20, 66, 40, 8);
        g.lineStyle(2, 0xd7f5a3, 0.95).lineBetween(0, -18, 0, 18).lineBetween(-25, -8, -5, 6).lineBetween(7, -10, 27, 5);
        c.add(this.scene.add.circle(-17, -5, 4, 0xfff0bd));
        c.add(this.scene.add.circle(18, -4, 4, 0xfff0bd));
        c.add(this.scene.add.rectangle(0, 24, 54, 8, 0x7fcf83, 0.8));
        break;
      case 'null_clock':
        c.add(this.scene.add.circle(0, 0, radius * 1.45, 0x8fb8ff, 1).setStrokeStyle(3, 0x243052));
        c.add(this.scene.add.circle(0, 0, radius * 0.95, 0x182033, 1).setStrokeStyle(2, 0xd9f1ff));
        g.lineStyle(3, 0xd9f1ff, 1).lineBetween(0, 0, 0, -15).lineBetween(0, 0, 13, 7);
        g.lineStyle(2, 0xffe577, 0.9).lineBetween(-26, -18, -38, -26).lineBetween(26, -18, 38, -26).lineBetween(-22, 18, -34, 28).lineBetween(22, 18, 34, 28);
        c.add(this.scene.add.circle(0, 0, 3, 0xffe577));
        this.scene.tweens.add({ targets: c, angle: 360, duration: 3800, repeat: -1 });
        break;
      default:
        break;
    }
    if (this.elite) c.add(this.scene.add.star(0, -radius - 9, 5, 4, 8, 0xfff08a, 1));
    this.scene.tweens.add({
      targets: c,
      y: c.y - 2,
      duration: 650 + Math.floor(Math.random() * 420),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return c;
  }
}
