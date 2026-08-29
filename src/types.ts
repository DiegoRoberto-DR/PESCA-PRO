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
  targetType?: 'all' | 'tournament' | 'user';
  targetUserName?: string;
  targetUserEmail?: string;
  senderName?: string;
  senderRole?: string;
  category?: 'official' | 'urgent' | 'rule' | 'reward' | 'direct' | 'general' | 'capture_window';
  tournamentId?: string;
  tournamentTitle?: string;
  title: string;
  message: string;
  type: 'capture_window' | 'tournament_update' | 'team_update' | 'general' | 'capture_window_added';
  windowDate?: string;
  windowStartTime?: string;
  windowEndTime?: string;
  windowSecret?: string;
  readBy?: string[]; // userIds que marcaram como lido
  isRead?: boolean;
  createdAt: any;
}

export interface PointRule {
  id: string;
  species?: string; // Espécie específica ou 'all'
  minCm?: number; // Tamanho mínimo em cm (inclusive)
  maxCm?: number; // Tamanho máximo em cm (inclusive)
  points: number; // Quantidade de pontos atribuídos
  description?: string; // Rótulo descritivo (ex: "30 a 39 cm = 10 pts")
}

export interface SpeciesBonusRule {
  species: string;
  bonusPoints: number;
  description?: string;
}

export interface TournamentPointsConfig {
  enabled: boolean;
  scoringMode?: 'ranges' | 'per_cm' | 'fish_count' | 'custom_rules';
  pointsPerFish?: number; // Pontos base fixos por peixe aprovado (ex: 1 ponto)
  pointsPerCm?: number; // Pontos multiplicados por centímetro (ex: 1 pt/cm)
  pointsPerCmEnabled?: boolean; // Se pontos extras por cm estão ativos
  minValidLength?: number; // Tamanho mínimo para peixe ter validade/pontuar (ex: 25 cm)
  rules?: PointRule[]; // Faixas de tamanho configuradas
  pointRules?: PointRule[]; // Alias de rules para compatibilidade
  speciesBonusEnabled?: boolean; // Toggle se bônus por espécie está ativo
  speciesBonus?: SpeciesBonusRule[]; // Bônus por espécie nobre
  customNotes?: string;
}

export interface TournamentWinner {
  position?: number; // 1, 2, 3, 4, 5, etc.
  userId?: string;
  userName: string;
  userEmail?: string;
  teamId?: string;
  teamName?: string;
  teamLogo?: string;
  trophy?: string; // Ex: "1º Lugar Geral - Campeão Ouro", "2º Lugar - Vice-Campeão", "3º Lugar", "4º Lugar", "5º Lugar"
  catchSize?: number; // Ex: 68.5 (cm)
  points?: number; // Pontos do competidor
  species?: string; // Ex: "Tucunaré Azul"
  photoUrl?: string;
  prize?: string; // Prêmio específico do lugar (ex: "Troféu + Barco de Alumínio", "Troféu + R$ 2.000")
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
  metric: 'length' | 'weight' | 'both' | 'points';
  pointsConfig?: TournamentPointsConfig; // Sistema e regras de pontuação
  prize: string;
  prizeValue?: number;
  entryFeeType: 'gratis' | 'pago';
  entryFeeAmount?: number;
  teamFormat: 'solo' | 'dupla' | 'trio' | 'quarteto' | 'quinteto';
  keyword: string;
  tournamentCode?: string; // Código de participação (opcional) gerado no cadastro
  daysForRegistration?: number; // Dias de inscrição
  allowRegistration?: boolean; // Liberação de inscrições para membros (true = aberto, false = fechado/bloqueado)
  maxParticipants?: number; // Limite de participantes
  captureWindows?: CaptureWindow[]; // Janelas de captura válidas
  currentPhase?: string;
  imageUrl: string;
  participantCount: number;
  championInfo?: TournamentWinner;
  runnerUpInfo?: TournamentWinner;
  thirdPlaceInfo?: TournamentWinner;
  winners?: TournamentWinner[]; // Lista dinâmica de vencedores do pódio (1º, 2º, 3º, 4º, 5º, etc. configurável pelo Admin)
  closingNotes?: string;
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
  points?: number; // Pontos oficiais calculados para esta captura
  pointsBreakdown?: string; // Detalhamento dos pontos (ex: "1 pt base + 15 pts faixa 40-49cm")
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
  phone?: string; // Telefone / WhatsApp com DDD
  whatsapp?: string; // WhatsApp com DDD
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
