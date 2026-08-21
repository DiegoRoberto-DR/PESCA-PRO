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
import { Tournament, Catch, Comment, UserProfile, TournamentCode } from '../types';

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
    createdBy: createdBy || 'admin',
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    code: finalCode,
    tournamentId,
    tournamentTitle,
    isUsed: false,
    createdBy: createdBy || 'admin',
    createdAt: new Date()
  };
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

// Delete an unused tournament code (Admin)
export async function deleteTournamentCode(codeId: string): Promise<void> {
  const docRef = doc(db, 'tournament_codes', codeId);
  await deleteDoc(docRef);
}

// Validate and consume single-use tournament code
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
          message: `Código inválido para este torneio. Este código pertence ao torneio "${codeRecord.tournamentTitle || 'outro campeonato'}".` 
        };
      }

      // Check if code was ALREADY used
      if (codeRecord.isUsed) {
        const usedDateStr = codeRecord.usedAt
          ? (codeRecord.usedAt.toDate ? codeRecord.usedAt.toDate().toLocaleString('pt-BR') : new Date(codeRecord.usedAt).toLocaleString('pt-BR'))
          : 'data anterior';
        const usedUserStr = codeRecord.usedByUserName || codeRecord.usedByUserEmail || 'outro competidor';

        return {
          success: false,
          message: `Este código de inscrição (${cleanCode}) JÁ FOI UTILIZADO em ${usedDateStr} por ${usedUserStr} e NÃO PODE ser usado 2 vezes.`
        };
      }

      // Consume the code (mark as used)
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
        message: 'Código autenticado e validado com sucesso! Inscrição confirmada.',
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
            message: `O código de acesso inicial deste torneio já foi utilizado e não pode ser reutilizado. Solicite um novo código exclusivo ao Administrador.`
          };
        }

        // Register it as used right now
        await addDoc(collection(db, 'tournament_codes'), {
          code: masterCode,
          tournamentId,
          tournamentTitle: tourData.title,
          isUsed: true,
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
      message: 'Código inválido ou inexistente para este torneio. Solicite seu código exclusivo de participação ao Administrador.'
    };
  } catch (err: any) {
    console.error("Erro na validação do código do torneio:", err);
    return {
      success: false,
      message: 'Erro ao validar código no servidor: ' + (err.message || 'Tente novamente.')
    };
  }
}

