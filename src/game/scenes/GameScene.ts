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
import { Hud } from '../ui/Hud';
import { MutationChoicePanel } from '../ui/MutationChoicePanel';
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
  private wavePreview!: WavePreview;
  private mutationPanel!: MutationChoicePanel;
  private roomInfo!: RoomInfoPanel;
  private tutorial?: TutorialPanel;
  private audio!: AudioSystem;
  private fx!: VisualEffectsSystem;
  private selectedRoom?: Room;
  private moveRoomSelection?: Room;
  private roomInfoHideTimer?: Phaser.Time.TimerEvent;
  private roomInfoHovered = false;
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
    this.state.activeCombos = this.combos.update(this.build.rooms);
    if (this.waves.update()) this.completeWave();
    if (this.state.heartHp <= 0) this.endGame(false);
    this.refreshUi();
  }

  private createUi() {
    this.tooltip = new Tooltip(this);
    this.hud = new Hud(this, this.state, this.waves, this.tooltip);
    this.combos = new ComboSystem(this, this.tooltip, this.fx, (anchor, contributors, combo) => {
      this.build.consumeFusion(anchor, contributors, combo, this.tower.slots);
      if (this.selectedRoom && contributors.includes(this.selectedRoom)) {
        this.selectedRoom = anchor;
      }
    });
    this.wavePreview = new WavePreview(this, this.waves);
    this.buildMenu = new BuildMenu(this, this.state);
    this.roomInfo = new RoomInfoPanel(this);
    this.mutationPanel = new MutationChoicePanel(this);
    this.buildMenu.onBuild = (slot, roomId) => {
      this.audio.unlock();
      const room = this.build.build(slot, roomId);
      if (room) this.attachRoomInput(room);
      if (room) this.audio.play('build');
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
    this.roomInfo.onEvolve = (room) => {
      if (!room.canEvolve()) return;
      if (!this.economy.spendEssence(room.evolutionCost())) {
        this.showFloatingText(room.x, room.y - 38, 'Need more Essence', '#d8c0ff');
        return;
      }
      if (room.evolveFusion()) {
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
      this.mutationPanel.hidePanel();
      this.state.paused = false;
    };
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
    this.input.keyboard?.on('keydown-ESC', () => {
      this.buildMenu.close();
      this.tooltip.hide();
      this.tutorial?.setVisible(false);
      this.clearRoomSelection();
    });
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, targets: Phaser.GameObjects.GameObject[]) => {
      if (targets.length === 0) this.clearRoomSelection();
    });
  }

  private openSlot(slot: BuildSlot) {
    if (this.moveRoomSelection && !this.state.waveActive && !slot.model.roomId) {
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
      this.showRoomInfo(room);
    });
    room.on('pointerout', () => this.scheduleRoomInfoHide());
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
    this.economy.addMana(18 + this.state.wave * 2);
    if ((this.state.wave - 1) % 2 === 0) {
      this.state.paused = true;
      this.mutationPanel.showChoices(this.mutations.choices());
    }
  }

  private endGame(won: boolean) {
    if (this.state.won || this.state.lost) return;
    this.state.won = won;
    this.state.lost = !won;
    this.audio.play(won ? 'win' : 'loss');
    this.scene.start('GameOverScene', { won });
  }

  private refreshUi() {
    this.hud.refresh();
    this.wavePreview.refresh();
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
}
