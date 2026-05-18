import Phaser from 'phaser';
import { roomList } from '../data/rooms';
import type { BuildSlot } from '../entities/BuildSlot';
import type { GameState } from '../core/GameState';
import type { RoomId } from '../core/types';
import { tagsText } from '../utils/formatting';

export class BuildMenu extends Phaser.GameObjects.Container {
  private cards: Array<{
    card: Phaser.GameObjects.Container;
    bg: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
    cost: number;
  }> = [];
  private title: Phaser.GameObjects.Text;
  private activeSlot?: BuildSlot;
  onBuild?: (slot: BuildSlot, roomId: RoomId) => void;
  onHover?: (x: number, y: number, text: string) => void;
  onOut?: () => void;

  constructor(scene: Phaser.Scene, private state: GameState) {
    super(scene, 24, 70);
    const panel = scene.add.rectangle(0, 0, 302, 500, 0x120b19, 0.93).setOrigin(0).setStrokeStyle(2, 0x8d6ea7);
    this.title = scene.add.text(14, 12, 'Choose a room', { fontSize: '18px', color: '#ffe6a6', fontStyle: 'bold' });
    this.add([panel, this.title]);
    roomList.forEach((room, index) => {
      const y = 48 + index * 54;
      const card = scene.add.container(14, y);
      const affordable = () => this.state.mana >= room.cost;
      const bg = scene.add.rectangle(0, 0, 274, 46, room.color, 0.8).setOrigin(0).setStrokeStyle(1, 0xffe6a6, 0.7);
      const text = scene.add.text(10, 6, `${room.icon} ${room.name} - ${room.cost} Mana\n${tagsText(room.tags)}`, { fontSize: '12px', color: '#140d19' });
      card.add([bg, text]);
      card.setSize(274, 46).setInteractive({ useHandCursor: true });
      card.on('pointerdown', () => {
        if (this.activeSlot && affordable()) this.onBuild?.(this.activeSlot, room.id);
      });
      card.on('pointerover', () => {
        bg.setAlpha(affordable() ? 1 : 0.42);
        this.onHover?.(340, 86 + index * 54, `${room.name}\n${room.effect}\n${room.personality}\nCombo hints: try ${room.tags.includes('Fire') ? 'Mirror Hatchery or Cauldron Nursery' : room.tags.includes('Root') ? 'Moon Bell or Clockwork Orrery' : 'adjacent Noun/Verb/Modifier rooms'}.`);
      });
      card.on('pointerout', () => {
        bg.setAlpha(affordable() ? 0.8 : 0.34);
        this.onOut?.();
      });
      this.cards.push({ card, bg, text, cost: room.cost });
      this.add(card);
    });
    this.setDepth(200).setVisible(false);
    scene.add.existing(this);
  }

  open(slot: BuildSlot) {
    this.activeSlot = slot;
    this.title.setText(`Floor ${10 - slot.model.floor} ${slot.model.side}`);
    this.refreshAffordability();
    this.setVisible(true);
  }

  close() {
    this.activeSlot = undefined;
    this.setVisible(false);
  }

  private refreshAffordability() {
    this.cards.forEach(({ bg, text, cost }) => {
      const affordable = this.state.mana >= cost;
      bg.setAlpha(affordable ? 0.8 : 0.34);
      text.setAlpha(affordable ? 1 : 0.52);
    });
  }
}
