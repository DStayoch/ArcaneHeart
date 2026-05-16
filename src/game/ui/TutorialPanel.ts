import Phaser from 'phaser';

interface TutorialStep {
  title: string;
  body: string;
  x: number;
  y: number;
}

const steps: TutorialStep[] = [
  {
    title: 'Welcome, caretaker',
    body: 'Monsters climb from the cellar at the bottom toward the Arcane Heart at the top. Your job is to stop them before the Heart HP reaches zero.',
    x: 385,
    y: 135,
  },
  {
    title: 'Build magical rooms',
    body: 'Click an empty slot on the left or right side of a floor. A build menu opens. Pick a room you can afford with Mana.',
    x: 92,
    y: 150,
  },
  {
    title: 'Watch your Mana',
    body: 'Your Mana is shown in the bright green badge at the top. Kills, cauldrons, and some combos give you more Mana for new rooms and upgrades.',
    x: 255,
    y: 72,
  },
  {
    title: 'Use spell sentences',
    body: 'Rooms combine when compatible rooms are adjacent on the same floor or nearby floors. Glowing lines show active combos, and the combo list appears on the right.',
    x: 670,
    y: 135,
  },
  {
    title: 'Start the wave',
    body: 'When you are ready, click Start Wave. You can pause, restart, or switch between 1x and 2x speed from the top bar.',
    x: 740,
    y: 72,
  },
  {
    title: 'Upgrade and survive',
    body: 'Click a built room to upgrade, sell, or change targeting. After every two waves, choose a tower mutation. Survive wave 10 to win.',
    x: 690,
    y: 360,
  },
];

export class TutorialPanel extends Phaser.GameObjects.Container {
  private index = 0;
  private title: Phaser.GameObjects.Text;
  private body: Phaser.GameObjects.Text;
  private count: Phaser.GameObjects.Text;
  private back: Phaser.GameObjects.Text;
  private next: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.add(scene.add.rectangle(0, 0, 348, 194, 0x110a18, 0.96).setOrigin(0).setStrokeStyle(2, 0xffdf8f));
    this.title = scene.add.text(18, 16, '', { fontSize: '19px', color: '#ffe39d', fontStyle: 'bold' });
    this.body = scene.add.text(18, 52, '', { fontSize: '14px', color: '#fff0cf', wordWrap: { width: 310 }, lineSpacing: 4 });
    this.count = scene.add.text(18, 156, '', { fontSize: '13px', color: '#cbb9e2' });
    this.back = this.button(188, 148, 'Back');
    this.next = this.button(260, 148, 'Next');
    this.add([this.title, this.body, this.count, this.back, this.next]);
    this.setDepth(650);
    this.back.on('pointerdown', () => this.go(-1));
    this.next.on('pointerdown', () => {
      if (this.index >= steps.length - 1) {
        this.setVisible(false);
        return;
      }
      this.go(1);
    });
    scene.add.existing(this);
    this.refresh();
  }

  open() {
    this.index = 0;
    this.setVisible(true);
    this.refresh();
  }

  private go(delta: number) {
    this.index = Phaser.Math.Clamp(this.index + delta, 0, steps.length - 1);
    this.refresh();
  }

  private refresh() {
    const step = steps[this.index];
    this.setPosition(step.x, step.y);
    this.title.setText(step.title);
    this.body.setText(step.body);
    this.count.setText(`${this.index + 1} / ${steps.length}`);
    this.back.setAlpha(this.index === 0 ? 0.4 : 1);
    this.next.setText(this.index === steps.length - 1 ? 'Done' : 'Next');
  }

  private button(x: number, y: number, label: string) {
    return this.scene.add.text(x, y, label, { fontSize: '13px', color: '#120b19', backgroundColor: '#f0cf83', padding: { x: 10, y: 6 } }).setInteractive({ useHandCursor: true });
  }
}
