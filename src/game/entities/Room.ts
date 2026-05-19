import Phaser from 'phaser';
import { roomDefinitions } from '../data/rooms';
import type { ComboDefinition, RoomDefinition, RoomId, TargetPriority } from '../core/types';

export class Room extends Phaser.GameObjects.Container {
  readonly id: string;
  readonly def: RoomDefinition;
  level = 1;
  priority: TargetPriority = 'first';
  upgradeFocus: 'Power' | 'Reach' = 'Power';
  cooldownRemaining = 0;
  slotId: string;
  floor: number;
  activeFusion?: ComboDefinition;
  fusedCombo?: ComboDefinition;
  evolvedFusion = false;
  mergedInto?: string;
  homeX: number;
  homeY: number;
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private model: Phaser.GameObjects.Container;
  private upgradeGlow: Phaser.GameObjects.Ellipse;
  private fusionGlow?: Phaser.GameObjects.Ellipse;
  private evolutionCrown?: Phaser.GameObjects.Star;

  constructor(scene: Phaser.Scene, roomId: RoomId, slotId: string, floor: number, x: number, y: number) {
    super(scene, x, y);
    this.id = `${roomId}-${slotId}`;
    this.def = roomDefinitions[roomId];
    this.slotId = slotId;
    this.floor = floor;
    this.homeX = x;
    this.homeY = y;
    this.bg = scene.add.rectangle(0, 0, 92, 38, this.def.color, 0.88).setStrokeStyle(2, 0xfff0bd, 0.9);
    this.upgradeGlow = scene.add.ellipse(0, 0, 104, 48, this.def.color, 0).setDepth(-1);
    this.model = this.createModel();
    this.text = scene.add.text(34, 10, `Lv ${this.level}`, { fontSize: '10px', color: '#130d18', fontStyle: 'bold' }).setOrigin(0.5);
    this.add([this.upgradeGlow, this.bg, this.model, this.text]);
    this.setSize(92, 38);
    this.enableRoomInput();
    scene.add.existing(this);
  }

  damage() {
    const fusionBoost = this.evolvedFusion ? 1.45 : 1;
    const focusBoost = this.upgradeFocus === 'Power' ? 1 + (this.level - 1) * 0.12 : 1;
    return this.def.baseDamage * (this.level === 1 ? 1 : this.level === 2 ? 1.3 : 1.6) * fusionBoost * focusBoost;
  }

  range() {
    const focusBoost = this.upgradeFocus === 'Reach' ? 1 + (this.level - 1) * 0.1 : 1;
    return this.def.range * (this.def.tags.includes('Storm') || this.def.tags.includes('Moon') ? 1.03 : 1) * focusBoost;
  }

  cooldown() {
    const supportBoost = this.level === 3 ? 0.86 : 1;
    const focusBoost = this.upgradeFocus === 'Reach' ? 0.94 : 1;
    return this.def.cooldownMs * supportBoost * (this.evolvedFusion ? 0.84 : 1) * focusBoost;
  }

  upgradeCost() {
    return Math.round(this.def.cost * (this.level === 1 ? 0.7 : 1.2));
  }

  sellValue() {
    return Math.round(this.def.cost * 0.55 + (this.level - 1) * this.def.cost * 0.25);
  }

  upgrade() {
    if (this.level >= 3) return;
    this.level += 1;
    this.text.setText(`Lv ${this.level}`);
    this.upgradeGlow.setAlpha(this.level === 2 ? 0.18 : 0.34);
    this.bg.setStrokeStyle(this.level === 2 ? 3 : 4, this.level === 2 ? 0xfff0bd : 0xffffff, 1);
    this.model.setScale(this.level === 2 ? 1.09 : 1.18);
    this.scene.tweens.add({ targets: this, scaleX: 1.12, scaleY: 1.12, yoyo: true, duration: 120 });
  }

  toggleUpgradeFocus() {
    this.upgradeFocus = this.upgradeFocus === 'Power' ? 'Reach' : 'Power';
    this.scene.tweens.add({ targets: this, angle: this.upgradeFocus === 'Reach' ? 2 : -2, duration: 70, yoyo: true });
  }

