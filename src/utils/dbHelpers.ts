import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { Tournament, Catch, Comment, UserProfile, TournamentCode, Team, TeamMember } from '../types';

// Seed Initial Tournaments to Firestore if database is empty
export async function seedTournamentsIfNeeded(): Promise<Tournament[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'tournaments'));
    
    const initialTournaments: Omit<Tournament, 'id'>[] = [
      {
        title: "Ⅰº Circuito Tucunaré de Ouro",
        description: "O maior campeonato de pesca esportiva de Tucunaré do Brasil. Válido para medição de qualquer exemplar de Tucunaré (Azul, Amarelo, Paca, etc.) capturado em águas nacionais. Regra principal: preservação máxima do peixe (pesca e solta obrigatório).",
        rules: [
          "O peixe deve ser medido sobre uma régua ou fita métrica rígida homologada.",
          "A foto deve mostrar claramente a fita métrica do focinho à ponta da cauda.",
          "O peixe deve estar vivo no momento da medição e ser devolvido à água imediatamente.",
          "O envio de foto de soltura é altamente recomendável para bonificação do juri.",
          "Limite de 3 submissões por participante (apenas a maior será computada para o ranking)."
        ],
        startDate: "2026-06-01",
        endDate: "2026-12-31",
        status: "active",
        targetSpecies: ["Tucunaré", "Tucunaré Azul", "Tucunaré Amarelo", "Tucunaré Paca", "Tucunaré-Açu"],
        metric: "length",
        prize: "1º LUGAR: Barco Alumínio 6m + Motor de Popa 15HP | 2º LUGAR: Motor Elétrico 54lbs | 3º LUGAR: Kit Vara e Carretilha Premium",
        prizeValue: 45000,
        entryFeeType: "pago",
        entryFeeAmount: 150,
        teamFormat: "dupla",
        keyword: "TUCUNA2026",
        imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&auto=format&fit=crop&q=80",
        participantCount: 42
      },
      {
        title: "Desafio Gigantes de Couro",
        description: "Torneio nacional voltado para a captura dos colossos de água doce do Brasil, como Pirararas, Pintados, Jaús e Surubins. Uma verdadeira queda de braço onde quem sobressai é o pescador com a maior persistência física e técnica.",
        rules: [
          "Válido por comprimento e peso estimado/balança.",
          "A foto do peixe deve ser tirada na horizontal com o pescador segurando-o de forma segura.",
          "Peixes de couro exigem manuseio cuidadoso - fotos em suspensão pelo bico serão desclassificadas.",
          "O local da captura deve ser descrito em linhas gerais para registro ambiental."
        ],
        startDate: "2026-06-15",
        endDate: "2026-08-30",
        status: "active",
        targetSpecies: ["Pirarara", "Pintado", "Jaú", "Surubim", "Cachara"],
        metric: "both",
        prize: "1º LUGAR: Vale compras de R$ 15.000,00 na Pesca & Cia | 2º LUGAR: Sonda GPS Garmin Striker | 3º LUGAR: Caixa Térmica Yeti",
        prizeValue: 25000,
        entryFeeType: "pago",
        entryFeeAmount: 220,
        teamFormat: "trio",
        keyword: "GIGANTE2026",
        imageUrl: "https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=1000&auto=format&fit=crop&q=80",
        participantCount: 19
      },
      {
        title: "Rei do Robalo Flecha (Costa Brasil)",
        description: "Campeonato dedicado à pescaria de Robalo (Flecha ou Peva) em mangues, estuários ou canais costeiros. Um torneio que premia a precisão do pincho e a leitura de marés.",
        rules: [
          "Medição obrigatória em régua plana com selo do torneio ou fita métrica visível.",
          "O focinho do peixe deve encostar na marca do zero da régua de medição.",
          "Permitida apenas pesca com iscas artificiais (soft bait, plugs, colheres).",
          "O peixe deve ser liberado com vida em boas condições."
        ],
        startDate: "2026-07-01",
        endDate: "2026-09-15",
        status: "upcoming",
        targetSpecies: ["Robalo Flecha", "Robalo Peva", "Robalo"],
        metric: "length",
        prize: "1º LUGAR: Caiaque de Pesca Premium com Pedal | 2º LUGAR: Carretilha Shimano Curado | 3º LUGAR: Kit Completo de Iscas Softs",
        prizeValue: 12000,
        entryFeeType: "gratis",
        entryFeeAmount: 0,
        teamFormat: "solo",
        keyword: "ROBALOCOSTAL",
        imageUrl: "https://images.unsplash.com/photo-1541944743827-e04aa6427c33?w=1000&auto=format&fit=crop&q=80",
        participantCount: 0
      },
      {
        title: "Copa Brasil de Pesca de Black Bass",
        description: "O predador preferido dos pescadores esportivos de arremesso. O torneio é nacional, liberado para represas de qualquer estado brasileiro (comum no Sul e Sudeste).",
        rules: [
          "Fotos devem registrar o peixe estirado na tábua de medição (Belly board) oficial do pescador.",
          "A boca do peixe precisa estar completamente fechada no batente dianteiro da régua.",
          "A cauda pode ser comprimida para atingir a medição máxima de acordo com as regras tradicionais da pesca do Bass."
        ],
        startDate: "2026-01-01",
        endDate: "2026-06-15",
        status: "completed",
        targetSpecies: ["Black Bass", "Green Bass", "Bass"],
        metric: "length",
        prize: "1º LUGAR: R$ 5.000,00 em dinheiro + Troféu de Campeão Geral",
        prizeValue: 5000,
        entryFeeType: "gratis",
        entryFeeAmount: 0,
        teamFormat: "solo",
        keyword: "BASSMASTER",
        imageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1000&auto=format&fit=crop&q=80",
        participantCount: 57
      }
    ];

    if (querySnapshot.empty) {
      console.log("Banco de dados vazio de campeonatos. Semeando dados iniciais...");
      const createdTournaments: Tournament[] = [];
      for (const t of initialTournaments) {
        const docRef = await addDoc(collection(db, 'tournaments'), t);
        createdTournaments.push({ ...t, id: docRef.id } as Tournament);
      }
      return createdTournaments;
    } else {
      const tournaments: Tournament[] = [];
      querySnapshot.forEach((doc) => {
        tournaments.push({ id: doc.id, ...doc.data() } as Tournament);
      });
      return tournaments;
    }
  } catch (error) {
    console.error("Erro ao semear/obter campeonatos:", error);
    return [];
  }
}

