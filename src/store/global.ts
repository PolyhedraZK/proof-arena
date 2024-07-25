import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
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

// const sessionUserStr = sessionStorage.getItem('user');
// let sessionUser;
// if (sessionUserStr) {
//   try {
//     sessionUser = JSON.parse(sessionUserStr);
//   } catch (e) {
//     sessionUser = undefined;
//   }
// } else {
//   sessionUser = undefined;
// }

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
