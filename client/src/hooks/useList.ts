import type { List2Response} from 'shared/src'
import { create } from "zustand";


type ListState = {
  data: List2Response | null;
  setData: (data: List2Response | null) => void;
};

export const useList = create<ListState>((set) => ({
  data: null,
  setData: (data: List2Response | null) => set(() => ({ data })),
}));
