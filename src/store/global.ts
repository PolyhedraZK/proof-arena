import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { type GoogleUserInfoType } from '@/services/user';

export type GlobalState = {
  user: GoogleUserInfoType | undefined;
  isLogin: boolean;
  mobileNav: boolean;
};

type GlobalActions = {
  update: (key: keyof GlobalState, value: any) => void;
};

interface GlobalStore extends GlobalState, GlobalActions {}

export const useGlobalStore = create<GlobalStore>()(
  immer(
    devtools(set => ({
      user: undefined,
      isLogin: false,
      mobileNav: false,
      update: (key, value) => {
        set(state => {
          state[key] = value;
        });
      },
    }))
  )
);
