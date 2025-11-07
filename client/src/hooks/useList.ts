import type { PaginationResponse } from 'shared/src'
import { create } from "zustand";


type ListState = {
  data: PaginationResponse | null; 
  setData: (data: PaginationResponse | null) => void;
};

export const useList = create<ListState>((set) => ({
  data: null,
  setData: (data: PaginationResponse | null) => set(() => ({ data })),
}));
