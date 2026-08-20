import { Timestamp } from 'firebase/firestore';

export interface Tournament {
  id: string;
  title: string;
  description: string;
  rules: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
  targetSpecies: string[];
  metric: 'length' | 'weight' | 'both';
  prize: string;
  prizeValue?: number;
  entryFeeType: 'gratis' | 'pago';
  entryFeeAmount?: number;
  teamFormat: 'solo' | 'dupla' | 'trio' | 'quarteto';
  keyword: string;
  imageUrl: string;
  participantCount: number;
}

export interface Catch {
  id: string;
  tournamentId: string;
  tournamentTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  species: string;
  length: number; // in cm
  weight?: number; // in kg (optional)
  location: string;
  photoUrl: string; // Base64 or standard URL
  createdAt: any; // Firestore Timestamp
  status: 'pending' | 'approved' | 'rejected';
  verifiedByAI: boolean;
  aiFeedback?: {
    identifiedSpecies: string;
    confidence: number;
    estimatedLength: string;
    description: string;
    complianceCheck: boolean;
  };
  moderatorNotes?: string;
  likes?: string[]; // userIds who liked it
  comments?: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'participant';
  createdAt: any;
}
