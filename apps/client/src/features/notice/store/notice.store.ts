import { create } from 'zustand';

type Notice = { message: string; id: number };

type NoticeState = {
  current: Notice | null;
};

type NoticeActions = {
  show: (message: string) => void;
  dismiss: () => void;
};

let counter = 0;

const useNoticeStore = create<NoticeState & NoticeActions>((set) => ({
  current: null,
  show: (message) => {
    counter += 1;
    set({ current: { message, id: counter } });
  },
  dismiss: () => set({ current: null }),
}));

export { useNoticeStore };
export type { Notice };