// Add a new tournament helper
export async function createTournament(tournamentData: Omit<Tournament, 'id' | 'participantCount'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'tournaments'), {
    ...tournamentData,
    participantCount: 0
  });

  // If a tournamentCode was generated on creation, automatically add it as the first active entry in tournament_codes
  if (tournamentData.tournamentCode) {
    try {
      await addDoc(collection(db, 'tournament_codes'), {
        code: tournamentData.tournamentCode.trim().toUpperCase(),
        tournamentId: docRef.id,
        tournamentTitle: tournamentData.title,
        isUsed: false,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Aviso ao salvar código do torneio:", e);
    }
  }

  return docRef.id;
}

// Subscribe to Tournaments list
export function subscribeTournaments(callback: (tournaments: Tournament[]) => void) {
  const q = query(collection(db, 'tournaments'));
  return onSnapshot(q, (snapshot) => {
    const list: Tournament[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Tournament);
    });
    callback(list);
  }, (error) => {
    console.error("Erro ao assinar campeonatos:", error);
  });
}

// Subscribe to Catches feed in real-time
export function subscribeCatches(callback: (catches: Catch[]) => void) {
  const q = query(collection(db, 'catches'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: Catch[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Catch);
    });
    callback(list);
  }, (error) => {
    console.error("Erro ao assinar capturas:", error);
  });
}

// Submit a catch
export async function submitCatch(catchData: Omit<Catch, 'id' | 'createdAt' | 'status' | 'likes' | 'comments'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'catches'), {
    ...catchData,
    status: 'pending',
    likes: [],
    comments: [],
    createdAt: serverTimestamp()
  });

  // Increment participant count in tournament Doc
  try {
    const tourRef = doc(db, 'tournaments', catchData.tournamentId);
    // Dynamic fetch and update count
    await updateDoc(tourRef, {
      participantCount: arrayUnion(catchData.userId) as any // We would use increment or similar, but for simplicity let's just make it a number update or direct increment helper
    });
  } catch (e) {
    console.warn("Erro ao atualizar contagem de participantes:", e);
  }

  return docRef.id;
}

// Modify Tournament Participant Count (real update)
export async function updateTournamentParticipantCount(tournamentId: string, currentCount: number) {
  const docRef = doc(db, 'tournaments', tournamentId);
  await updateDoc(docRef, {
    participantCount: currentCount + 1
  });
}

// Enroll a user into a tournament
export async function enrollUserInTournament(userId: string, tournamentId: string): Promise<void> {
  try {
    // 1. Update user's enrolled tournaments list
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      enrolledTournaments: arrayUnion(tournamentId)
    }).catch(() => {
      // Ignore if user doc doesn't exist or is custom
    });

    // 2. Increment tournament participant count
    const tourDocRef = doc(db, 'tournaments', tournamentId);
    const tourSnap = await getDoc(tourDocRef);
    if (tourSnap.exists()) {
      const data = tourSnap.data();
      const currentCount = typeof data.participantCount === 'number' ? data.participantCount : 0;
      await updateDoc(tourDocRef, {
        participantCount: currentCount + 1
      });
    }
  } catch (err) {
    console.error("Erro ao registrar inscrição no Firestore:", err);
  }
}

// Approve or Reject catch (Admin Moderator tool)
export async function updateCatchStatus(
  catchId: string, 
  status: 'approved' | 'rejected', 
  moderatorNotes?: string
): Promise<void> {
  const docRef = doc(db, 'catches', catchId);
  await updateDoc(docRef, {
    status,
    moderatorNotes: moderatorNotes || ""
  });
}

// Update a tournament
export async function updateTournament(tournamentId: string, data: Partial<Tournament>): Promise<void> {
  const docRef = doc(db, 'tournaments', tournamentId);
  await updateDoc(docRef, data);
}

// Delete a tournament
export async function deleteTournament(tournamentId: string): Promise<void> {
  const docRef = doc(db, 'tournaments', tournamentId);
  await deleteDoc(docRef);
}

// Delete a catch
export async function deleteCatch(catchId: string): Promise<void> {
  const docRef = doc(db, 'catches', catchId);
  await deleteDoc(docRef);
}

