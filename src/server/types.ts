export type BirthTimeAccuracy = 'exact' | 'approximate' | 'unknown';

export interface UserInputProfile {
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm or e.g. "11:30 AM"
  birthTimeAccuracy: BirthTimeAccuracy;
  birthPlace: string;
}

export interface GeocodedLocation {
  formattedName: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface NumerologyData {
  lifePathNumber: number;
  birthdayNumber: number;
  expressionNumber: number; // Destiny
  soulUrgeNumber: number; // Hearts Desire
  personalityNumber: number;
  personalYear: number;
  isMasterLifePath: boolean;
  masterNotes?: string[];
}

export interface PlanetaryPosition {
  name: string;
  symbol: string;
  sign: string;
  longitude: number;
  degreeInSign: number;
  isRetrograde: boolean;
  house?: number;
}

export interface HouseCusp {
  house: number;
  sign: string;
  degree: number;
}

export interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile';
  orb: number;
}

export interface AstrologyData {
  system: 'Western Tropical';
  sunSign: string;
  moonSign: string;
  ascendantSign?: string;
  midheavenSign?: string;
  planets: PlanetaryPosition[];
  houses?: HouseCusp[];
  aspects: PlanetaryAspect[];
  timeConfidenceNote: string;
}

export interface BehavioralData {
  socialEnergy: number; // 1-5 scale aggregated score
  planningStyle: number;
  opennessToExperience: number;
  emotionalReactivity: number;
  persistence: number;
  conflictStyle: number;
  noveltySeeking: number;
  independence: number;
  rawAnswers?: Record<string, number>;
}

export interface SessionContextData {
  sessionId: string;
  browser?: string;
  os?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  language?: string;
  timezone?: string;
  screenWidth?: number;
  screenHeight?: number;
  connectionSpeed?: string;
  saveData?: boolean;
  ipApproxLocation?: {
    city?: string;
    region?: string;
    country?: string;
  };
}

export interface AnalysisReportSchema {
  headline: string;
  summary: string;
  snapshotScores: Array<{
    trait: string;
    level: 'Very High' | 'High' | 'Moderate' | 'Low';
    description: string;
  }>;
  corePersonality: string[];
  howOthersSeeYou: string;
  strongestTraits: string[];
  blindSpots: string[];
  emotionalPatterns: string;
  relationships: string;
  loveProfile?: {
    attractionType: string;
    attachmentStyle: string;
    idealPartnerArchetype: string;
    redFlagsInLove: string;
    currentLoveTiming: string;
  };
  careerAndWork: string;
  moneyAndRisk: string;
  socialBehavior: string;
  stressAndConflict: string;
  astrologyInterpretation: string;
  numerologyInterpretation: string;
  behavioralInterpretation: string;
  contradictions: Array<{
    tendencyA: string;
    tendencyB: string;
    synthesis: string;
  }>;
  strengthShadowPatterns: Array<{
    strength: string;
    shadow: string;
  }>;
  currentLifePhase: string;
  thingsYouMayRecognize: string[];
  confidenceNotes: string[];
  finalVerdict: {
    overallSummary: string;
    familyAndParents: {
      fatherDynamics: string;
      motherDynamics: string;
      siblingsAndFriends: string;
    };
    pastValidation: string[];
    futureTrajectory: string;
    balancedOverview: {
      coreStrengths40: string;
      supportiveFortune30: string;
      manageableShadows25: string;
      criticalWarnings5: string;
    };
  };
}

export interface AnalysisRecord {
  id: string;
  profile: UserInputProfile & GeocodedLocation;
  numerology: NumerologyData;
  astrology: AstrologyData;
  behavioral?: BehavioralData;
  report: AnalysisReportSchema;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  analysisId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