  setFusionActive(active: boolean, color = 0xbdf4ff) {
    if (active && !this.fusionGlow) {
      this.fusionGlow = this.scene.add.ellipse(0, 0, 112, 54, color, 0.22).setDepth(-2);
      this.addAt(this.fusionGlow, 0);
      this.scene.tweens.add({ targets: this.fusionGlow, alpha: 0.42, scaleX: 1.08, scaleY: 1.15, yoyo: true, repeat: -1, duration: 760 });
    }
    if (this.fusionGlow) {
      this.fusionGlow.setFillStyle(color, active ? 0.26 : 0);
      this.fusionGlow.setVisible(active);
    }
  }

  setFusionRole(combo: ComboDefinition | undefined, role: 'anchor' | 'contributor' | 'none', color = 0xbdf4ff, mergedX = this.homeX, mergedY = this.homeY) {
    this.activeFusion = role === 'anchor' ? combo : this.fusedCombo;
    this.mergedInto = role === 'contributor' ? combo?.id : undefined;
    this.setFusionActive(role !== 'none', color);
    if (role === 'anchor' && combo) {
      this.setAlpha(1);
      this.setPosition(mergedX, mergedY);
      this.setScale(1);
      this.text.setText(`${combo.name.split(' ').map((word) => word[0]).join('')}${this.evolvedFusion ? '+' : ''} ${this.level}`);
      this.bg.setSize(92, 38);
      this.bg.setFillStyle(color, this.evolvedFusion ? 1 : 0.92).setStrokeStyle(this.evolvedFusion ? 5 : 4, this.evolvedFusion ? 0xffe28a : 0xffffff, 1);
      this.disableInteractive();
      this.enableRoomInput();
    } else if (role === 'contributor') {
      this.setPosition(mergedX, mergedY);
      this.setAlpha(0);
      this.setScale(0.1);
      this.text.setText('Merged');
      this.bg.setFillStyle(color, 0.32).setStrokeStyle(2, color, 0.9);
      this.disableInteractive();
    } else {
      if (this.fusedCombo) {
        this.setFusionRole(this.fusedCombo, 'anchor', this.fusedCombo.roomIds.length >= 3 ? 0xffaa4f : 0xbdf4ff, this.homeX, this.homeY);
        return;
      }
      this.setAlpha(1);
      this.setPosition(this.homeX, this.homeY);
      this.setScale(1);
      this.text.setText(`Lv ${this.level}`);
      this.bg.setSize(92, 38);
      this.bg.setFillStyle(this.def.color, 0.88).setStrokeStyle(this.level >= 3 ? 4 : this.level === 2 ? 3 : 2, this.level >= 3 ? 0xffffff : 0xfff0bd, 0.9);
      this.disableInteractive();
      this.enableRoomInput();
    }
  }

  becomeFusedChild(combo: ComboDefinition, color = 0xbdf4ff) {
    this.fusedCombo = combo;
    this.setFusionRole(combo, 'anchor', color, this.homeX, this.homeY);
  }

  evolutionCost() {
    if (!this.fusedCombo) return 0;
    return this.fusedCombo.roomIds.length >= 3 ? 4 : 2;
  }

  evolutionTitle() {
    if (!this.fusedCombo) return 'Unfused Room';
    const titles: Record<string, string> = {
      lunar_brambles: 'Moonroot Crown',
      prismatic_fireflies: 'Prismatic Hive',
      funeral_chime: 'Requiem Engine',
      time_grown_thorns: 'Chronovine Engine',
      echo_lightning: 'Thunder Mirror Choir',
      spicy_stew_economy: 'Volcanic Nursery',
      solar_orchard: 'Sunheart Orchard',
    };
    return titles[this.fusedCombo.id] ?? `Greater ${this.fusedCombo.name}`;
  }

  canEvolve() {
    return Boolean(this.fusedCombo && !this.evolvedFusion);
  }

