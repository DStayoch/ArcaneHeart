import Phaser from 'phaser';
import { comboDefinitions } from '../data/combos';
import { roomDefinitions } from '../data/rooms';
import type { VolumeLevel } from '../systems/AudioSystem';

export class EscapeMenu extends Phaser.GameObjects.Container {
  private comboRows: Phaser.GameObjects.GameObject[] = [];
  private quitMessage: Phaser.GameObjects.Text;
  private volumeButton: Phaser.GameObjects.Text;
  onResume?: () => void;
  onStartScreen?: () => void;
  onVolumeCycle?: () => VolumeLevel;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    const veil = scene.add.rectangle(0, 0, 1280, 720, 0x050309, 0.68).setOrigin(0);
    const panel = scene.add.rectangle(640, 360, 650, 560, 0x120b19, 0.97).setStrokeStyle(3, 0xffdf8f, 0.9);
    const glow = scene.add.ellipse(640, 360, 720, 620, 0x9f6bff, 0.08).setStrokeStyle(2, 0xbdf4ff, 0.16);
    const title = scene.add.text(640, 106, 'Night Watch Paused', { fontSize: '34px', color: '#ffe29a', fontStyle: 'bold' }).setOrigin(0.5);
    const subtitle = scene.add.text(640, 145, 'Unlocked spell sentences and mysteries still sleeping in the tower.', { fontSize: '14px', color: '#d8c7f2' }).setOrigin(0.5);
    const comboTitle = scene.add.text(350, 184, 'Fusion Codex', { fontSize: '17px', color: '#bdf4ff', fontStyle: 'bold' });
    const resume = this.button(350, 602, 'Resume');
    const start = this.button(474, 602, 'Start Screen');
    const quit = this.button(632, 602, 'Quit');
    this.volumeButton = this.button(724, 602, 'Volume Full');
    this.quitMessage = scene.add.text(350, 650, '', { fontSize: '12px', color: '#d8c0ff', wordWrap: { width: 570 } });

    resume.on('pointerdown', () => this.onResume?.());
    start.on('pointerdown', () => this.onStartScreen?.());
    quit.on('pointerdown', () => this.quitGame());
    this.volumeButton.on('pointerdown', () => {
      const volume = this.onVolumeCycle?.();
      if (volume) this.setVolumeLabel(volume);
    });

    this.add([veil, glow, panel, title, subtitle, comboTitle, resume, start, quit, this.volumeButton, this.quitMessage]);
    this.setDepth(900).setVisible(false);
    scene.add.existing(this);
  }

  open(unlockedComboIds: string[], builtRoomIds: string[] = []) {
    this.renderCombos(unlockedComboIds, builtRoomIds);
    this.quitMessage.setText('');
    this.setVisible(true);
  }

  setVolumeLabel(volume: VolumeLevel) {
    this.volumeButton.setText(`Volume ${volume}`);
  }

  closePanel() {
    this.setVisible(false);
  }

  isOpen() {
    return this.visible;
  }

  private renderCombos(unlockedComboIds: string[], builtRoomIds: string[]) {
    const unlocked = new Set(unlockedComboIds);
    const built = new Set(builtRoomIds);
    this.comboRows.forEach((row) => row.destroy());
    this.comboRows = [];
    comboDefinitions.forEach((combo, index) => {
      const x = 350 + (index % 2) * 294;
      const y = 214 + Math.floor(index / 2) * 60;
      const known = unlocked.has(combo.id);
      const row = this.scene.add.container(x, y);
      const bg = this.scene.add.rectangle(0, 0, 276, 50, known ? 0x21162d : 0x100916, known ? 0.96 : 0.74).setOrigin(0).setStrokeStyle(1, known ? combo.color : 0x6e557b, known ? 0.9 : 0.55);
      const rooms = combo.roomIds.map((id) => built.has(id) || known ? roomDefinitions[id].name : '?').join(' + ');
      const name = known ? combo.name : `Locked: ${combo.name}`;
      const knownPieces = combo.roomIds.filter((id) => built.has(id)).length;
      const detail = known ? combo.description : knownPieces ? `Hint: ${rooms}` : `Find compatible rooms to reveal hints.`;
      const label = this.scene.add.text(12, 6, `${known ? 'Unlocked' : 'Unknown'} - ${name}\n${detail}`, {
        fontSize: '11px',
        color: known ? '#fff0bd' : '#9f91ad',
        wordWrap: { width: 252, useAdvancedWrap: true },
        lineSpacing: 2,
      });
      row.add([bg, label]);
      this.comboRows.push(row);
      this.add(row);
    });
  }

  private button(x: number, y: number, label: string) {
    const text = this.scene.add.text(x, y, label, {
      fontSize: '14px',
      color: '#120b19',
      backgroundColor: '#f0cf83',
      padding: { x: 13, y: 8 },
      fontStyle: 'bold',
    }).setInteractive({ useHandCursor: true });
    text.on('pointerover', () => text.setStyle({ backgroundColor: '#ffe09b' }));
    text.on('pointerout', () => text.setStyle({ backgroundColor: '#f0cf83' }));
    return text;
  }

  private quitGame() {
    window.close();
    this.quitMessage.setText('If the tab stays open, your browser blocked scripts from closing it. You can close this tab manually.');
  }
}
