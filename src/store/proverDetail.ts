import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { IProverItem } from '@/services/prover/types';

export type ProverDetailState = {
  prover: IProverItem | undefined;
  openProverDropdown: boolean;
};

type ProverDetailActions = {
  update: (key: keyof ProverDetailState, value: any) => void;
};

interface ProverDetailStore extends ProverDetailState, ProverDetailActions {}

export const useProverDetailStore = create<ProverDetailStore>()(
  immer(set => ({
    prover: undefined,
    // // todo 完成后改为false
    openProverDropdown: false,
    update: (key, value) => {
      set(state => {
        state[key] = value;
      });
    },
  }))
);
