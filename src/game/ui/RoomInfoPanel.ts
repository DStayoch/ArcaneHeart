import Phaser from 'phaser';
import type { Room } from '../entities/Room';
import { tagsText } from '../utils/formatting';
import type { TargetPriority } from '../core/types';

const priorities: TargetPriority[] = ['first', 'last', 'strongest', 'weakest', 'fastest'];

export class RoomInfoPanel extends Phaser.GameObjects.Container {
  private copy: Phaser.GameObjects.Text;
  private room?: Room;
  onUpgrade?: (room: Room) => void;
  onSell?: (room: Room) => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 918, 360);
    const panel = scene.add.rectangle(0, 0, 330, 208, 0x120b19, 0.93).setOrigin(0).setStrokeStyle(2, 0x8d6ea7);
    this.copy = scene.add.text(14, 14, 'Select a room for upgrades.', { fontSize: '13px', color: '#fff0cf', wordWrap: { width: 300 }, lineSpacing: 3 });
    const upgrade = this.button(14, 150, 'Upgrade');
    const sell = this.button(118, 150, 'Sell');
    const target = this.button(200, 150, 'Target');
    upgrade.on('pointerdown', () => this.room && this.onUpgrade?.(this.room));
    sell.on('pointerdown', () => this.room && this.onSell?.(this.room));
    target.on('pointerdown', () => {
      if (!this.room) return;
      const idx = priorities.indexOf(this.room.priority);
      this.room.priority = priorities[(idx + 1) % priorities.length];
      this.refresh(this.room);
    });
    this.add([panel, this.copy, upgrade, sell, target]);
    scene.add.existing(this);
  }

  refresh(room?: Room) {
    this.room = room;
    if (!room) {
      this.copy.setText('Select a room for upgrades.');
      return;
    }
    this.copy.setText(`${room.def.name}   Level ${room.level}\n${tagsText(room.def.tags)}\nDamage ${Math.round(room.damage())}  Range ${Math.round(room.range())}\n${room.def.effect}\nUpgrade ${room.level >= 3 ? 'MAX' : `${room.upgradeCost()} Mana`}   Sell ${room.sellValue()} Mana\nTargeting: ${room.priority}`);
  }

  private button(x: number, y: number, label: string) {
    return this.scene.add.text(x, y, label, { fontSize: '13px', color: '#130d18', backgroundColor: '#f0cf83', padding: { x: 8, y: 6 } }).setInteractive({ useHandCursor: true });
  }
}
