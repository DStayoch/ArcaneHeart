import Phaser from 'phaser';
import { createGameState, type GameState } from '../core/GameState';
import { roomDefinitions } from '../data/rooms';
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
        this.roomInfo.refresh(anchor);
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
      this.roomInfo.refresh(room);
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
      this.roomInfo.refresh(room);
    };
    this.roomInfo.onSell = (room) => {
      this.build.sell(room, this.tower.slots);
      this.audio.play('sell');
      this.selectedRoom = undefined;
      this.roomInfo.refresh();
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
      if (this.waves.startWave()) this.audio.play(this.state.wave === 10 ? 'boss' : 'wave');
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
        this.roomInfo.refresh(this.moveRoomSelection);
        this.tooltip.hide();
        this.moveRoomSelection = undefined;
        this.clearRoomSelection();
        return;
      }
    }
    const existing = this.build.rooms.find((room) => room.slotId === slot.model.id);
    if (existing) {
      this.selectedRoom = existing;
      this.moveRoomSelection = existing;
      this.roomInfo.refresh(existing);
      this.buildMenu.close();
      return;
    }
    this.buildMenu.open(slot);
    this.selectedRoom = undefined;
    this.moveRoomSelection = undefined;
    this.roomInfo.refresh();
  }

  private attachRoomInput(room: Room) {
    room.on('pointerdown', () => {
      if (room.mergedInto) return;
      this.selectedRoom = room;
      this.moveRoomSelection = room;
      this.roomInfo.refresh(room);
      this.buildMenu.close();
    });
    room.on('pointerover', () => {
      const def = roomDefinitions[room.def.id];
      const fusion = room.activeFusion ? `\n\nMERGED: ${room.activeFusion.name}\n${room.activeFusion.description}` : room.mergedInto ? '\n\nAbsorbed into a merged room.' : '';
      const moveHint = this.state.waveActive ? '\nMove: disabled during waves.' : '\nClick this room, then click any empty slot to move it.';
      this.tooltip.show(room.x + 58, room.y - 22, `${def.name}\nLevel ${room.level} | ${def.cost} Mana base\n${def.effect}\n${def.personality}${fusion}${moveHint}`);
    });
    room.on('pointerout', () => this.tooltip.hide());
  }

  private clearRoomSelection() {
    this.selectedRoom = undefined;
    this.moveRoomSelection = undefined;
    this.roomInfo.refresh();
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
    this.roomInfo.refresh(this.selectedRoom);
  }

  private decorateBackground() {
    for (let i = 0; i < 35; i += 1) {
      this.add.circle(Phaser.Math.Between(0, 1280), Phaser.Math.Between(55, 720), Phaser.Math.Between(1, 2), 0xffe1a1, Phaser.Math.FloatBetween(0.05, 0.24));
    }
  }
}
