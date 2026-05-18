import Phaser from 'phaser';
import type { Room } from '../entities/Room';
import { tagsText } from '../utils/formatting';
import type { TargetPriority } from '../core/types';

const priorities: TargetPriority[] = ['first', 'last', 'strongest', 'weakest', 'fastest', 'cluster', 'boss', 'burning', 'unmarked'];

export class RoomInfoPanel extends Phaser.GameObjects.Container {
  private copy: Phaser.GameObjects.Text;
  private room?: Room;
  private signature = '__unrendered__';
  onUpgrade?: (room: Room) => void;
  onSell?: (room: Room) => void;
  onEvolve?: (room: Room) => void;
  onFocus?: (room: Room) => void;
  onHoverChange?: (hovered: boolean) => void;
  private evolveButton: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 918, 360);
    const panel = scene.add.rectangle(0, 0, 330, 246, 0x120b19, 0.93).setOrigin(0).setStrokeStyle(2, 0x8d6ea7);
    this.copy = scene.add.text(14, 14, 'Select a room for upgrades.', { fontSize: '13px', color: '#fff0cf', wordWrap: { width: 300 }, lineSpacing: 3 });
    const upgrade = this.button(14, 166, 'Upgrade');
    const sell = this.button(118, 166, 'Sell');
    const target = this.button(200, 166, 'Target');
    const focus = this.button(250, 166, 'Focus');
    this.evolveButton = this.button(14, 204, 'Evolve Fusion');
    upgrade.on('pointerdown', () => this.room && this.onUpgrade?.(this.room));
    sell.on('pointerdown', () => this.room && this.onSell?.(this.room));
    focus.on('pointerdown', () => this.room && this.onFocus?.(this.room));
    this.evolveButton.on('pointerdown', () => this.room && this.onEvolve?.(this.room));
    target.on('pointerdown', () => {
      if (!this.room) return;
      const idx = priorities.indexOf(this.room.priority);
      this.room.priority = priorities[(idx + 1) % priorities.length];
      this.refresh(this.room);
    });
    this.add([panel, this.copy, upgrade, sell, target, focus, this.evolveButton]);
    this.setDepth(220);
    this.setSize(330, 246);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 330, 246), Phaser.Geom.Rectangle.Contains);
    this.on('pointerover', () => this.onHoverChange?.(true));
    this.on('pointerout', () => this.onHoverChange?.(false));
    this.setVisible(false);
    scene.add.existing(this);
  }

  refresh(room?: Room) {
    this.room = room;
    if (!room) {
      if (this.signature === 'empty') return;
      this.signature = 'empty';
      this.copy.setText('Select a room for upgrades.');
      return;
    }
    const signature = `${room.id}:${room.level}:${room.priority}:${room.upgradeFocus}:${room.activeFusion?.id ?? ''}:${room.mergedInto ?? ''}:${room.evolvedFusion}`;
    if (signature === this.signature) return;
    this.signature = signature;
    const fusionText = room.fusedCombo
      ? `\nFusion: ${room.evolvedFusion ? room.evolutionTitle() : room.fusedCombo.name}\nEssence: ${room.evolvedFusion ? 'EVOLVED' : `${room.evolutionCost()} to evolve`}`
      : '';
    this.evolveButton.setAlpha(room.canEvolve() ? 1 : 0.38);
    this.copy.setText(`${room.def.name}   Level ${room.level}\n${tagsText(room.def.tags)}\nDamage ${Math.round(room.damage())}  Range ${Math.round(room.range())}\nFocus: ${room.upgradeFocus}\n${room.def.effect}${fusionText}\nUpgrade ${room.level >= 3 ? 'MAX' : `${room.upgradeCost()} Mana`}   Sell ${room.sellValue()} Mana\nTargeting: ${room.priority}`);
  }

  private button(x: number, y: number, label: string) {
    return this.scene.add.text(x, y, label, { fontSize: '13px', color: '#130d18', backgroundColor: '#f0cf83', padding: { x: 8, y: 6 } }).setInteractive({ useHandCursor: true });
  }
}