// Like a catch
export async function toggleLikeCatch(catchId: string, userId: string, isAlreadyLiked: boolean): Promise<void> {
  const docRef = doc(db, 'catches', catchId);
  await updateDoc(docRef, {
    likes: isAlreadyLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
}

// Add comment to a catch
export async function addCommentToCatch(
  catchId: string,
  userId: string,
  userName: string,
  text: string
): Promise<void> {
  const docRef = doc(db, 'catches', catchId);
  const newComment: Comment = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    userName,
    text,
    createdAt: new Date().toISOString()
  };
  await updateDoc(docRef, {
    comments: arrayUnion(newComment)
  });
}

// ----------------------------------------------------
// USER ACCOUNTS & REGISTRATION (Firestore CRUD)
// ----------------------------------------------------

// Subscribe to all users (for Admin and rankings)
export function subscribeUsers(callback: (users: UserProfile[]) => void) {
  const q = query(collection(db, 'users'));
  return onSnapshot(q, (snapshot) => {
    const list: UserProfile[] = [];
    snapshot.forEach((doc) => {
      list.push({ uid: doc.id, ...doc.data() } as UserProfile);
    });
    callback(list);
  }, (error) => {
    console.error("Erro ao assinar usuários:", error);
  });
}

// Register a new fisherman account
export async function registerFisherman(data: {
  fullName: string;
  cpf: string;
  email: string;
  address: string;
  nickname: string;
  password: string;
}): Promise<UserProfile> {
  const emailClean = data.email.trim().toLowerCase();
  
  // Check if user already exists
  const existingSnapshot = await getDocs(collection(db, 'users'));
  let alreadyExists = false;
  existingSnapshot.forEach(docSnap => {
    const u = docSnap.data();
    if (u.email?.toLowerCase() === emailClean || (data.cpf && u.cpf === data.cpf)) {
      alreadyExists = true;
    }
  });

  if (alreadyExists) {
    throw new Error('Já existe um pescador cadastrado com este E-mail ou CPF.');
  }

  const newUser: Omit<UserProfile, 'uid'> = {
    displayName: data.nickname?.trim() || data.fullName.trim(),
    fullName: data.fullName.trim(),
    cpf: data.cpf.trim(),
    email: emailClean,
    address: data.address.trim(),
    nickname: data.nickname.trim(),
    password: data.password.trim(),
    role: 'participant',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'users'), newUser);
  return {
    uid: docRef.id,
    ...newUser
  };
}

// Register a new moderator with specific permissions (Admin only action)
export async function registerModerator(data: {
  displayName: string;
  email: string;
  password: string;
  permissions: {
    canModerateCatches?: boolean;
    canManageTournaments?: boolean;
    canManageFishermen?: boolean;
    canManageAntifraud?: boolean;
  };
}): Promise<UserProfile> {
  const emailClean = data.email.trim().toLowerCase();

  // Check if user already exists
  const existingSnapshot = await getDocs(collection(db, 'users'));
  let alreadyExists = false;
  existingSnapshot.forEach(docSnap => {
    const u = docSnap.data();
    if (u.email?.toLowerCase() === emailClean) {
      alreadyExists = true;
    }
  });

  if (alreadyExists) {
    throw new Error('Já existe um usuário cadastrado com este E-mail / Login.');
  }

  const newModerator: Omit<UserProfile, 'uid'> = {
    displayName: data.displayName.trim(),
    fullName: data.displayName.trim(),
    email: emailClean,
    nickname: data.displayName.trim(),
    password: data.password.trim(),
    role: 'moderator',
    permissions: {
      canModerateCatches: Boolean(data.permissions.canModerateCatches),
      canManageTournaments: Boolean(data.permissions.canManageTournaments),
      canManageFishermen: Boolean(data.permissions.canManageFishermen),
      canManageAntifraud: Boolean(data.permissions.canManageAntifraud)
    },
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'users'), newModerator);
  return {
    uid: docRef.id,
    ...newModerator
  };
}

// Authenticate user (Fisherman, Moderator or Super Admin)
export async function authenticateUser(
  identifier: string, 
  passwordInput: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanId = identifier.trim();
  const cleanPass = passwordInput.trim();

  // 1. Check Admin Master Login
  // Admin credentials: username "Admin" (or "admin" or "admin@pescaesporte.com") and password "121713#3"
  if (
    (cleanId.toLowerCase() === 'admin' || cleanId.toLowerCase() === 'admin@pescaesporte.com') && 
    cleanPass === '121713#3'
  ) {
    const adminUser: UserProfile = {
      uid: 'admin_master_root',
      displayName: 'Administrador Geral',
      fullName: 'Coordenador Geral da Pesca',
      email: 'admin@pescaesporte.com',
      role: 'admin',
      permissions: {
        canModerateCatches: true,
        canManageTournaments: true,
        canManageFishermen: true,
        canManageAntifraud: true
      },
      status: 'active',
      createdAt: new Date().toISOString()
    };
    return { success: true, user: adminUser };
  }

  // 2. Check Standard Fisherman / Moderator Login from Firestore
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    let matchedUser: UserProfile | null = null;

    snapshot.forEach(docSnap => {
      const u = { uid: docSnap.id, ...docSnap.data() } as UserProfile;
      const matchEmail = u.email?.toLowerCase() === cleanId.toLowerCase();
      const matchNickname = u.nickname?.toLowerCase() === cleanId.toLowerCase();
      const matchDisplayName = u.displayName?.toLowerCase() === cleanId.toLowerCase();
      const matchCPF = u.cpf === cleanId;

      if (matchEmail || matchNickname || matchDisplayName || matchCPF) {
        if (u.password === cleanPass) {
          matchedUser = u;
        }
      }
    });

    if (!matchedUser) {
      return { 
        success: false, 
        error: 'E-mail ou senha inválidos. Caso não possua conta, cadastre-se na aba Criar Conta.' 
      };
    }

    const userObj = matchedUser as UserProfile;

    if (userObj.status === 'blocked') {
      return { 
        success: false, 
        error: 'Acesso bloqueado: Seu cadastro foi suspenso pela administração.' 
      };
    }

    return { success: true, user: userObj };
  } catch (err: any) {
    console.error("Erro na autenticação:", err);
    return { success: false, error: 'Erro ao conectar ao servidor. Tente novamente.' };
  }
}