  evolveFusion() {
    if (!this.fusedCombo || this.evolvedFusion) return false;
    this.evolvedFusion = true;
    const color = this.fusedCombo.roomIds.length >= 3 ? 0xffaa4f : 0xbdf4ff;
    this.setFusionRole(this.fusedCombo, 'anchor', color, this.homeX, this.homeY);
    this.upgradeGlow.setFillStyle(0xffe28a, 0.42).setAlpha(0.5);
    this.model.setScale(Math.max(this.model.scaleX, 1.18));
    if (!this.evolutionCrown) {
      this.evolutionCrown = this.scene.add.star(-39, -14, 7, 4, 10, 0xffe28a, 0.94).setStrokeStyle(1, 0xffffff, 0.9);
      this.add(this.evolutionCrown);
      this.scene.tweens.add({ targets: this.evolutionCrown, angle: 360, scale: 1.18, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    this.scene.tweens.add({ targets: this, scaleX: 1.18, scaleY: 1.18, yoyo: true, duration: 190 });
    return true;
  }

  private createModel() {
    const c = this.scene.add.container(-16, 0);
    const g = this.scene.add.graphics();
    c.add(g);
    c.add(this.scene.add.rectangle(0, 0, 62, 30, 0x100916, 0.18).setStrokeStyle(1, 0xffffff, 0.16));
    switch (this.def.id) {
      case 'root_library':
        c.add(this.scene.add.rectangle(-15, 2, 9, 24, 0x7b4d2e, 1).setStrokeStyle(1, 0x2b1a10));
        c.add(this.scene.add.rectangle(-5, 1, 9, 26, 0x9c6a3d, 1).setStrokeStyle(1, 0x2b1a10));
        c.add(this.scene.add.rectangle(6, 2, 11, 24, 0x3f6b3e, 1).setStrokeStyle(1, 0x172617));
        c.add(this.scene.add.rectangle(18, 3, 8, 22, 0x5fa65b, 1).setStrokeStyle(1, 0x172617));
        g.lineStyle(3, 0x95e784, 1).lineBetween(-22, 13, -9, -2).lineBetween(-9, -2, 10, -13).lineBetween(-4, 9, 14, 2);
        c.add(this.scene.add.circle(14, -12, 4, 0xd9ffb0, 0.9));
        const rootSpark = this.scene.add.star(-23, -10, 5, 2, 5, 0xb8ff8f, 0.9);
        c.add(rootSpark);
        this.pulse(rootSpark, 1.35, 900);
        break;
      case 'fire_imp_kitchen':
        c.add(this.scene.add.ellipse(0, 5, 34, 18, 0x3b2a28, 1).setStrokeStyle(2, 0xffc36b));
        c.add(this.scene.add.rectangle(0, -1, 24, 7, 0x5e1b10, 1));
        c.add(this.scene.add.triangle(-8, -5, -9, 9, 0, -15, 9, 9, 0xff7438, 1));
        c.add(this.scene.add.triangle(2, -6, -4, 7, 4, -16, 12, 7, 0xffd36b, 0.9));
        c.add(this.scene.add.circle(16, -8, 5, 0xffd36b));
        const impEye = this.scene.add.circle(18, -8, 2, 0x3b1b12);
        c.add(impEye);
        this.scene.tweens.add({ targets: impEye, x: 14, y: -11, duration: 120, yoyo: true, repeat: -1, hold: 70 });
        g.lineStyle(2, 0x5e1b10, 1).lineBetween(14, -3, 22, 4).lineBetween(12, -1, 5, 5);
        const ember = this.scene.add.circle(-18, -10, 3, 0xffe0a0, 0.85);
        c.add(ember);
        this.pulse(ember, 1.8, 360);
        break;
      case 'moon_bell':
        const moonPulse = this.scene.add.circle(0, 0, 22, 0xaebdff, 0.18);
        c.add(moonPulse);
        c.add(this.scene.add.ellipse(0, 0, 25, 28, 0xdfe8ff, 1).setStrokeStyle(2, 0x6477a0));
        c.add(this.scene.add.rectangle(0, -14, 18, 5, 0xfff0bd, 1));
        c.add(this.scene.add.circle(0, 13, 4, 0xfff0bd));
        g.lineStyle(2, 0xaebdff, 0.9).strokeCircle(0, 0, 22).strokeCircle(0, 0, 15);
        c.add(this.scene.add.star(19, -12, 5, 2, 5, 0xffffc7, 1));
        c.add(this.scene.add.star(-19, 10, 5, 2, 4, 0xdfe8ff, 0.9));
        this.pulse(moonPulse, 1.32, 1100);
        break;
      case 'mirror_hatchery':
        c.add(this.scene.add.polygon(0, 0, [[0, -18], [18, 0], [0, 18], [-18, 0]], 0xbaf7ff, 1).setStrokeStyle(2, 0x227987));
        c.add(this.scene.add.polygon(1, 0, [[0, -11], [11, 0], [0, 11], [-11, 0]], 0xffd9fb, 0.38));
        c.add(this.scene.add.circle(-12, 10, 6, 0xffd9fb));
        c.add(this.scene.add.circle(13, 9, 5, 0xd4fff8));
        c.add(this.scene.add.circle(5, 15, 3, 0xffffd6));
        const mirrorGlint = this.scene.add.rectangle(-4, -7, 20, 2, 0xffffff, 0.88).setRotation(-0.55);
        c.add(mirrorGlint);
        g.lineStyle(2, 0xffffff, 0.95).lineBetween(-9, -3, 10, -13).lineBetween(-5, 5, 8, -2);
        g.lineStyle(1, 0x6fffff, 0.9).lineBetween(-22, -11, -14, -3).lineBetween(19, -9, 25, -15);
        this.scene.tweens.add({ targets: mirrorGlint, x: 10, y: 5, alpha: 0.2, duration: 720, yoyo: true, repeat: -1 });
        break;
      case 'grave_moth_chapel':
        c.add(this.scene.add.rectangle(0, 5, 28, 22, 0x5b456d, 1).setStrokeStyle(2, 0xdac7ff));
        c.add(this.scene.add.triangle(0, -12, -18, 4, 0, -22, 18, 4, 0x2b2038, 1));
        c.add(this.scene.add.rectangle(0, 7, 8, 14, 0x20142c, 1));
        const leftWing = this.scene.add.ellipse(-9, -2, 13, 8, 0xded4ff, 0.9);
        const rightWing = this.scene.add.ellipse(9, -2, 13, 8, 0xded4ff, 0.9);
        c.add(leftWing);
        c.add(rightWing);
        c.add(this.scene.add.circle(0, -2, 3, 0xb99adf));
        c.add(this.scene.add.star(-20, -10, 5, 2, 4, 0xdac7ff, 0.8));
        g.lineStyle(1, 0xdac7ff, 0.6).lineBetween(-18, 13, 18, 13);
        this.scene.tweens.add({ targets: leftWing, scaleX: 0.72, duration: 280, yoyo: true, repeat: -1 });
        this.scene.tweens.add({ targets: rightWing, scaleX: 0.72, duration: 280, yoyo: true, repeat: -1 });
        break;
      case 'clockwork_orrery':
        c.add(this.scene.add.circle(0, 1, 14, 0xe4b85a, 1).setStrokeStyle(2, 0x513b18));
        c.add(this.scene.add.circle(-17, -8, 5, 0x8fc5ff).setStrokeStyle(1, 0xd9f1ff));
        c.add(this.scene.add.circle(18, 9, 6, 0xff9070).setStrokeStyle(1, 0xffd3c5));
        c.add(this.scene.add.circle(13, -14, 3, 0xb8ff8f));
        const orbit = this.scene.add.container(0, 1);
        orbit.add(this.scene.add.circle(-17, -9, 3, 0x8fc5ff));
        orbit.add(this.scene.add.circle(18, 8, 3, 0xff9070));
        c.add(orbit);
        g.lineStyle(2, 0x513b18, 1).strokeCircle(0, 1, 22).lineBetween(0, 1, 0, -10).lineBetween(0, 1, 9, 6);
        g.lineStyle(1, 0xffe8a3, 0.9).strokeCircle(0, 1, 8).lineBetween(-22, 1, 22, 1);
        this.scene.tweens.add({ targets: orbit, angle: 360, duration: 3000, repeat: -1 });
        break;
      case 'storm_harp':
        const shockA = this.scene.add.rectangle(-20, -7, 14, 2, 0x8fe7ff, 0.85).setRotation(0.45);
        const shockB = this.scene.add.rectangle(19, -13, 14, 2, 0x8fe7ff, 0.85).setRotation(-0.55);
        c.add([shockA, shockB]);
        g.lineStyle(4, 0x31568f, 1).lineBetween(-15, 14, -4, -17).lineBetween(-4, -17, 15, 13).lineBetween(-15, 14, 15, 13);
        g.lineStyle(1, 0xdbecff, 1).lineBetween(-10, 10, -1, -12).lineBetween(-4, 11, 4, -10).lineBetween(3, 11, 9, -5).lineBetween(9, 11, 13, 4);
        g.lineStyle(2, 0x8fe7ff, 0.95).lineBetween(-24, -9, -14, -3).lineBetween(14, -14, 24, -20).lineBetween(12, -5, 22, 0);
        c.add(this.scene.add.star(16, -11, 5, 2, 6, 0xfff68a, 1));
        c.add(this.scene.add.circle(-19, -8, 3, 0xaed7ff, 0.9));
        this.scene.tweens.add({ targets: [shockA, shockB], alpha: 0.05, scaleX: 1.8, duration: 180, yoyo: true, repeat: -1, repeatDelay: 320 });
        break;
      case 'cauldron_nursery':
        c.add(this.scene.add.ellipse(0, 7, 34, 19, 0x2f574c, 1).setStrokeStyle(2, 0xa7ffcf));
        c.add(this.scene.add.rectangle(0, -1, 26, 8, 0x62d2a2, 1));
        const bubbleA = this.scene.add.circle(-8, -11, 5, 0xd4ffe7, 0.9);
        const bubbleB = this.scene.add.circle(4, -15, 4, 0xfff4a3, 0.9);
        const bubbleC = this.scene.add.circle(14, -9, 3.5, 0xbfffe1, 0.9);
        c.add([bubbleA, bubbleB, bubbleC]);
        c.add(this.scene.add.circle(-15, -2, 3, 0xffd9fb, 0.95));
        c.add(this.scene.add.circle(15, -1, 3, 0xffd9fb, 0.95));
        g.lineStyle(2, 0x18352c, 1).lineBetween(-20, 8, -25, 16).lineBetween(20, 8, 25, 16);
        c.add(this.scene.add.star(20, -15, 5, 2, 5, 0xfff4a3, 0.8));
        this.floatBubble(bubbleA, -24, 720);
        this.floatBubble(bubbleB, -28, 920);
        this.floatBubble(bubbleC, -22, 620);
        break;
      default:
        c.add(this.scene.add.text(0, 0, this.def.icon, { fontSize: '18px', color: '#130d18', fontStyle: 'bold' }).setOrigin(0.5));
        break;
    }
    c.add(this.scene.add.star(27, -13, 5, 1.5, 3.5, 0xffffff, 0.55));
    this.scene.tweens.add({
      targets: c,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return c;
  }

  private enableRoomInput() {
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-46, -19, 92, 38),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
  }

  private pulse(target: Phaser.GameObjects.GameObject, scale: number, duration: number) {
    this.scene.tweens.add({ targets: target, scale, alpha: 0.35, duration, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private floatBubble(target: Phaser.GameObjects.GameObject & { y: number; alpha: number; setScale: (x: number, y?: number) => Phaser.GameObjects.GameObject }, distance: number, duration: number) {
    const startY = target.y;
    this.scene.tweens.add({
      targets: target,
      y: startY + distance,
      alpha: 0,
      scale: 1.45,
      duration,
      repeat: -1,
      repeatDelay: 160,
      onRepeat: () => {
        target.y = startY;
        target.alpha = 0.9;
        target.setScale(1);
      },
    });
  }
}
