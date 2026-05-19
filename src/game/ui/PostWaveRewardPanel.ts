import Phaser from 'phaser';

export type PostWaveReward = 'mana' | 'essence' | 'heart' | 'mutation';

interface RewardCard {
  id: PostWaveReward;
  title: string;
  body: string;
  color: number;
}

const rewards: RewardCard[] = [
  { id: 'mana', title: 'Mana Windfall', body: '+55 Mana for immediate rebuilding.', color: 0x77f0c2 },
  { id: 'essence', title: 'Essence Shard', body: '+2 Essence for fusion evolution.', color: 0xd8c0ff },
  { id: 'heart', title: 'Heart Stitch', body: 'Restore 4 Arcane Heart HP.', color: 0xff9bb9 },
  { id: 'mutation', title: 'Tower Dream', body: 'Choose an extra tower mood now.', color: 0xffdf8f },
];

export class PostWaveRewardPanel extends Phaser.GameObjects.Container {
  onChoose?: (reward: PostWaveReward) => void;

  constructor(scene: Phaser.Scene) {
    super(scene, 320, 166);
    this.setDepth(620).setVisible(false);
    scene.add.existing(this);
  }

  showPanel() {
    this.removeAll(true);
    this.add(this.scene.add.rectangle(0, 0, 640, 342, 0x130c1d, 0.97).setOrigin(0).setStrokeStyle(2, 0xffdf8f));
    this.add(this.scene.add.text(24, 18, 'The tower exhales. Choose a boon.', { fontSize: '23px', color: '#ffe39d', fontStyle: 'bold' }));
    rewards.forEach((reward, index) => {
      const x = 24 + (index % 2) * 302;
      const y = 70 + Math.floor(index / 2) * 112;
      const card = this.scene.add.rectangle(x, y, 278, 88, reward.color, 0.18).setOrigin(0).setStrokeStyle(2, reward.color, 0.72);
      const title = this.scene.add.text(x + 16, y + 12, reward.title, { fontSize: '16px', color: '#fff0bd', fontStyle: 'bold' });
      const body = this.scene.add.text(x + 16, y + 38, reward.body, { fontSize: '13px', color: '#f6e8ce', wordWrap: { width: 238 }, lineSpacing: 3 });
      const hit = this.scene.add.zone(x, y, 278, 88).setOrigin(0).setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => card.setFillStyle(reward.color, 0.3).setStrokeStyle(3, 0xffffff, 0.92));
      hit.on('pointerout', () => card.setFillStyle(reward.color, 0.18).setStrokeStyle(2, reward.color, 0.72));
      hit.on('pointerdown', () => this.onChoose?.(reward.id));
      this.add([card, title, body, hit]);
    });
    this.setVisible(true);
  }

  hidePanel() {
    this.setVisible(false);
  }
}
