import { Timestamp } from 'firebase/firestore';

export interface CaptureWindow {
  id: string;
  name?: string; // e.g. "1ª Etapa - Abertura", "Fase Final"
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  secret?: string; // Palavra-chave ou código antifraude da janela
  description?: string;
  createdAt?: any;
}

export interface AppNotification {
  id: string;
  userId?: string; // Se direcionado a um usuário específico, ou undefined para todos os inscritos
  tournamentId?: string;
  tournamentTitle?: string;
  title: string;
  message: string;
  type: 'capture_window' | 'tournament_update' | 'team_update' | 'general';
  windowDate?: string;
  windowStartTime?: string;
  windowEndTime?: string;
  windowSecret?: string;
  readBy?: string[]; // userIds que marcaram como lido
  createdAt: any;
}

export interface TournamentWinner {
  userId?: string;
  userName: string;
  userEmail?: string;
  teamId?: string;
  teamName?: string;
  teamLogo?: string;
  trophy?: string; // Ex: "1º Lugar Geral - Campeão Ouro"
  catchSize?: number; // Ex: 68.5 (cm)
  species?: string; // Ex: "Tucunaré Azul"
  photoUrl?: string;
  notes?: string;
}

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
  teamFormat: 'solo' | 'dupla' | 'trio' | 'quarteto' | 'quinteto';
  keyword: string;
  tournamentCode?: string; // Código de participação (opcional) gerado no cadastro
  daysForRegistration?: number; // Dias de inscrição
  maxParticipants?: number; // Limite de participantes
  captureWindows?: CaptureWindow[]; // Janelas de captura válidas
  currentPhase?: string;
  imageUrl: string;
  participantCount: number;
  championInfo?: TournamentWinner;
  runnerUpInfo?: TournamentWinner;
  thirdPlaceInfo?: TournamentWinner;
  completedAt?: any;
}

export type ParticipationCategory = 'solo' | 'dupla' | 'trio' | 'quarteto' | 'quinteto';

export interface CodeUsageMember {
  userId: string;
  userName: string;
  userEmail: string;
  userCpf?: string;
  usedAt: any;
}

export interface TournamentCode {
  id: string;
  code: string; // Ex: TRN-9482-KF91 (único, nunca se repete)
  tournamentId: string;
  tournamentTitle: string;
  // Anti-fraud: Assigned to a specific registered user (Titular / Pagante)
  assignedToUserId?: string;
  assignedToUserName?: string;
  assignedToUserEmail?: string;
  assignedToUserCpf?: string;
  category?: ParticipationCategory; // 'solo' | 'dupla' | 'trio' | 'quarteto' | 'quinteto'
  maxParticipants?: number; // 1, 2, 3, 4, 5
  usedCount?: number; // quantas pessoas usaram
  usedByMembers?: CodeUsageMember[];
  paymentStatus?: 'paid' | 'pending' | 'free';
  paymentAmount?: number;
  paymentNotes?: string;
  createdAt: any;
  createdBy?: string;
  isUsed: boolean; // true quando usedCount >= maxParticipants
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
  teamId?: string;
  teamName?: string;
  teamLogo?: string;
  species: string;
  length: number; // in cm
  weight?: number; // in kg (optional)
  location: string;
  photoUrl: string; // Base64 or standard URL
  videoStartUrl?: string; // URL Vídeo Início (Fisgada)
  videoEndUrl?: string; // URL Vídeo Final (Embarque/Medição)
  createdAt: any; // Firestore Timestamp
  submittedAtFormatted?: string; // Data e horário exato local do envio (ex: 22/08/2026 às 14:32:10)
  submittedTimestamp?: number; // Epoch timestamp in ms
  captureWindowId?: string; // ID da janela de captura associada
  captureWindowName?: string; // Nome da etapa / janela
  captureWindowSecret?: string; // Palavra-chave exigida para falar no vídeo
  isWithinWindow?: boolean; // Se foi submetido dentro do horário regulamentar
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

export interface TeamMember {
  userId: string;
  userName: string;
  userEmail: string;
  userNickname?: string;
  userPhoto?: string;
  role: 'captain' | 'member';
  joinedAt: any;
}

export interface Team {
  id: string;
  name: string;
  code: string; // unique code, e.g. EQP-9482-A
  maxMembers: number; // 2 to 5 members
  logoUrl?: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  members: TeamMember[];
  tournamentIds?: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: any;
  rejectionReason?: string;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  fullName?: string;
  cpf?: string;
  email: string;
  address?: string;
  nickname?: string;
  teamId?: string;
  teamName?: string;
  teamLogo?: string;
  password?: string;
  photoURL?: string;
  role: 'admin' | 'moderator' | 'participant';
  permissions?: UserPermissions;
  status?: 'active' | 'blocked';
  enrolledTournaments?: string[];
  teamLeftAt?: any;
  createdAt: any;
}

export interface SupportMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCpf?: string;
  userPhoto?: string;
  subject: string;
  message: string;
  tournamentId?: string;
  tournamentTitle?: string;
  status: 'open' | 'answered' | 'closed';
  adminResponse?: string;
  answeredBy?: string;
  answeredByName?: string;
  answeredAt?: any;
  createdAt: any;
  updatedAt?: any;
}
