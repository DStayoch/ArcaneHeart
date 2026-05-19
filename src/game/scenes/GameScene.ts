import Phaser from 'phaser';
import { createGameState, type GameState } from '../core/GameState';
import { enemyDefinitions } from '../data/enemies';
import type { BuildSlot } from '../entities/BuildSlot';
import type { Room } from '../entities/Room';
import { BuildSystem } from '../systems/BuildSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { ComboSystem } from '../systems/ComboSystem';
import { EconomySystem } from '../systems/EconomySystem';
import { EnemySystem } from '../systems/EnemySystem';
import { MutationSystem } from '../systems/MutationSystem';
import { ProjectileSystem } from '../systems/ProjectileSystem';
import { RoomSystem } from '../systems/RoomSystem';
import { StatusEffectSystem } from '../systems/StatusEffectSystem';
import { TargetingSystem } from '../systems/TargetingSystem';
import { TowerMapSystem } from '../systems/TowerMapSystem';
import { VisualEffectsSystem } from '../systems/VisualEffectsSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { BuildMenu } from '../ui/BuildMenu';
import { EscapeMenu } from '../ui/EscapeMenu';
import { Hud } from '../ui/Hud';
import { MutationChoicePanel } from '../ui/MutationChoicePanel';
import { PostWaveRewardPanel, type PostWaveReward } from '../ui/PostWaveRewardPanel';
import { RangePreview } from '../ui/RangePreview';
import { RoomInfoPanel } from '../ui/RoomInfoPanel';
import { Tooltip } from '../ui/Tooltip';
import { TutorialPanel } from '../ui/TutorialPanel';
import { WavePreview } from '../ui/WavePreview';

export class GameScene extends Phaser.Scene {
  private state!: GameState;
  private tower!: TowerMapSystem;
  private economy!: EconomySystem;
  private build!: BuildSystem;
  private enemies!: EnemySystem;
  private waves!: WaveSystem;
  private targeting!: TargetingSystem;
  private projectiles!: ProjectileSystem;
  private statuses!: StatusEffectSystem;
  private rooms!: RoomSystem;
  private combos!: ComboSystem;
  private mutations!: MutationSystem;
  private hud!: Hud;
  private buildMenu!: BuildMenu;
  private tooltip!: Tooltip;
  private escapeMenu!: EscapeMenu;
  private wavePreview!: WavePreview;
  private mutationPanel!: MutationChoicePanel;
  private rewardPanel!: PostWaveRewardPanel;
  private rangePreview!: RangePreview;
  private roomInfo!: RoomInfoPanel;
  private tutorial?: TutorialPanel;
  private audio!: AudioSystem;
  private fx!: VisualEffectsSystem;
  private selectedRoom?: Room;
  private moveRoomSelection?: Room;
  private roomInfoHideTimer?: Phaser.Time.TimerEvent;
  private roomInfoHovered = false;
  private pendingMutationAfterReward = false;
  private lastLeakCount = 0;
  private ready = false;

  constructor() {
    super('GameScene');
  }

  create() {
    try {
      this.state = createGameState();
      this.add.rectangle(0, 0, 1280, 720, 0x100a18).setOrigin(0);
      this.decorateBackground();
      this.tower = new TowerMapSystem(this);
      this.tower.create();
      this.economy = new EconomySystem(this.state);
      this.audio = new AudioSystem(this);
      this.fx = new VisualEffectsSystem(this);
      this.mutations = new MutationSystem(this.state);
      this.build = new BuildSystem(this, this.economy);
      this.enemies = new EnemySystem(this, this.state, this.economy, this.mutations, this.tower.path, this.fx);
      this.waves = new WaveSystem(this, this.state, this.enemies);
      this.targeting = new TargetingSystem();
      this.projectiles = new ProjectileSystem(this);
      this.statuses = new StatusEffectSystem(this.state);
      this.rooms = new RoomSystem(this.state, this.targeting, this.projectiles, this.statuses, this.economy, this.audio, this.fx);
      this.createUi();
      this.wireInput();
      this.refreshUi();
      this.ready = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.add.rectangle(0, 0, 1280, 720, 0x160911).setOrigin(0);
      this.add.text(60, 80, `GameScene failed to start:\n${message}`, {
        fontSize: '22px',
        color: '#ffb7c8',
        wordWrap: { width: 1100 },
        lineSpacing: 8,
      });
      console.error(error);
    }
  }

