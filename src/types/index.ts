export interface GPSCoord {
  lat: number;
  lng: number;
}

export interface BasketLocation extends GPSCoord {
  basketNumber: number;
  id: string;
  name: string;
  color: string;
  model: string;
  servesHoles: number[];
}

export interface HoleData {
  number: number;
  name: string;
  par: number;
  distanceFt: number;
  distanceM: number;
  tee: {
    id: string;
    name: string;
    lat: number;
    lng: number;
  };
  basket: {
    id: string;
    basketNumber: number;
    name: string;
    lat: number;
    lng: number;
    color: string;
  };
  doglegs: GPSCoord[];
  notes?: string;
  isSafari?: boolean;
}

export interface CourseLayout {
  id: string; // '9-hole' | '6-hole'
  name: string; // '9 Hole' | '6 Hole'
  description: string;
  holeCount: number;
  totalPar: number;
  totalDistanceFt: number;
  holes: HoleData[];
}

export interface CourseData {
  id: string;
  name: string;
  location: string;
  propertyCoordinates: GPSCoord;
  totalPar: number;
  totalDistanceFt: number;
  holeCount: number;
  basketCount: number;
  baskets: BasketLocation[];
  holes: HoleData[];
  layouts?: CourseLayout[];
  rules: {
    access: string;
    byob: boolean;
    caddieNotes: string[];
    history: string;
  };
}

export interface PlayerScore {
  strokes: number;
  putts?: number;
  penalties?: number;
}

export interface PlayerLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: number;
}

export interface MeasuredThrow {
  id: string;
  playerId: string;
  playerName: string;
  holeNumber: number;
  distanceFt: number;
  discName?: string;
  startCoord: GPSCoord;
  endCoord: GPSCoord;
  createdAt: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  avatarIcon?: string;
  scores: Record<number, number>; // holeNumber -> strokes
  putts?: Record<number, number>;
  penalties?: Record<number, number>;
  location?: PlayerLocation;
  throws?: MeasuredThrow[];
}

export interface SkinsConfig {
  enabled: boolean;
  stakeType: 'cash' | 'beer' | 'bragging';
  stakeAmount: number; // e.g. $1 or 1 beer
  carryovers: boolean;
}

export interface SkinResult {
  holeNumber: number;
  winnerPlayerId: string | null;
  winnerName: string | null;
  tiedPlayerIds: string[];
  skinsValue: number;
  isCarryover: boolean;
}

export interface CtpWinner {
  holeNumber: number;
  playerId: string;
  playerName: string;
  distanceInches?: number;
  note?: string;
  markedAt: number;
}

export interface Round {
  id: string;
  roomCode: string;
  courseName: string;
  layoutId?: string; // '9-hole' | '6-hole'
  layoutName?: string; // '9 Hole' | '6 Hole'
  date: string;
  startedAt: number;
  completedAt?: number;
  players: Player[];
  currentHole: number;
  status: 'in_progress' | 'completed';
  updatedAt: number;
  skinsConfig?: SkinsConfig;
  ctpWinners?: Record<number, CtpWinner>; // holeNumber -> CtpWinner
  measuredThrows?: MeasuredThrow[];
}

export interface LeaderboardEntry {
  id: string;
  roundId: string;
  layoutId?: string;
  layoutName?: string;
  date: string;
  playerName: string;
  totalScore: number;
  scoreToPar: number;
  birdies: number;
  pars: number;
  bogeys: number;
  aces: number;
  holeScores: number[];
}
