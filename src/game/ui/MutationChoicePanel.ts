import Phaser from 'phaser';
import type { MutationDefinition } from '../core/types';

export class MutationChoicePanel extends Phaser.GameObjects.Container {
  onChoose?: (mutation: MutationDefinition) => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 370, 185);
    this.setDepth(600).setVisible(false);
    scene.add.existing(this);
  }

  showChoices(choices: MutationDefinition[]) {
    this.removeAll(true);
    this.add(this.scene.add.rectangle(0, 0, 540, 300, 0x130c1d, 0.97).setOrigin(0).setStrokeStyle(2, 0xffdf8f));
    this.add(this.scene.add.text(22, 18, 'The tower mutates. Choose a mood.', { fontSize: '22px', color: '#ffe39d', fontStyle: 'bold' }));
    choices.forEach((mutation, index) => {
      const y = 68 + index * 70;
      const card = this.scene.add.rectangle(22, y, 496, 54, 0x2a1b38, 0.95).setOrigin(0).setStrokeStyle(1, 0x9e85c4);
      const text = this.scene.add.text(38, y + 10, `${mutation.name}\n${mutation.description}`, { fontSize: '14px', color: '#fff1cd' });
      const hit = this.scene.add.zone(22, y, 496, 54).setOrigin(0).setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => card.setFillStyle(0x3a294b, 1));
      hit.on('pointerout', () => card.setFillStyle(0x2a1b38, 0.95));
      hit.on('pointerdown', () => this.onChoose?.(mutation));
      this.add([card, text, hit]);
    });
    this.setVisible(true);
  }

  hidePanel() {
    this.setVisible(false);
  }
}
