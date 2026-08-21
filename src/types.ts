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
  tournamentCode?: string; // Código mestre / código único gerado no cadastro
  currentPhase?: string;
  imageUrl: string;
  participantCount: number;
}

export interface TournamentCode {
  id: string;
  code: string; // Ex: TRN-9482-KF91
  tournamentId: string;
  tournamentTitle: string;
  createdAt: any;
  createdBy?: string;
  isUsed: boolean;
  usedByUserId?: string;
  usedByUserName?: string;
  usedByUserEmail?: string;
  usedAt?: any;
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
  videoStartUrl?: string; // URL Vídeo Início (Fisgada)
  videoEndUrl?: string; // URL Vídeo Final (Embarque/Medição)
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

export interface UserPermissions {
  canModerateCatches?: boolean;
  canManageTournaments?: boolean;
  canManageFishermen?: boolean;
  canManageAntifraud?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  fullName?: string;
  cpf?: string;
  email: string;
  address?: string;
  nickname?: string;
  teamName?: string;
  password?: string;
  photoURL?: string;
  role: 'admin' | 'moderator' | 'participant';
  permissions?: UserPermissions;
  status?: 'active' | 'blocked';
  enrolledTournaments?: string[];
  createdAt: any;
}
