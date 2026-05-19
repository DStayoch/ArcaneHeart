import Phaser from 'phaser';
import type { Room } from '../entities/Room';
import { tagsText } from '../utils/formatting';
import type { TargetPriority } from '../core/types';

const priorities: TargetPriority[] = ['first', 'last', 'strongest', 'weakest', 'fastest', 'cluster', 'boss', 'burning', 'unmarked'];

export class RoomInfoPanel extends Phaser.GameObjects.Container {
  private copy: Phaser.GameObjects.Text;
  private economyText: Phaser.GameObjects.Text;
  private targetText: Phaser.GameObjects.Text;
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
    const hoverZone = scene.add.zone(0, 0, 330, 246).setOrigin(0).setInteractive();
    this.copy = scene.add.text(14, 14, 'Select a room for upgrades.', { fontSize: '12px', color: '#fff0cf', wordWrap: { width: 300 }, lineSpacing: 2 });
    this.economyText = scene.add.text(14, 144, '', { fontSize: '12px', color: '#ffe29a' });
    this.targetText = scene.add.text(14, 160, '', { fontSize: '12px', color: '#bdf4ff' });
    const upgrade = this.button(14, 180, 'Upgrade');
    const sell = this.button(98, 180, 'Sell');
    const target = this.button(154, 180, 'Target');
    const focus = this.button(224, 180, 'Focus');
    this.evolveButton = this.button(14, 214, 'Evolve Fusion');
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
    hoverZone.on('pointerover', () => this.onHoverChange?.(true));
    hoverZone.on('pointerout', () => this.onHoverChange?.(false));
    this.add([panel, hoverZone, this.copy, this.economyText, this.targetText, upgrade, sell, target, focus, this.evolveButton]);
    this.setDepth(220);
    this.setSize(330, 246);
    this.setVisible(false);
    scene.add.existing(this);
  }

  refresh(room?: Room) {
    this.room = room;
    if (!room) {
      if (this.signature === 'empty') return;
      this.signature = 'empty';
      this.copy.setText('Select a room for upgrades.');
      this.economyText.setText('');
      this.targetText.setText('');
      return;
    }
    const signature = `${room.id}:${room.level}:${room.priority}:${room.upgradeFocus}:${Math.round(room.previewRange())}:${room.activeFusion?.id ?? ''}:${room.mergedInto ?? ''}:${room.evolvedFusion}`;
    if (signature === this.signature) return;
    this.signature = signature;
    const fusionText = room.fusedCombo
      ? `\nFusion: ${room.evolvedFusion ? room.evolutionTitle() : room.fusedCombo.name}\nEssence: ${room.evolvedFusion ? 'EVOLVED' : `${room.evolutionCost()} to evolve`}`
      : '';
    this.evolveButton.setAlpha(room.canEvolve() ? 1 : 0.38);
    this.copy.setText(`${room.def.name}   Level ${room.level}\n${tagsText(room.def.tags)}\nDamage ${Math.round(room.damage())}  Range ${Math.round(room.previewRange())}\nFocus: ${room.upgradeFocus}\n${room.def.effect}${fusionText}`);
    this.economyText.setText(`Upgrade ${room.level >= 3 ? 'MAX' : `${room.upgradeCost()} Mana`}   Sell ${room.sellValue()}`);
    this.targetText.setText(`Target: ${room.priority}`);
  }

  private button(x: number, y: number, label: string) {
    const text = this.scene.add.text(x, y, label, { fontSize: '13px', color: '#130d18', backgroundColor: '#f0cf83', padding: { x: 8, y: 6 } }).setInteractive({ useHandCursor: true });
    text.on('pointerover', () => this.onHoverChange?.(true));
    text.on('pointerout', () => this.onHoverChange?.(false));
    return text;
  }
}
