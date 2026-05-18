import type { GameState } from '../core/GameState';

export class EconomySystem {
  constructor(private state: GameState) {}

  canSpendMana(cost: number) {
    return this.state.mana >= cost;
  }

  spendMana(cost: number) {
    if (!this.canSpendMana(cost)) return false;
    this.state.mana -= cost;
    return true;
  }

  addMana(amount: number) {
    this.state.mana += Math.max(0, Math.round(amount));
  }

  addEssence(amount: number) {
    this.state.essence += Math.max(0, Math.round(amount));
  }

  canSpendEssence(cost: number) {
    return this.state.essence >= cost;
  }

  spendEssence(cost: number) {
    if (!this.canSpendEssence(cost)) return false;
    this.state.essence -= cost;
    return true;
  }
}
