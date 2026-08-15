export interface Game {
  gameId: number;
  courtId: number;
  courtName: string;
  locationLat: number;
  locationLng: number;
  scheduledTime: string;
  maxPlayers: number;
  currentPlayers: number;
  status: string;
  hostName: string | null;
  referee: string | null;
  playerNames: string[];
  spectatorNames: string[];
  createdAt: string;
  hasBall: boolean;
}

export interface GetNearbyGamesResponse {
  success: boolean;
  data: Game[];
}

// GameResponse는 Game 객체를 직접 반환
export type GameResponse = Game;
