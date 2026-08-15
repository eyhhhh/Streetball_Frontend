import { create } from 'zustand';
import { Court } from '@/types';

interface CourtState {
  courts: Court[];
  selectedCourt: Court | null;
  setCourts: (courts: Court[]) => void;
  setSelectedCourt: (court: Court | null) => void;
}

export const useCourtStore = create<CourtState>((set) => ({
  courts: [],
  selectedCourt: null,
  setCourts: (courts) => set({ courts }),
  setSelectedCourt: (court) => set({ selectedCourt: court }),
}));