// Admin update user status (activate / block) - PROTECTS SUPER ADMIN
export async function updateUserStatus(userId: string, status: 'active' | 'blocked'): Promise<void> {
  if (userId === 'admin_master_root') {
    throw new Error('Acesso negado: O Administrador Geral não pode ser bloqueado.');
  }
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, { status });
}

// Admin delete user - PROTECTS SUPER ADMIN
export async function deleteUser(userId: string): Promise<void> {
  if (userId === 'admin_master_root') {
    throw new Error('Acesso negado: O Administrador Geral é o proprietário do sistema e não pode ser excluído.');
  }
  const docRef = doc(db, 'users', userId);
  await deleteDoc(docRef);
}

// Admin update full user details
export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, data);
}

// -------------------------------------------------------------
// TOURNAMENT UNIQUE ENTRY CODES (ANTI-FRAUD 1-TIME USE CODES)
// -------------------------------------------------------------

// Helper to generate a collision-resistant unique tournament code
export function generateUniqueTournamentCode(prefix = 'TRN'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // removed ambiguous characters like 0/O, 1/I
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const numericPart = Math.floor(1000 + Math.random() * 9000);
  const suffix = chars.charAt(Math.floor(Math.random() * chars.length)) + chars.charAt(Math.floor(Math.random() * chars.length));
  return `${prefix.toUpperCase()}-${numericPart}-${randomPart}${suffix}`;
}

// Create a single unique tournament access code
export async function createTournamentCode(
  tournamentId: string, 
  tournamentTitle: string, 
  customCode?: string,
  createdBy?: string
): Promise<TournamentCode> {
  const finalCode = customCode ? customCode.trim().toUpperCase() : generateUniqueTournamentCode();
  
  const docRef = await addDoc(collection(db, 'tournament_codes'), {
    code: finalCode,
    tournamentId,
    tournamentTitle,
    isUsed: false,
    paymentStatus: 'paid',
    createdBy: createdBy || 'admin',
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    code: finalCode,
    tournamentId,
    tournamentTitle,
    isUsed: false,
    paymentStatus: 'paid',
    createdBy: createdBy || 'admin',
    createdAt: new Date()
  };
}

// Create an individual participation code strictly ASSIGNED to a specific user (Anti-fraud)
export async function createAssignedTournamentCode(data: {
  tournamentId: string;
  tournamentTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCpf?: string;
  paymentStatus?: 'paid' | 'pending' | 'free';
  paymentAmount?: number;
  paymentNotes?: string;
  customCode?: string;
  createdBy?: string;
}): Promise<TournamentCode> {
  // Generate code with user-specific seed or custom
  let finalCode = data.customCode ? data.customCode.trim().toUpperCase() : '';
  if (!finalCode) {
    const cpfSuffix = data.userCpf ? data.userCpf.replace(/\D/g, '').slice(-4) : 'USR';
    finalCode = generateUniqueTournamentCode(`TRN-${cpfSuffix}`);
  }

  const docData = {
    code: finalCode,
    tournamentId: data.tournamentId,
    tournamentTitle: data.tournamentTitle,
    assignedToUserId: data.userId,
    assignedToUserName: data.userName,
    assignedToUserEmail: data.userEmail.toLowerCase(),
    assignedToUserCpf: data.userCpf || '',
    paymentStatus: data.paymentStatus || 'paid',
    paymentAmount: data.paymentAmount || 0,
    paymentNotes: data.paymentNotes || '',
    isUsed: false,
    createdBy: data.createdBy || 'admin',
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'tournament_codes'), docData);

  return {
    id: docRef.id,
    ...docData,
    createdAt: new Date()
  };
}

// Update payment status for an assigned tournament code
export async function updateTournamentCodePayment(
  codeId: string,
  paymentStatus: 'paid' | 'pending' | 'free',
  paymentNotes?: string
): Promise<void> {
  const docRef = doc(db, 'tournament_codes', codeId);
  const updateData: any = { paymentStatus };
  if (paymentNotes !== undefined) {
    updateData.paymentNotes = paymentNotes;
  }
  await updateDoc(docRef, updateData);
}