  update(_time: number, delta: number) {
    if (!this.ready) return;
    this.enemies.update(delta);
    this.rooms.update(delta, this.build.rooms, this.enemies.enemies);
    this.projectiles.update(this.state.paused ? 0 : delta * this.state.speed, this.enemies.enemies, this.state.activeCombos);
    const activeCombos = this.combos.update(this.build.rooms);
    this.recordUnlockedCombos(activeCombos);
    this.state.activeCombos = activeCombos;
    if (this.waves.update()) this.completeWave();
    if (this.state.heartHp <= 0) this.endGame(false);
    this.checkHeartPanic();
    this.checkLeaks();
    this.refreshUi();
  }

  private createUi() {
    this.tooltip = new Tooltip(this);
    this.hud = new Hud(this, this.state, this.waves, this.tooltip);
    this.escapeMenu = new EscapeMenu(this);
    this.combos = new ComboSystem(this, this.tooltip, this.fx, (anchor, contributors, combo) => {
      this.build.consumeFusion(anchor, contributors, combo, this.tower.slots);
      if (this.selectedRoom && contributors.includes(this.selectedRoom)) {
        this.selectedRoom = anchor;
      }
    });
    this.wavePreview = new WavePreview(this, this.waves, this.tooltip);
    this.rangePreview = new RangePreview(this);
    this.buildMenu = new BuildMenu(this, this.state);
    this.roomInfo = new RoomInfoPanel(this);
    this.mutationPanel = new MutationChoicePanel(this);
    this.rewardPanel = new PostWaveRewardPanel(this);
    this.buildMenu.onBuild = (slot, roomId) => {
      this.audio.unlock();
      const room = this.build.build(slot, roomId);
      if (room) this.attachRoomInput(room);
      if (room) this.audio.play('build');
      if (room) this.state.roomsBuilt += 1;
      this.applyRoomMoodBonuses();
      this.buildMenu.close();
      this.selectedRoom = room;
      this.moveRoomSelection = undefined;
      this.hideRoomInfo();
      this.refreshUi();
    };
    this.buildMenu.onHover = (x, y, text) => this.tooltip.show(x, y, text);
    this.buildMenu.onOut = () => this.tooltip.hide();
    this.roomInfo.onUpgrade = (room) => {
      this.audio.unlock();
      if (this.build.upgrade(room)) {
        this.audio.play('build');
        this.fx.roomUpgraded(room);
      }
      this.showRoomInfo(room);
    };
    this.roomInfo.onSell = (room) => {
      this.build.sell(room, this.tower.slots);
      this.audio.play('sell');
      this.selectedRoom = undefined;
      this.hideRoomInfo();
    };
    this.roomInfo.onFocus = (room) => {
      room.toggleUpgradeFocus();
      this.audio.play('build');
      this.rangePreview.show(room);
      this.showRoomInfo(room);
    };
    this.roomInfo.onEvolve = (room) => {
      if (!room.canEvolve()) return;
      if (!this.economy.spendEssence(room.evolutionCost())) {
        this.showFloatingText(room.x, room.y - 38, 'Need more Essence', '#d8c0ff');
        return;
      }
      if (room.evolveFusion()) {
        this.state.evolvedFusions += 1;
        this.audio.play('combo');
        this.fx.fusionEvolved(room);
        this.showRoomInfo(room);
      }
    };
    this.roomInfo.onHoverChange = (hovered) => {
      this.roomInfoHovered = hovered;
      if (hovered) this.roomInfoHideTimer?.remove(false);
      else this.scheduleRoomInfoHide();
    };
    this.mutationPanel.onChoose = (mutation) => {
      this.mutations.apply(mutation);
      this.applyRoomMoodBonuses();
      this.mutationPanel.hidePanel();
      this.state.paused = false;
    };
    this.rewardPanel.onChoose = (reward) => this.applyPostWaveReward(reward);
    this.escapeMenu.onResume = () => this.closeEscapeMenu();
    this.escapeMenu.onStartScreen = () => this.scene.start('MenuScene');
    this.escapeMenu.onVolumeCycle = () => this.audio.cycleVolume();
  }

