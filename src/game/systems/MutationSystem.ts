import type { GameState } from '../core/GameState';
import type { MutationDefinition } from '../core/types';
import { mutationDefinitions } from '../data/mutations';
import { sample } from '../utils/random';

export class MutationSystem {
  constructor(private state: GameState) {}

  choices() {
    const unused = mutationDefinitions.filter((mutation) => !this.state.activeMutations.some((active) => active.id === mutation.id));
    return sample(unused.length ? unused : mutationDefinitions, 3);
  }

  apply(mutation: MutationDefinition) {
    if (!this.state.activeMutations.some((active) => active.id === mutation.id)) {
      this.state.activeMutations.push(mutation);
    }
  }

  has(id: string) {
    return this.state.activeMutations.some((mutation) => mutation.id === id);
  }
}