// Create multiple unique tournament codes in bulk (e.g. for releasing to participants)
export async function createBulkTournamentCodes(
  tournamentId: string,
  tournamentTitle: string,
  count: number,
  createdBy?: string
): Promise<string[]> {
  const generatedCodes: string[] = [];
  const safeCount = Math.min(Math.max(1, count), 50); // limit to max 50 at a time

  for (let i = 0; i < safeCount; i++) {
    const code = generateUniqueTournamentCode();
    await addDoc(collection(db, 'tournament_codes'), {
      code,
      tournamentId,
      tournamentTitle,
      isUsed: false,
      paymentStatus: 'paid',
      createdBy: createdBy || 'admin',
      createdAt: serverTimestamp()
    });
    generatedCodes.push(code);
  }

  return generatedCodes;
}

// Subscribe to all tournament codes for real-time admin view
export function subscribeAllTournamentCodes(callback: (codes: TournamentCode[]) => void) {
  const q = query(collection(db, 'tournament_codes'));
  return onSnapshot(q, (snapshot) => {
    const list: TournamentCode[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as TournamentCode);
    });
    // Sort: newest first
    list.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    });
    callback(list);
  }, (error) => {
    console.error("Erro ao assinar códigos de torneio:", error);
  });
}

// Subscribe to tournament codes assigned to a specific user (For User Profile / My Codes view)
export function subscribeUserTournamentCodes(userId: string, userEmail: string, callback: (codes: TournamentCode[]) => void) {
  const q = query(collection(db, 'tournament_codes'));
  return onSnapshot(q, (snapshot) => {
    const list: TournamentCode[] = [];
    const lowerEmail = userEmail ? userEmail.toLowerCase() : '';
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as TournamentCode;
      const matchUser = data.assignedToUserId === userId || 
        (data.assignedToUserEmail && data.assignedToUserEmail.toLowerCase() === lowerEmail) ||
        data.usedByUserId === userId ||
        (data.usedByUserEmail && data.usedByUserEmail.toLowerCase() === lowerEmail);

      if (matchUser) {
        list.push({ id: docSnap.id, ...data });
      }
    });
    // Sort: newest first
    list.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      return timeB - timeA;
    });
    callback(list);
  }, (error) => {
    console.error("Erro ao assinar códigos do usuário:", error);
  });
}

// Delete an unused tournament code (Admin)
export async function deleteTournamentCode(codeId: string): Promise<void> {
  const docRef = doc(db, 'tournament_codes', codeId);
  await deleteDoc(docRef);
}