  private wireInput() {
    this.tower.slots.forEach((slot) => {
      slot.on('pointerdown', () => this.openSlot(slot));
      slot.on('pointerover', () => slot.setPreview(true));
      slot.on('pointerout', () => slot.setPreview(false));
    });
    this.hud.startButton.on('pointerdown', () => {
      this.clearRoomSelection();
      this.audio.unlock();
      const hasBoss = this.waves.getCurrentWave()?.entries.some((entry) => enemyDefinitions[entry.enemyId].boss) ?? false;
      if (this.waves.startWave()) this.audio.play(hasBoss ? 'boss' : 'wave');
    });
    this.hud.pauseButton.on('pointerdown', () => {
      this.audio.unlock();
      this.state.paused = !this.state.paused;
      this.refreshUi();
    });
    this.hud.speedButton.on('pointerdown', () => {
      this.audio.unlock();
      this.state.speed = this.state.speed === 1 ? 2 : 1;
      this.refreshUi();
    });
    this.hud.restartButton.on('pointerdown', () => this.scene.restart());
    this.hud.tutorialButton.on('pointerdown', () => {
      this.tutorial ??= new TutorialPanel(this);
      this.tutorial.open();
    });
    this.input.keyboard?.on('keydown-ESC', () => this.handleEscape());
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, targets: Phaser.GameObjects.GameObject[]) => {
      if (targets.length === 0) this.clearRoomSelection();
    });
  }

  private openSlot(slot: BuildSlot) {
    if (this.moveRoomSelection && !this.state.waveActive && !slot.model.roomId) {
      const moveCost = this.moveCost();
      if (moveCost > 0 && !this.economy.spendMana(moveCost)) {
        this.showFloatingText(slot.x, slot.y - 30, `Move costs ${moveCost} Mana`, '#ffe29a');
        return;
      }
      if (this.build.moveRoom(this.moveRoomSelection, slot, this.tower.slots)) {
        this.selectedRoom = this.moveRoomSelection;
        this.tooltip.hide();
        this.moveRoomSelection = undefined;
        this.buildMenu.close();
        this.hideRoomInfo();
        this.refreshUi();
        return;
      }
    }
    const existing = this.build.rooms.find((room) => room.slotId === slot.model.id);
    if (existing) {
      this.selectedRoom = existing;
      this.moveRoomSelection = existing;
      this.hideRoomInfo();
      this.buildMenu.close();
      return;
    }
    this.buildMenu.open(slot);
    this.selectedRoom = undefined;
    this.moveRoomSelection = undefined;
    this.hideRoomInfo();
  }

  private attachRoomInput(room: Room) {
    room.on('pointerdown', () => {
      if (room.mergedInto) return;
      this.selectedRoom = room;
      this.moveRoomSelection = room;
      this.hideRoomInfo();
      this.buildMenu.close();
    });
    room.on('pointerover', () => {
      if (room.mergedInto) return;
      this.rangePreview.show(room);
      this.showRoomInfo(room);
    });
    room.on('pointerout', () => {
      this.rangePreview.hide();
      this.scheduleRoomInfoHide();
    });
  }

  private clearRoomSelection() {
    this.selectedRoom = undefined;
    this.moveRoomSelection = undefined;
    this.hideRoomInfo();
  }

  private completeWave() {
    if (this.state.wave >= this.waves.totalWaves()) {
      this.endGame(true);
      return;
    }
    this.state.wave += 1;
    this.economy.addMana(10 + this.state.wave);
    const shouldReward = (this.state.wave - 1) % 3 === 0;
    this.pendingMutationAfterReward = (this.state.wave - 1) % 2 === 0;
    if (shouldReward) {
      this.state.paused = true;
      this.rewardPanel.showPanel();
      return;
    }
    this.showPendingMutation();
  }

  private showPendingMutation() {
    if (this.pendingMutationAfterReward) {
      this.pendingMutationAfterReward = false;
      this.state.paused = true;
      this.mutationPanel.showChoices(this.mutations.choices());
    }
  }

  private endGame(won: boolean) {
    if (this.state.won || this.state.lost) return;
    this.state.won = won;
    this.state.lost = !won;
    this.audio.play(won ? 'win' : 'loss');
    this.scene.start('GameOverScene', {
      won,
      stats: {
        wave: this.state.wave,
        roomsBuilt: this.state.roomsBuilt,
        bossesDefeated: this.state.bossesDefeated,
        evolvedFusions: this.state.evolvedFusions,
        enemiesDefeated: this.state.enemiesDefeated,
        leaks: this.state.leaks,
        combosDiscovered: this.state.unlockedComboIds.length,
      },
    });
  }

  private refreshUi() {
    this.hud.refresh();
    this.wavePreview.refresh();
  }

  private handleEscape() {
    if (this.escapeMenu.isOpen()) {
      this.closeEscapeMenu();
      return;
    }
    if (this.buildMenu.visible || this.roomInfo.visible || this.tutorial?.visible || this.selectedRoom || this.moveRoomSelection) {
      this.buildMenu.close();
      this.tooltip.hide();
      this.tutorial?.setVisible(false);
      this.clearRoomSelection();
      return;
    }
    if (this.mutationPanel.visible) return;
    if (this.rewardPanel.visible) return;
    this.openEscapeMenu();
  }

  private openEscapeMenu() {
    this.state.paused = true;
    this.tooltip.hide();
    this.hideRoomInfo();
    this.buildMenu.close();
    this.rangePreview.hide();
    this.escapeMenu.open(this.state.unlockedComboIds, this.build.rooms.map((room) => room.def.id));
    this.escapeMenu.setVolumeLabel(this.audio.volumeLabel());
    this.refreshUi();
  }

  private closeEscapeMenu() {
    this.escapeMenu.closePanel();
    this.state.paused = false;
    this.refreshUi();
  }

  private recordUnlockedCombos(combos: Array<{ id: string }>) {
    combos.forEach((combo) => {
      if (!this.state.unlockedComboIds.includes(combo.id)) this.state.unlockedComboIds.push(combo.id);
    });
  }

  private applyPostWaveReward(reward: PostWaveReward) {
    this.rewardPanel.hidePanel();
    if (reward === 'mana') this.economy.addMana(55);
    if (reward === 'essence') this.economy.addEssence(2);
    if (reward === 'heart') this.state.heartHp = Math.min(20, this.state.heartHp + 4);
    if (reward === 'mutation') {
      this.pendingMutationAfterReward = false;
      this.mutationPanel.showChoices(this.mutations.choices());
      return;
    }
    if (this.pendingMutationAfterReward) {
      this.showPendingMutation();
      return;
    }
    this.state.paused = false;
  }

  private applyRoomMoodBonuses() {
    const musicalWalls = this.mutations.has('walls_learn_music');
    this.build.rooms.forEach((room) => {
      const boosted = musicalWalls && (room.def.id === 'moon_bell' || room.def.id === 'storm_harp');
      room.setRangeMultiplier(boosted ? 1.1 : 1);
    });
  }

  private moveCost() {
    if (this.state.wave < 4) return 0;
    return Math.min(18, 4 + this.state.wave);
  }

  private checkHeartPanic() {
    if (this.state.heartHp > 5 || this.state.heartPanicTriggered) return;
    this.state.heartPanicTriggered = true;
    this.audio.play('boss');
    this.showFloatingText(640, 102, 'HEART PANIC: the tower fights harder', '#ff9bb9');
    this.cameras.main.flash(360, 255, 93, 165, false);
  }

  private checkLeaks() {
    if (this.state.leaks === this.lastLeakCount) return;
    this.lastLeakCount = this.state.leaks;
    this.cameras.main.shake(150, 0.006);
    this.cameras.main.flash(140, 255, 80, 120, false);
  }

  private showRoomInfo(room: Room) {
    this.roomInfoHideTimer?.remove(false);
    this.roomInfo.refresh(room);
    this.roomInfo.setVisible(true);
  }

  private scheduleRoomInfoHide() {
    this.roomInfoHideTimer?.remove(false);
    this.roomInfoHideTimer = this.time.delayedCall(420, () => {
      if (!this.roomInfoHovered) this.hideRoomInfo();
    });
  }

  private hideRoomInfo() {
    this.roomInfoHideTimer?.remove(false);
    this.roomInfo.setVisible(false);
  }

  private showFloatingText(x: number, y: number, copy: string, color: string) {
    const text = this.add.text(x, y, copy, { fontSize: '13px', color, fontStyle: 'bold' }).setOrigin(0.5).setDepth(720);
    this.tweens.add({ targets: text, y: y - 24, alpha: 0, duration: 780, onComplete: () => text.destroy() });
  }

  private decorateBackground() {
    const mist = this.add.graphics();
    mist.fillStyle(0x180d22, 0.96).fillRect(0, 0, 1280, 720);
    mist.fillStyle(0x2b1838, 0.46).fillEllipse(640, 730, 1180, 270);
    mist.fillStyle(0x12332b, 0.14).fillEllipse(210, 600, 430, 160);
    mist.fillStyle(0x39204f, 0.18).fillEllipse(1060, 592, 460, 190);

    const moon = this.add.container(1094, 116);
    moon.add(this.add.circle(0, 0, 54, 0xf3e6bb, 0.72));
    moon.add(this.add.circle(18, -8, 51, 0x180d22, 0.86));
    moon.add(this.add.circle(-10, 6, 86, 0xffe1a1, 0.06));
    this.tweens.add({ targets: moon, y: 124, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.drawPassingClouds();
    this.scheduleLightning();

    const leftThreat = this.add.container(136, 515).setAlpha(0.2);
    leftThreat.add(this.add.ellipse(0, 0, 104, 58, 0xd95f9d, 0.32).setStrokeStyle(2, 0xffc4db, 0.3));
    leftThreat.add(this.add.triangle(42, -2, 0, -24, 88, 0, 0, 24, 0xf18bbf, 0.32));
    leftThreat.add(this.add.circle(-28, -8, 7, 0xfff0bd, 0.42));
    this.tweens.add({ targets: leftThreat, x: 162, y: 500, alpha: 0.32, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    const rightThreat = this.add.container(1148, 488).setAlpha(0.18);
    rightThreat.add(this.add.circle(0, 0, 48, 0x8fb8ff, 0.28).setStrokeStyle(2, 0xd9f1ff, 0.28));
    rightThreat.add(this.add.circle(0, 0, 28, 0x10192c, 0.76));
    const hand = this.add.graphics();
    hand.lineStyle(3, 0xffe577, 0.36).lineBetween(0, 0, 0, -34).lineBetween(0, 0, 32, 12);
    rightThreat.add(hand);
    this.tweens.add({ targets: rightThreat, x: 1126, y: 502, angle: 8, alpha: 0.3, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    for (let i = 0; i < 95; i += 1) {
      const star = this.add.circle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(58, 700), Phaser.Math.Between(1, 3), i % 4 === 0 ? 0x77f0c2 : 0xffe1a1, Phaser.Math.FloatBetween(0.08, 0.44));
      this.tweens.add({ targets: star, alpha: Phaser.Math.FloatBetween(0.04, 0.62), duration: Phaser.Math.Between(900, 2400), yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 900) });
    }

    for (let i = 0; i < 18; i += 1) {
      const mote = this.add.star(Phaser.Math.Between(80, 1200), Phaser.Math.Between(170, 690), 5, 2, 5, i % 2 ? 0xbdf4ff : 0xffdf8f, 0.24);
      this.tweens.add({ targets: mote, x: mote.x + Phaser.Math.Between(-18, 18), y: mote.y - Phaser.Math.Between(28, 72), angle: 180, alpha: 0.06, duration: Phaser.Math.Between(2200, 4200), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  private drawPassingClouds() {
    for (let i = 0; i < 5; i += 1) {
      const cloud = this.add.container(-180 + i * 310, 96 + (i % 3) * 56).setAlpha(0.12 + i * 0.015).setDepth(3);
      const tint = i % 2 ? 0xd8c7f2 : 0xbdf4ff;
      cloud.add(this.add.ellipse(0, 16, 160, 42, tint, 0.34));
      cloud.add(this.add.ellipse(48, 8, 118, 34, tint, 0.28));
      cloud.add(this.add.ellipse(-58, 10, 104, 32, tint, 0.22));
      cloud.add(this.add.rectangle(6, 24, 190, 18, tint, 0.16));
      this.tweens.add({
        targets: cloud,
        x: 1460,
        duration: 42000 + i * 5200,
        repeat: -1,
        delay: i * 1900,
        onRepeat: () => {
          cloud.x = -220;
          cloud.y = Phaser.Math.Between(82, 244);
        },
      });
    }
  }

  private scheduleLightning() {
    this.time.delayedCall(Phaser.Math.Between(5200, 11800), () => {
      this.flashLightning();
      this.scheduleLightning();
    });
  }

  private flashLightning() {
    const x = Phaser.Math.Between(70, 1210);
    const top = Phaser.Math.Between(58, 150);
    const bolt = this.add.graphics().setDepth(6);
    bolt.lineStyle(4, 0xf7f2ff, 0.76);
    bolt.beginPath();
    bolt.moveTo(x, top);
    let px = x;
    let py = top;
    for (let i = 0; i < 5; i += 1) {
      px += Phaser.Math.Between(-42, 42);
      py += Phaser.Math.Between(24, 54);
      bolt.lineTo(px, py);
    }
    bolt.strokePath();
    bolt.lineStyle(2, 0xbdf4ff, 0.58).lineBetween(px - 34, py - 28, px + 18, py + 16);
    const flash = this.add.rectangle(0, 0, 1280, 720, 0xded8ff, 0.08).setOrigin(0).setDepth(5);
    this.tweens.add({ targets: [bolt, flash], alpha: 0, duration: 180, onComplete: () => {
      bolt.destroy();
      flash.destroy();
    } });
  }
}
