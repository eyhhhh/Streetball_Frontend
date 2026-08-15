import { create } from 'zustand';
import { Game } from '@/types';

interface GameState {
  games: Game[];
  selectedGame: Game | null;
  setGames: (games: Game[]) => void;
  setSelectedGame: (game: Game | null) => void;
  addGame: (game: Game) => void;
  updateGame: (id: number, updates: Partial<Game>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  games: [],
  selectedGame: null,
  setGames: (games) => set({ games }),
  setSelectedGame: (game) => set({ selectedGame: game }),
  addGame: (game) => set((state) => ({ games: [...state.games, game] })),
  updateGame: (id, updates) =>
    set((state) => ({
      games: state.games.map((game) => (game.gameId === id ? { ...game, ...updates } : game)),
    })),
}));