// Validate and consume single-use tournament code with Anti-Fraud & User Assignment check
export async function validateAndConsumeTournamentCode(
  tournamentId: string,
  inputCode: string,
  user: UserProfile
): Promise<{ success: boolean; message: string; tournamentTitle?: string }> {
  const cleanCode = inputCode.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, message: 'Por favor, informe o código do torneio.' };
  }

  try {
    // 1. Query tournament_codes collection
    const snapshot = await getDocs(collection(db, 'tournament_codes'));
    let matchedDoc: { id: string; data: TournamentCode } | null = null;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as TournamentCode;
      if (data.code && data.code.trim().toUpperCase() === cleanCode) {
        matchedDoc = { id: docSnap.id, data: { ...data, id: docSnap.id } };
      }
    });

    // If code exists in tournament_codes
    if (matchedDoc) {
      const codeRecord = matchedDoc.data;

      // Check if it belongs to the target tournament
      if (codeRecord.tournamentId !== tournamentId) {
        return { 
          success: false, 
          message: `Código inválido para este campeonato. Este código pertence ao torneio "${codeRecord.tournamentTitle || 'outro campeonato'}".` 
        };
      }

      // ANTI-FRAUD CHECK 1: If the code is assigned to a specific user, verify identity
      if (codeRecord.assignedToUserId || codeRecord.assignedToUserEmail || codeRecord.assignedToUserCpf) {
        const matchId = codeRecord.assignedToUserId && codeRecord.assignedToUserId === user.uid;
        const matchEmail = codeRecord.assignedToUserEmail && user.email && codeRecord.assignedToUserEmail.toLowerCase() === user.email.toLowerCase();
        const matchCpf = codeRecord.assignedToUserCpf && user.cpf && codeRecord.assignedToUserCpf.replace(/\D/g, '') === user.cpf.replace(/\D/g, '');

        if (!matchId && !matchEmail && !matchCpf) {
          const ownerInfo = codeRecord.assignedToUserName || 'outro participante';
          const ownerCpfFormatted = codeRecord.assignedToUserCpf ? ` (CPF final: ...${codeRecord.assignedToUserCpf.slice(-4)})` : '';
          return {
            success: false,
            message: `🚫 BLOQUEIO ANTIFRAUDE: Este código de inscrição foi atribuído exclusivamente ao pescador "${ownerInfo}"${ownerCpfFormatted}. Usuários não pagantes ou terceiros não têm permissão para utilizá-lo.`
          };
        }
      }

      // ANTI-FRAUD CHECK 2: Verify payment status if marked as pending
      if (codeRecord.paymentStatus === 'pending') {
        return {
          success: false,
          message: `⚠️ PAGAMENTO PENDENTE: Este código de inscrição ainda não teve o pagamento confirmado pelo organizador. Envie o comprovante via WhatsApp para validação.`
        };
      }

      // ANTI-FRAUD CHECK 3: Check if code was ALREADY used
      if (codeRecord.isUsed) {
        const usedDateStr = codeRecord.usedAt
          ? (codeRecord.usedAt.toDate ? codeRecord.usedAt.toDate().toLocaleString('pt-BR') : new Date(codeRecord.usedAt).toLocaleString('pt-BR'))
          : 'data anterior';
        const usedUserStr = codeRecord.usedByUserName || codeRecord.usedByUserEmail || 'outro competidor';

        return {
          success: false,
          message: `🔒 CÓDIGO JÁ UTILIZADO: Este código (${cleanCode}) foi consumido em ${usedDateStr} por ${usedUserStr} e não pode ser reutilizado.`
        };
      }

      // Consume the code (mark as used and register participant)
      const codeDocRef = doc(db, 'tournament_codes', matchedDoc.id);
      await updateDoc(codeDocRef, {
        isUsed: true,
        usedByUserId: user.uid,
        usedByUserName: user.displayName || user.fullName || user.email,
        usedByUserEmail: user.email,
        usedAt: serverTimestamp()
      });

      // Enroll user into tournament
      await enrollUserInTournament(user.uid, tournamentId);

      return {
        success: true,
        message: 'Código de inscrição autenticado com sucesso! Inscrição confirmada no torneio.',
        tournamentTitle: codeRecord.tournamentTitle
      };
    }

    // 2. Fallback check on tournament.tournamentCode or tournament.keyword if not yet entered in table
    const tourDocRef = doc(db, 'tournaments', tournamentId);
    const tourSnap = await getDoc(tourDocRef);

    if (tourSnap.exists()) {
      const tourData = tourSnap.data() as Tournament;
      const masterCode = (tourData.tournamentCode || tourData.keyword || '').trim().toUpperCase();

      if (masterCode && cleanCode === masterCode) {
        // Check if master code was already used
        let masterCodeAlreadyUsed = false;
        snapshot.forEach((docSnap) => {
          const d = docSnap.data() as TournamentCode;
          if (d.tournamentId === tournamentId && d.code?.trim().toUpperCase() === masterCode && d.isUsed) {
            masterCodeAlreadyUsed = true;
          }
        });

        if (masterCodeAlreadyUsed) {
          return {
            success: false,
            message: `O código de acesso inicial deste torneio já foi utilizado. Solicite seu código individual exclusivo ao Administrador.`
          };
        }

        // Register it as used right now
        await addDoc(collection(db, 'tournament_codes'), {
          code: masterCode,
          tournamentId,
          tournamentTitle: tourData.title,
          isUsed: true,
          paymentStatus: 'paid',
          usedByUserId: user.uid,
          usedByUserName: user.displayName || user.fullName || user.email,
          usedByUserEmail: user.email,
          usedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });

        // Enroll user into tournament
        await enrollUserInTournament(user.uid, tournamentId);

        return {
          success: true,
          message: 'Código de torneio autenticado com sucesso! Inscrição confirmada.',
          tournamentTitle: tourData.title
        };
      }
    }

    // If no match at all
    return {
      success: false,
      message: 'Código inválido ou inexistente. Solicite seu código exclusivo de participação ao Administrador após confirmação do pagamento.'
    };
  } catch (err: any) {
    console.error("Erro na validação do código do torneio:", err);
    return {
      success: false,
      message: 'Erro ao validar código no servidor: ' + (err.message || 'Tente novamente.')
    };
  }
}

// =========================================================================
// TEAM MANAGEMENT (DUPLAS, TRIOS, EQUIPES 2 A 5 PESSOAS)
// =========================================================================

// Generate unique team code (e.g. EQP-7492-XP)
function generateUniqueTeamCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const randLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `EQP-${randNum}-${randLetters}`;
}

// Create a new team
export async function createTeam(teamData: {
  name: string;
  maxMembers: number; // 2 to 5
  logoUrl?: string;
  creatorUser: UserProfile;
  tournamentIds?: string[];
}): Promise<{ success: boolean; message: string; team?: Team }> {
  try {
    const trimmedName = teamData.name.trim();
    if (!trimmedName) {
      return { success: false, message: 'Por favor, informe o nome da equipe.' };
    }

    const max = Math.min(5, Math.max(2, teamData.maxMembers || 2));
    const teamCode = generateUniqueTeamCode();

    const captainMember: TeamMember = {
      userId: teamData.creatorUser.uid,
      userName: teamData.creatorUser.displayName || teamData.creatorUser.fullName || 'Capitão da Equipe',
      userEmail: teamData.creatorUser.email,
      userNickname: teamData.creatorUser.nickname || '',
      userPhoto: teamData.creatorUser.photoURL || '',
      role: 'captain',
      joinedAt: new Date().toISOString()
    };

    const newTeamPayload = {
      name: trimmedName,
      code: teamCode,
      maxMembers: max,
      logoUrl: teamData.logoUrl || '',
      creatorId: teamData.creatorUser.uid,
      creatorName: teamData.creatorUser.displayName || teamData.creatorUser.fullName || 'Capitão',
      creatorEmail: teamData.creatorUser.email,
      members: [captainMember],
      tournamentIds: teamData.tournamentIds || [],
      status: 'pending', // Awaiting Admin approval
      reviewedBy: '',
      reviewedAt: null,
      rejectionReason: '',
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'teams'), newTeamPayload);

    // Update user document with team reference
    try {
      const userRef = doc(db, 'users', teamData.creatorUser.uid);
      await updateDoc(userRef, {
        teamId: docRef.id,
        teamName: trimmedName,
        teamLogo: teamData.logoUrl || ''
      });
    } catch (e) {
      console.warn("Aviso ao atualizar perfil do capitão no Firestore:", e);
    }

    const createdTeam: Team = {
      id: docRef.id,
      ...newTeamPayload,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      message: `Equipe "${trimmedName}" cadastrada com sucesso! Ela foi enviada para aprovação do Administrador. Código: ${teamCode}`,
      team: createdTeam
    };
  } catch (error: any) {
    console.error("Erro ao criar equipe:", error);
    return {
      success: false,
      message: 'Erro ao salvar equipe no servidor: ' + (error.message || 'Tente novamente.')
    };
  }
}

