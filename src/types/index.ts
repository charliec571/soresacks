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

export interface Player {
  id: string;
  name: string;
  color: string;
  avatarIcon?: string;
  scores: Record<number, number>; // holeNumber -> strokes
  putts?: Record<number, number>;
  penalties?: Record<number, number>;
}

export interface Round {
  id: string;
  roomCode: string;
  courseName: string;
  date: string;
  startedAt: number;
  completedAt?: number;
  players: Player[];
  currentHole: number;
  status: 'in_progress' | 'completed';
  updatedAt: number;
}

export interface LeaderboardEntry {
  id: string;
  roundId: string;
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