// Real-time subscription to all teams
export function subscribeTeams(callback: (teams: Team[]) => void) {
  const q = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: Team[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as Team);
    });
    callback(list);
  }, (err) => {
    console.error("Erro ao assinar equipes:", err);
  });
}

// Real-time subscription to current user's team
export function subscribeUserTeam(userId: string, callback: (team: Team | null) => void) {
  const q = query(collection(db, 'teams'));
  return onSnapshot(q, (snapshot) => {
    let foundTeam: Team | null = null;
    snapshot.forEach((docSnap) => {
      const team = { id: docSnap.id, ...docSnap.data() } as Team;
      if (team.members && team.members.some(m => m.userId === userId)) {
        foundTeam = team;
      }
    });
    callback(foundTeam);
  }, (err) => {
    console.error("Erro ao assinar equipe do usuário:", err);
  });
}

// Get current user's team directly (one-shot fetch)
export async function getUserTeam(userId: string): Promise<Team | null> {
  try {
    const snapshot = await getDocs(collection(db, 'teams'));
    let foundTeam: Team | null = null;
    snapshot.forEach((docSnap) => {
      const team = { id: docSnap.id, ...docSnap.data() } as Team;
      if (team.members && team.members.some(m => m.userId === userId)) {
        foundTeam = team;
      }
    });
    return foundTeam;
  } catch (err) {
    console.error("Erro ao buscar equipe do usuário:", err);
    return null;
  }
}

// Join team using unique team code
export async function joinTeamByCode(
  teamCode: string, 
  user: UserProfile,
  tournamentId?: string
): Promise<{ success: boolean; message: string; team?: Team }> {
  try {
    const cleanCode = teamCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Por favor, insira o código da equipe.' };
    }

    // Query teams by code
    const q = query(collection(db, 'teams'), where('code', '==', cleanCode));
    const querySnap = await getDocs(q);

    if (querySnap.empty) {
      return { 
        success: false, 
        message: 'Código de equipe não encontrado. Verifique com o capitão se o código foi digitado corretamente.' 
      };
    }

    const teamDoc = querySnap.docs[0];
    const team = { id: teamDoc.id, ...teamDoc.data() } as Team;

    // Check if user is already in this team
    if (team.members && team.members.some(m => m.userId === user.uid)) {
      return { success: false, message: 'Você já faz parte desta equipe!' };
    }

    // Check member limit (2 to 5)
    const currentMembersCount = team.members ? team.members.length : 0;
    if (currentMembersCount >= team.maxMembers) {
      return { 
        success: false, 
        message: `Esta equipe atingiu o limite máximo de ${team.maxMembers} membros permitidos. Não é possível adicionar mais participantes.` 
      };
    }

    // Check tournament exclusivity rule:
    // If the tournament is specified, or team is enrolled in tournaments, check if user is already in another team participating in the same tournament
    if (tournamentId || (team.tournamentIds && team.tournamentIds.length > 0)) {
      const targetTournaments = tournamentId ? [tournamentId] : (team.tournamentIds || []);
      
      const allTeamsSnap = await getDocs(collection(db, 'teams'));
      let alreadyInAnotherTeamForTournament = false;
      let existingTeamName = '';

      allTeamsSnap.forEach(snap => {
        if (snap.id !== team.id) {
          const otherTeam = snap.data() as Team;
          const userIsInOtherTeam = otherTeam.members && otherTeam.members.some(m => m.userId === user.uid);
          if (userIsInOtherTeam && otherTeam.tournamentIds) {
            const hasCommonTourney = otherTeam.tournamentIds.some(tId => targetTournaments.includes(tId));
            if (hasCommonTourney) {
              alreadyInAnotherTeamForTournament = true;
              existingTeamName = otherTeam.name;
            }
          }
        }
      });

      if (alreadyInAnotherTeamForTournament) {
        return {
          success: false,
          message: `Você já faz parte de uma equipe ("${existingTeamName}") cadastrada neste campeonato. Não é permitido participar de um mesmo torneio por equipes diferentes.`
        };
      }
    }

    // Add user as member
    const newMember: TeamMember = {
      userId: user.uid,
      userName: user.displayName || user.fullName || 'Pescador Integrante',
      userEmail: user.email,
      userNickname: user.nickname || '',
      userPhoto: user.photoURL || '',
      role: 'member',
      joinedAt: new Date().toISOString()
    };

    const updatedMembers = [...(team.members || []), newMember];
    
    // If tournamentId was passed, also ensure it is in tournamentIds
    const updatedTournamentIds = Array.from(new Set([
      ...(team.tournamentIds || []),
      ...(tournamentId ? [tournamentId] : [])
    ]));

    await updateDoc(doc(db, 'teams', team.id), {
      members: updatedMembers,
      tournamentIds: updatedTournamentIds
    });

    // Update user doc
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        teamId: team.id,
        teamName: team.name,
        teamLogo: team.logoUrl || ''
      });
    } catch (e) {
      console.warn("Aviso ao atualizar perfil do usuário ao entrar na equipe:", e);
    }

    const updatedTeamObj: Team = {
      ...team,
      members: updatedMembers,
      tournamentIds: updatedTournamentIds
    };

    return {
      success: true,
      message: `🎉 Você entrou com sucesso na equipe "${team.name}"!`,
      team: updatedTeamObj
    };
  } catch (error: any) {
    console.error("Erro ao juntar-se à equipe:", error);
    return {
      success: false,
      message: 'Erro ao processar entrada na equipe: ' + (error.message || 'Tente novamente.')
    };
  }
}

// Remove a member from team (Captain only)
export async function removeMemberFromTeam(
  teamId: string, 
  captainUserId: string, 
  memberUserIdToRemove: string
): Promise<{ success: boolean; message: string }> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return { success: false, message: 'Equipe não encontrada.' };
    }

    const team = teamSnap.data() as Team;

    // Verify if requester is captain
    const requesterIsCaptain = team.creatorId === captainUserId || 
      (team.members && team.members.some(m => m.userId === captainUserId && m.role === 'captain'));

    if (!requesterIsCaptain) {
      return { success: false, message: 'Apenas o capitão ou criador da equipe pode remover membros.' };
    }

    if (captainUserId === memberUserIdToRemove) {
      return { success: false, message: 'O capitão não pode se auto-remover por este botão. Utilize a opção "Deixar Equipe".' };
    }

    const updatedMembers = (team.members || []).filter(m => m.userId !== memberUserIdToRemove);

    await updateDoc(teamRef, {
      members: updatedMembers
    });

    // Update removed user doc
    try {
      const userRef = doc(db, 'users', memberUserIdToRemove);
      await updateDoc(userRef, {
        teamId: '',
        teamName: '',
        teamLogo: ''
      });
    } catch (e) {
      console.warn("Aviso ao limpar dados de equipe do membro removido:", e);
    }

    return {
      success: true,
      message: 'Membro removido da equipe com sucesso.'
    };
  } catch (error: any) {
    console.error("Erro ao remover membro da equipe:", error);
    return {
      success: false,
      message: 'Erro ao remover membro: ' + (error.message || 'Tente novamente.')
    };
  }
}

// Leave team (Member voluntary exit)
export async function leaveTeam(
  teamId: string, 
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return { success: false, message: 'Equipe não encontrada.' };
    }

    const team = teamSnap.data() as Team;
    const remainingMembers = (team.members || []).filter(m => m.userId !== userId);

    if (remainingMembers.length === 0) {
      // Delete empty team
      await deleteDoc(teamRef);
    } else {
      // If the leaving user was captain, promote first remaining member to captain
      const leavingWasCaptain = team.creatorId === userId || 
        (team.members && team.members.some(m => m.userId === userId && m.role === 'captain'));

      if (leavingWasCaptain) {
        remainingMembers[0].role = 'captain';
        await updateDoc(teamRef, {
          members: remainingMembers,
          creatorId: remainingMembers[0].userId,
          creatorName: remainingMembers[0].userName,
          creatorEmail: remainingMembers[0].userEmail
        });
      } else {
        await updateDoc(teamRef, {
          members: remainingMembers
        });
      }
    }

    // Clear team from user doc
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        teamId: '',
        teamName: '',
        teamLogo: ''
      });
    } catch (e) {
      console.warn("Aviso ao limpar dados de equipe do usuário:", e);
    }

    return {
      success: true,
      message: 'Você saiu da equipe com sucesso.'
    };
  } catch (error: any) {
    console.error("Erro ao sair da equipe:", error);
    return {
      success: false,
      message: 'Erro ao sair da equipe: ' + (error.message || 'Tente novamente.')
    };
  }
}

// Update Team (Logo, Name, etc.)
export async function updateTeam(teamId: string, data: Partial<Team>): Promise<void> {
  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, data);
}

// Admin approve/reject team
export async function updateTeamStatus(
  teamId: string, 
  status: 'approved' | 'rejected' | 'pending', 
  reviewedBy?: string, 
  rejectionReason?: string
): Promise<void> {
  const teamRef = doc(db, 'teams', teamId);
  await updateDoc(teamRef, {
    status,
    reviewedBy: reviewedBy || 'Administração',
    reviewedAt: serverTimestamp(),
    rejectionReason: rejectionReason || ''
  });
}

// Admin delete team permanently
export async function deleteTeamByAdmin(teamId: string): Promise<void> {
  const teamRef = doc(db, 'teams', teamId);
  const snap = await getDoc(teamRef);
  if (snap.exists()) {
    const teamData = snap.data() as Team;
    // Clear team from all members' user profiles
    if (teamData.members && teamData.members.length > 0) {
      for (const m of teamData.members) {
        try {
          const userRef = doc(db, 'users', m.userId);
          await updateDoc(userRef, {
            teamId: '',
            teamName: '',
            teamLogo: ''
          });
        } catch (e) {
          console.warn("Erro ao desvincular usuário da equipe excluída:", e);
        }
      }
    }
  }
  await deleteDoc(teamRef);
}


