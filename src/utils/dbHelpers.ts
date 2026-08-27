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
import { Tournament, Catch, Comment, UserProfile, TournamentCode, Team, TeamMember, CaptureWindow, AppNotification, SupportMessage, TournamentPointsConfig, PointRule, SpeciesBonusRule, TournamentWinner } from '../types';

// Helper to remove any undefined fields before sending to Firestore (prevents Firebase Unsupported undefined errors)
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  // Preserve Firestore FieldValues (serverTimestamp, arrayUnion, arrayRemove, increment, etc.)
  if (obj.constructor && (obj.constructor.name === 'FieldValue' || obj.constructor.name === 'ServerTimestampTransform')) return obj;
  if ('_methodName' in obj || '_delegate' in obj || '_type' in obj) return obj;

  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item)) as any;
  }

  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === undefined) {
      continue; // Strip out undefined completely
    }
    if (val === null) {
      cleaned[key] = null;
    } else if (Array.isArray(val)) {
      cleaned[key] = val
        .filter((item) => item !== undefined)
        .map((item) => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item));
    } else if (typeof val === 'object') {
      if (val instanceof Date || '_methodName' in val || '_delegate' in val || '_type' in val || (val.constructor && val.constructor.name === 'FieldValue')) {
        cleaned[key] = val;
      } else {
        cleaned[key] = cleanFirestoreData(val);
      }
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

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
  const cleanedPayload = cleanFirestoreData({
    ...tournamentData,
    participantCount: 0,
    createdAt: serverTimestamp()
  });

  const docRef = await addDoc(collection(db, 'tournaments'), cleanedPayload);

  // If a tournamentCode was generated on creation, automatically add it as the first active entry in tournament_codes
  if (tournamentData.tournamentCode) {
    try {
      await addDoc(collection(db, 'tournament_codes'), {
        code: tournamentData.tournamentCode.trim().toUpperCase(),
        tournamentId: docRef.id,
        tournamentTitle: tournamentData.title,
        isUsed: false,
        paymentStatus: 'paid',
        createdBy: 'admin',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn("Aviso ao salvar código do torneio:", e);
    }
  }

  // If initial capture windows were added, create official notifications
  if (tournamentData.captureWindows && tournamentData.captureWindows.length > 0) {
    try {
      for (const win of tournamentData.captureWindows) {
        const notifData: Omit<AppNotification, 'id'> = {
          tournamentId: docRef.id,
          tournamentTitle: tournamentData.title,
          title: `Nova Janela de Captura: ${tournamentData.title}`,
          message: `Uma nova janela de captura / etapa foi agendada para ${win.date} das ${win.startTime || '06:00'} às ${win.endTime || '18:00'}.${win.secret ? ` Chave antifraude: ${win.secret}` : ''}`,
          type: 'capture_window',
          windowDate: win.date,
          windowStartTime: win.startTime || '06:00',
          windowEndTime: win.endTime || '18:00',
          windowSecret: win.secret,
          readBy: [],
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'notifications'), cleanFirestoreData(notifData));
      }
    } catch (notifErr) {
      console.warn("Aviso ao criar notificações iniciais de janelas de captura:", notifErr);
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
  const dataToSave = cleanFirestoreData({
    ...catchData,
    status: 'pending',
    likes: [],
    comments: [],
    createdAt: serverTimestamp()
  });

  const docRef = await addDoc(collection(db, 'catches'), dataToSave);

  // Increment participant count in tournament Doc
  try {
    const tourRef = doc(db, 'tournaments', catchData.tournamentId);
    await updateDoc(tourRef, {
      participantCount: arrayUnion(catchData.userId) as any
    });
  } catch (e) {
    console.warn("Erro ao atualizar contagem de participantes:", e);
  }

  return docRef.id;
}

// Finalize Tournament and Crown Champions with flexible podium (1st, 2nd, 3rd, 4th, 5th, etc.)
export async function finalizeTournamentWithChampions(
  tournamentId: string,
  tournamentTitle: string,
  championOrWinners: any,
  runnerUp?: any,
  thirdPlace?: any,
  closingNotes?: string
): Promise<void> {
  const tourRef = doc(db, 'tournaments', tournamentId);
  
  const updatePayload: any = {
    status: 'completed',
    completedAt: new Date().toISOString()
  };

  let winnersList: TournamentWinner[] = [];

  if (Array.isArray(championOrWinners)) {
    winnersList = championOrWinners.filter(w => w && w.userName && w.userName.trim() !== '');
  } else if (championOrWinners && typeof championOrWinners === 'object') {
    if (championOrWinners.userName) {
      winnersList.push({ position: 1, trophy: '1º Lugar - Grande Campeão', ...championOrWinners });
    }
    if (runnerUp && runnerUp.userName) {
      winnersList.push({ position: 2, trophy: '2º Lugar - Vice-Campeão', ...runnerUp });
    }
    if (thirdPlace && thirdPlace.userName) {
      winnersList.push({ position: 3, trophy: '3º Lugar - Bronze', ...thirdPlace });
    }
  }

  if (winnersList.length > 0) {
    updatePayload.winners = cleanFirestoreData(winnersList);
    updatePayload.championInfo = cleanFirestoreData(winnersList[0]);
    if (winnersList[1]) {
      updatePayload.runnerUpInfo = cleanFirestoreData(winnersList[1]);
    }
    if (winnersList[2]) {
      updatePayload.thirdPlaceInfo = cleanFirestoreData(winnersList[2]);
    }
  }

  if (closingNotes) {
    updatePayload.closingNotes = closingNotes;
  }

  await updateDoc(tourRef, cleanFirestoreData(updatePayload));

  // Send Celebration Broadcast Notification
  try {
    const champName = winnersList[0]?.userName || 'Pescador Vencedor';
    const totalPodium = winnersList.length;
    const podiumMsg = totalPodium > 1
      ? `Parabéns ao grande Campeão ${champName} 🥇 e aos premiados do 1º ao ${totalPodium}º lugar!`
      : `Parabéns ao grande Campeão ${champName} 🥇!`;

    const notifData: Omit<AppNotification, 'id'> = {
      tournamentId,
      tournamentTitle,
      title: `🏆 CAMPEONATO ENCERRADO: ${tournamentTitle}`,
      message: `O campeonato foi finalizado com sucesso! ${podiumMsg} Confira o pódio oficial no app.`,
      type: 'tournament_update',
      readBy: [],
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'notifications'), cleanFirestoreData(notifData));
  } catch (notifErr) {
    console.warn("Aviso ao disparar notificação de encerramento de torneio:", notifErr);
  }
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
  moderatorNotes?: string,
  extraData?: { points?: number; pointsBreakdown?: string }
): Promise<void> {
  const docRef = doc(db, 'catches', catchId);
  const payload: any = {
    status,
    moderatorNotes: moderatorNotes || ""
  };
  if (extraData?.points !== undefined) {
    payload.points = extraData.points;
  }
  if (extraData?.pointsBreakdown !== undefined) {
    payload.pointsBreakdown = extraData.pointsBreakdown;
  }
  await updateDoc(docRef, cleanFirestoreData(payload));
}

// Calculate points for a catch based on tournament scoring configuration
export function calculateCatchPoints(
  catchItemOrLength: { length: number; weight?: number; species?: string } | number,
  tournamentOrSpeciesOrConfig?: Tournament | TournamentPointsConfig | string | null,
  maybeConfig?: TournamentPointsConfig | null
): { points: number; breakdown: string; isValid: boolean } {
  let length = 0;
  let species = '';
  let cfg: TournamentPointsConfig | undefined;
  let tournamentMetric: string | undefined;

  if (typeof catchItemOrLength === 'number') {
    length = catchItemOrLength;
    if (typeof tournamentOrSpeciesOrConfig === 'string') {
      species = tournamentOrSpeciesOrConfig;
      cfg = maybeConfig || undefined;
    } else if (tournamentOrSpeciesOrConfig && typeof tournamentOrSpeciesOrConfig === 'object') {
      if ('pointsConfig' in tournamentOrSpeciesOrConfig) {
        cfg = (tournamentOrSpeciesOrConfig as Tournament).pointsConfig;
        tournamentMetric = (tournamentOrSpeciesOrConfig as Tournament).metric;
      } else {
        cfg = tournamentOrSpeciesOrConfig as TournamentPointsConfig;
      }
    }
  } else if (catchItemOrLength && typeof catchItemOrLength === 'object') {
    length = Number(catchItemOrLength.length) || 0;
    species = catchItemOrLength.species || '';
    if (tournamentOrSpeciesOrConfig && typeof tournamentOrSpeciesOrConfig === 'object') {
      if ('pointsConfig' in tournamentOrSpeciesOrConfig) {
        cfg = (tournamentOrSpeciesOrConfig as Tournament).pointsConfig;
        tournamentMetric = (tournamentOrSpeciesOrConfig as Tournament).metric;
      } else {
        cfg = tournamentOrSpeciesOrConfig as TournamentPointsConfig;
      }
    }
  }

  species = species.trim().toLowerCase();

  // If points config is not enabled and metric is not points, default point = length cm
  if (!cfg || !cfg.enabled) {
    if (tournamentMetric === 'points') {
      const pts = Math.round(length);
      return {
        points: pts,
        breakdown: `${length} cm = ${pts} pts (1 pt por cm)`,
        isValid: true
      };
    }
    return {
      points: Math.round(length),
      breakdown: `${length} cm`,
      isValid: true
    };
  }

  // Check minimum valid length
  if (cfg.minValidLength && length < cfg.minValidLength) {
    return {
      points: 0,
      breakdown: `Tamanho abaixo do mínimo (${cfg.minValidLength} cm). Não pontuou.`,
      isValid: false
    };
  }

  let totalPoints = 0;
  const breakdownParts: string[] = [];

  // 1. Base points per approved fish (e.g. 1 point for any valid fish)
  if (cfg.pointsPerFish && cfg.pointsPerFish > 0) {
    totalPoints += cfg.pointsPerFish;
    breakdownParts.push(`${cfg.pointsPerFish} pt${cfg.pointsPerFish > 1 ? 's' : ''} (base por peixe)`);
  }

  // 2. Points per cm (e.g. 1 pt/cm)
  if (cfg.pointsPerCm && cfg.pointsPerCm > 0) {
    const cmPts = Math.round(length * cfg.pointsPerCm * 10) / 10;
    totalPoints += cmPts;
    breakdownParts.push(`${cmPts} pts (${length} cm × ${cfg.pointsPerCm} pt/cm)`);
  }

  // 3. Size ranges rules (faixas de tamanho)
  const allRules = cfg.rules || cfg.pointRules || [];
  if (allRules.length > 0) {
    let matchedRule = null;
    for (const rule of allRules) {
      const minOk = rule.minCm === undefined || rule.minCm === null || length >= rule.minCm;
      const maxOk = rule.maxCm === undefined || rule.maxCm === null || length <= rule.maxCm;
      const speciesOk = !rule.species || rule.species === 'all' || rule.species.toLowerCase() === species;
      if (minOk && maxOk && speciesOk) {
        matchedRule = rule;
        break;
      }
    }

    if (matchedRule) {
      totalPoints += matchedRule.points;
      breakdownParts.push(`${matchedRule.points} pts (${matchedRule.description || `Faixa ${matchedRule.minCm || 0} a ${matchedRule.maxCm || '∞'} cm`})`);
    }
  }

  // 4. Species Bonus
  if (cfg.speciesBonus && cfg.speciesBonus.length > 0) {
    const bonus = cfg.speciesBonus.find(b => b.species && b.species.toLowerCase() === species);
    if (bonus && bonus.bonusPoints > 0) {
      totalPoints += bonus.bonusPoints;
      breakdownParts.push(`+${bonus.bonusPoints} pts (bônus espécie: ${bonus.species})`);
    }
  }

  // If no points rule fired, fallback to at least 1 pt per fish or length
  if (totalPoints === 0 && allRules.length === 0 && !cfg.pointsPerCm && !cfg.pointsPerFish) {
    totalPoints = 1;
    breakdownParts.push('1 pt (peixe aprovado)');
  }

  const finalPts = Math.round(totalPoints * 10) / 10;
  return {
    points: finalPts,
    breakdown: breakdownParts.join(' + ') || `${finalPts} pts`,
    isValid: true
  };
}

// Update a tournament
export async function updateTournament(tournamentId: string, data: Partial<Tournament>): Promise<void> {
  const cleanedData = cleanFirestoreData(data);
  const docRef = doc(db, 'tournaments', tournamentId);
  await updateDoc(docRef, cleanedData);
}

// Add a new capture window to an existing tournament and notify participants
export async function addCaptureWindowToTournament(
  tournamentId: string,
  tournamentTitle: string,
  windowData: Omit<CaptureWindow, 'id'>
): Promise<CaptureWindow> {
  const tourDocRef = doc(db, 'tournaments', tournamentId);
  const tourSnap = await getDoc(tourDocRef);
  if (!tourSnap.exists()) {
    throw new Error('Campeonato não encontrado.');
  }

  const tourData = tourSnap.data() as Tournament;
  if (tourData.status === 'completed') {
    throw new Error('Não é possível adicionar janelas de captura a um campeonato já finalizado.');
  }

  const newWindowId = `win_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const newWindow: CaptureWindow = {
    id: newWindowId,
    name: windowData.name || `Etapa de ${windowData.date}`,
    date: windowData.date,
    startTime: windowData.startTime || '06:00',
    endTime: windowData.endTime || '18:00',
    secret: windowData.secret || tourData.keyword || 'PESCA2026',
    description: windowData.description || '',
    createdAt: new Date().toISOString()
  };

  const existingWindows: CaptureWindow[] = tourData.captureWindows || [];
  const updatedWindows = [...existingWindows, newWindow];

  // Sort windows by date and time
  updatedWindows.sort((a, b) => {
    const timeA = `${a.date}T${a.startTime || '00:00'}`;
    const timeB = `${b.date}T${b.startTime || '00:00'}`;
    return timeA.localeCompare(timeB);
  });

  await updateDoc(tourDocRef, {
    captureWindows: updatedWindows
  });

  // Create Broadcast Notification for all tournament participants
  try {
    const notifData: Omit<AppNotification, 'id'> = {
      tournamentId,
      tournamentTitle: tourData.title || tournamentTitle,
      title: `Nova Janela de Captura: ${tourData.title || tournamentTitle}`,
      message: `Uma nova etapa/janela de captura foi agendada para o dia ${newWindow.date} das ${newWindow.startTime} às ${newWindow.endTime}.${newWindow.secret ? ` Chave antifraude: ${newWindow.secret}` : ''}`,
      type: 'capture_window',
      windowDate: newWindow.date,
      windowStartTime: newWindow.startTime,
      windowEndTime: newWindow.endTime,
      windowSecret: newWindow.secret,
      readBy: [],
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'notifications'), cleanFirestoreData(notifData));
  } catch (notifErr) {
    console.warn("Aviso ao disparar notificação da nova janela de captura:", notifErr);
  }

  return newWindow;
}

// Remove a capture window from tournament
export async function removeCaptureWindowFromTournament(
  tournamentId: string,
  windowId: string
): Promise<void> {
  const tourDocRef = doc(db, 'tournaments', tournamentId);
  const tourSnap = await getDoc(tourDocRef);
  if (!tourSnap.exists()) {
    throw new Error('Campeonato não encontrado.');
  }

  const tourData = tourSnap.data() as Tournament;
  if (tourData.status === 'completed') {
    throw new Error('Não é possível alterar janelas de um campeonato já finalizado.');
  }

  const existingWindows: CaptureWindow[] = tourData.captureWindows || [];
  const updatedWindows = existingWindows.filter(w => w.id !== windowId);

  await updateDoc(tourDocRef, {
    captureWindows: updatedWindows
  });
}

// Subscribe to real-time notifications for tournaments
export function subscribeNotifications(callback: (notifications: AppNotification[]) => void) {
  const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: AppNotification[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
    });
    callback(list);
  }, (error) => {
    console.error("Erro ao assinar notificações:", error);
  });
}

// Mark notification as read for a user
export async function markNotificationAsRead(notifId: string, userId: string): Promise<void> {
  try {
    const docRef = doc(db, 'notifications', notifId);
    await updateDoc(docRef, {
      readBy: arrayUnion(userId)
    });
  } catch (err) {
    console.warn("Erro ao marcar notificação como lida:", err);
  }
}

// Send custom admin notification (Broadcast to all or direct to specific user or tournament)
export async function sendAdminCustomNotification(data: {
  title: string;
  message: string;
  targetType: 'all' | 'tournament' | 'user';
  userId?: string;
  targetUserName?: string;
  targetUserEmail?: string;
  tournamentId?: string;
  tournamentTitle?: string;
  category?: 'official' | 'urgent' | 'rule' | 'reward' | 'direct' | 'general';
  senderName?: string;
  senderRole?: string;
}): Promise<string> {
  const notifData: Omit<AppNotification, 'id'> = {
    title: data.title.trim(),
    message: data.message.trim(),
    type: data.targetType === 'user' ? 'general' : (data.targetType === 'tournament' ? 'tournament_update' : 'general'),
    userId: data.targetType === 'user' && data.userId ? data.userId.trim() : undefined,
    tournamentId: data.tournamentId ? data.tournamentId.trim() : undefined,
    tournamentTitle: data.tournamentTitle ? data.tournamentTitle.trim() : undefined,
    readBy: [],
    createdAt: serverTimestamp()
  };

  const payload: any = {
    ...cleanFirestoreData(notifData),
    targetType: data.targetType,
    targetUserName: data.targetUserName || undefined,
    targetUserEmail: data.targetUserEmail || undefined,
    category: data.category || 'official',
    senderName: data.senderName || 'Arbitragem / Administração',
    senderRole: data.senderRole || 'Admin'
  };

  const docRef = await addDoc(collection(db, 'notifications'), cleanFirestoreData(payload));
  return docRef.id;
}

// Delete notification (Admin only)
export async function deleteNotification(notifId: string): Promise<void> {
  const docRef = doc(db, 'notifications', notifId);
  await deleteDoc(docRef);
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

// Create an individual participation code strictly ASSIGNED to a specific user/team (Anti-fraud)
export async function createAssignedTournamentCode(data: {
  tournamentId: string;
  tournamentTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCpf?: string;
  category?: 'solo' | 'dupla' | 'trio' | 'quarteto' | 'quinteto';
  maxParticipants?: number;
  paymentStatus?: 'paid' | 'pending' | 'free';
  paymentAmount?: number;
  paymentNotes?: string;
  customCode?: string;
  createdBy?: string;
}): Promise<TournamentCode> {
  // Determine capacity from category or direct maxParticipants
  let finalMax = data.maxParticipants || 1;
  const cat = data.category || 'solo';
  if (cat === 'dupla') finalMax = 2;
  else if (cat === 'trio') finalMax = 3;
  else if (cat === 'quarteto') finalMax = 4;
  else if (cat === 'quinteto') finalMax = 5;
  else if (cat === 'solo') finalMax = 1;

  // Generate unique code
  let finalCode = data.customCode ? data.customCode.trim().toUpperCase() : '';
  if (!finalCode) {
    const cpfSuffix = data.userCpf ? data.userCpf.replace(/\D/g, '').slice(-4) : 'USR';
    const prefix = cat === 'solo' ? `TRN-${cpfSuffix}` : `EQP-${cpfSuffix}`;
    finalCode = generateUniqueTournamentCode(prefix);
  }

  // Ensure code uniqueness in firestore
  const existingSnap = await getDocs(query(collection(db, 'tournament_codes'), where('code', '==', finalCode)));
  if (!existingSnap.empty) {
    // If collision, generate fresh random code
    finalCode = generateUniqueTournamentCode('TRN');
  }

  const docData = {
    code: finalCode,
    tournamentId: data.tournamentId,
    tournamentTitle: data.tournamentTitle,
    assignedToUserId: data.userId,
    assignedToUserName: data.userName,
    assignedToUserEmail: data.userEmail.toLowerCase(),
    assignedToUserCpf: data.userCpf || '',
    category: cat,
    maxParticipants: finalMax,
    usedCount: 0,
    usedByMembers: [],
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
    // 0. Verify Tournament Format & Team Captain requirement
    const tourDocRef = doc(db, 'tournaments', tournamentId);
    const tourSnap = await getDoc(tourDocRef);
    if (!tourSnap.exists()) {
      return { success: false, message: 'Campeonato não encontrado.' };
    }
    const tourData = tourSnap.data() as Tournament;

    const isTeamTourney = Boolean(tourData.teamFormat && tourData.teamFormat !== 'solo');
    if (isTeamTourney) {
      const requiredSpots = tourData.teamFormat === 'dupla' ? 2 : tourData.teamFormat === 'trio' ? 3 : tourData.teamFormat === 'quarteto' ? 4 : 5;
      const userTeam = await getUserTeam(user.uid);

      if (!userTeam) {
        return {
          success: false,
          message: `🚫 INSCRIÇÃO EXCLUSIVA PARA CAPITÃO: Este campeonato é no formato ${tourData.teamFormat?.toUpperCase()} (${requiredSpots} pessoas). Quem não tem equipe deve montar sua própria equipe (sendo o Capitão) ou entrar em uma equipe existente. Pescadores sem equipe podem participar apenas de torneios da categoria Solo.`
        };
      }

      // Check if user is the Captain
      const isCaptain = userTeam.creatorId === user.uid ||
        (user.email && userTeam.creatorEmail && userTeam.creatorEmail.toLowerCase() === user.email.toLowerCase()) ||
        userTeam.members?.some(m => m.userId === user.uid && m.role === 'captain');

      if (!isCaptain) {
        return {
          success: false,
          message: `👑 SOMENTE O CAPITÃO PODE INSCREVER A EQUIPE: Você é membro da equipe "${userTeam.name}". Apenas o Capitão (${userTeam.creatorName || userTeam.creatorEmail || 'Capitão da Equipe'}) pode efetuar o pagamento e autenticar a inscrição da equipe neste campeonato.`
        };
      }

      if (userTeam.status !== 'approved') {
        return {
          success: false,
          message: `🛑 EQUIPE NÃO HOMOLOGADA: Sua equipe "${userTeam.name}" está aguardando aprovação do Administrador para poder participar.`
        };
      }

      if ((userTeam.members?.length || 0) < requiredSpots) {
        return {
          success: false,
          message: `⚠️ EQUIPE INCOMPLETA: Sua equipe "${userTeam.name}" possui ${userTeam.members?.length || 0} de ${requiredSpots} vagas preenchidas. Preencha todas as vagas com os seus parceiros antes de ativar a inscrição.`
        };
      }
    }

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

      const maxLimit = codeRecord.maxParticipants || 1;
      const currentUsedCount = codeRecord.usedCount || (codeRecord.isUsed ? maxLimit : 0);
      const existingMembers = codeRecord.usedByMembers || [];

      // Check if this specific user already used this code
      const alreadyUsedByUser = existingMembers.some(m => m.userId === user.uid || (user.email && m.userEmail.toLowerCase() === user.email.toLowerCase()));

      if (alreadyUsedByUser) {
        // Already enrolled
        await enrollUserInTournament(user.uid, tournamentId);
        return {
          success: true,
          message: `Você já está inscrito neste campeonato com este código (${cleanCode})!`,
          tournamentTitle: codeRecord.tournamentTitle
        };
      }

      // ANTI-FRAUD CHECK 3: Check if code has reached maxParticipants limit
      if (codeRecord.isUsed || currentUsedCount >= maxLimit) {
        const memberNames = existingMembers.map(m => m.userName || m.userEmail).join(', ');
        return {
          success: false,
          message: `🔒 LIMITE DE EQUIPE ATINGIDO: Este código (${cleanCode}) já atingiu a capacidade máxima de ${maxLimit} participante(s) (${memberNames || 'Vagas esgotadas'}). Não é possível cadastrar mais pessoas além do limite permitido.`
        };
      }

      // Record member usage
      const newUsedCount = currentUsedCount + 1;
      const isNowFullyUsed = newUsedCount >= maxLimit;
      const newMemberEntry: any = {
        userId: user.uid,
        userName: user.displayName || user.fullName || user.email,
        userEmail: user.email || '',
        userCpf: user.cpf || '',
        usedAt: new Date().toISOString()
      };
      const updatedMembers = [...existingMembers, newMemberEntry];

      // Update the code in Firestore
      const codeDocRef = doc(db, 'tournament_codes', matchedDoc.id);
      await updateDoc(codeDocRef, {
        usedCount: newUsedCount,
        usedByMembers: updatedMembers,
        isUsed: isNowFullyUsed,
        usedByUserId: user.uid,
        usedByUserName: user.displayName || user.fullName || user.email,
        usedByUserEmail: user.email,
        usedAt: serverTimestamp()
      });

      // Enroll user into tournament
      await enrollUserInTournament(user.uid, tournamentId);

      // If user belongs to a team, sync tournament to entire team and enroll all members
      try {
        const userTeam = await getUserTeam(user.uid);
        if (userTeam) {
          const updatedTourneys = Array.from(new Set([...(userTeam.tournamentIds || []), tournamentId]));
          await updateDoc(doc(db, 'teams', userTeam.id), {
            tournamentIds: updatedTourneys
          });

          // Automatically enroll all existing teammates into this tournament
          if (userTeam.members && userTeam.members.length > 0) {
            for (const member of userTeam.members) {
              if (member.userId && member.userId !== user.uid) {
                await enrollUserInTournament(member.userId, tournamentId);
              }
            }
          }
        }
      } catch (teamSyncErr) {
        console.warn("Aviso ao sincronizar torneio com equipe:", teamSyncErr);
      }

      return {
        success: true,
        message: 'Código de inscrição autenticado com sucesso! Inscrição confirmada no torneio.',
        tournamentTitle: codeRecord.tournamentTitle
      };
    }

    // 2. Fallback check on tournament.tournamentCode or tournament.keyword if not yet entered in table
    if (tourSnap.exists()) {
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

        // Sync with team
        try {
          const userTeam = await getUserTeam(user.uid);
          if (userTeam) {
            const updatedTourneys = Array.from(new Set([...(userTeam.tournamentIds || []), tournamentId]));
            await updateDoc(doc(db, 'teams', userTeam.id), {
              tournamentIds: updatedTourneys
            });
            if (userTeam.members && userTeam.members.length > 0) {
              for (const member of userTeam.members) {
                if (member.userId && member.userId !== user.uid) {
                  await enrollUserInTournament(member.userId, tournamentId);
                }
              }
            }
          }
        } catch (teamSyncErr) {
          console.warn("Aviso ao sincronizar torneio com equipe:", teamSyncErr);
        }

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

    // Update user doc & enroll in all team tournaments
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        teamId: team.id,
        teamName: team.name,
        teamLogo: team.logoUrl || ''
      });

      // Automatically enroll into all tournaments that the team/captain already paid and signed up for
      if (updatedTournamentIds && updatedTournamentIds.length > 0) {
        for (const tourneyId of updatedTournamentIds) {
          await enrollUserInTournament(user.uid, tourneyId);
        }
      }
    } catch (e) {
      console.warn("Aviso ao atualizar perfil e inscrições do usuário ao entrar na equipe:", e);
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

    // Clear team from user doc and record teamLeftAt (7-day rule)
    const nowIso = new Date().toISOString();
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        teamId: '',
        teamName: '',
        teamLogo: '',
        teamLeftAt: nowIso
      });
    } catch (e) {
      console.warn("Aviso ao limpar dados de equipe do usuário:", e);
    }

    return {
      success: true,
      message: 'Você saiu da equipe com sucesso. Regulamento oficial: É necessário aguardar 7 dias corridos para criar ou ingressar em outra equipe.'
    };
  } catch (error: any) {
    console.error("Erro ao sair da equipe:", error);
    return {
      success: false,
      message: 'Erro ao sair da equipe: ' + (error.message || 'Tente novamente.')
    };
  }
}

// Delete Team by Creator (Only creator can delete, and ONLY after removing all other members)
export async function deleteTeamByCreator(
  teamId: string,
  creatorUserId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const teamRef = doc(db, 'teams', teamId);
    const teamSnap = await getDoc(teamRef);

    if (!teamSnap.exists()) {
      return { success: false, message: 'Equipe não encontrada no sistema.' };
    }

    const team = teamSnap.data() as Team;

    // Check if requester is really the creator
    if (team.creatorId !== creatorUserId) {
      return { 
        success: false, 
        message: 'Apenas o pescador que criou a equipe tem autorização para excluí-la.' 
      };
    }

    // Check if there are still other members in the team
    const otherMembers = (team.members || []).filter(m => m.userId !== creatorUserId);
    if (otherMembers.length > 0) {
      return {
        success: false,
        message: `⚠️ Para excluir a equipe, você deve primeiro remover todos os ${otherMembers.length} outro(s) participante(s). A equipe só pode ser excluída quando restar apenas você.`
      };
    }

    // Delete the team doc from Firestore
    await deleteDoc(teamRef);

    // Clear creator's user doc team info & record teamLeftAt (7-day rule)
    const nowIso = new Date().toISOString();
    try {
      const userRef = doc(db, 'users', creatorUserId);
      await updateDoc(userRef, {
        teamId: '',
        teamName: '',
        teamLogo: '',
        teamLeftAt: nowIso
      });
    } catch (e) {
      console.warn("Aviso ao limpar dados de equipe do criador:", e);
    }

    return {
      success: true,
      message: 'Equipe excluída com sucesso!'
    };
  } catch (error: any) {
    console.error("Erro ao excluir equipe:", error);
    return {
      success: false,
      message: 'Erro ao excluir equipe: ' + (error.message || 'Tente novamente.')
    };
  }
}

// Check 7-day cooldown helper
export function getTeamChangeRemainingCooldownMs(teamLeftAt?: any): number {
  if (!teamLeftAt) return 0;
  let timestamp = 0;
  if (typeof teamLeftAt === 'string') {
    timestamp = new Date(teamLeftAt).getTime();
  } else if (teamLeftAt?.toDate) {
    timestamp = teamLeftAt.toDate().getTime();
  } else if (typeof teamLeftAt === 'number') {
    timestamp = teamLeftAt;
  }
  if (!timestamp || isNaN(timestamp)) return 0;
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const diff = timestamp + SEVEN_DAYS_MS - Date.now();
  return diff > 0 ? diff : 0;
}

// Format cooldown to human readable string (e.g. "6 dias, 14 horas e 22 minutos")
export function formatCooldown(ms: number): string {
  if (ms <= 0) return '0 minutos';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} dia${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
  return parts.join(', ');
}

// =========================================================================
// SUPPORT & ADMIN CONTACT TICKETS
// =========================================================================

// Send a support message to Admin
export async function sendSupportMessage(data: {
  userId: string;
  userName: string;
  userEmail: string;
  userCpf?: string;
  userPhoto?: string;
  subject: string;
  message: string;
  tournamentId?: string;
  tournamentTitle?: string;
}): Promise<{ success: boolean; message: string; ticketId?: string }> {
  try {
    const payload = cleanFirestoreData({
      userId: data.userId,
      userName: data.userName || 'Pescador',
      userEmail: data.userEmail || '',
      userCpf: data.userCpf || '',
      userPhoto: data.userPhoto || '',
      subject: data.subject.trim(),
      message: data.message.trim(),
      tournamentId: data.tournamentId || '',
      tournamentTitle: data.tournamentTitle || '',
      status: 'open',
      adminResponse: '',
      answeredBy: '',
      answeredByName: '',
      answeredAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const docRef = await addDoc(collection(db, 'support_messages'), payload);
    return { 
      success: true, 
      message: 'Sua mensagem de suporte foi enviada ao Administrador! Aguarde o retorno pela plataforma.', 
      ticketId: docRef.id 
    };
  } catch (err: any) {
    console.error("Erro ao enviar mensagem de suporte:", err);
    return { 
      success: false, 
      message: 'Erro ao enviar mensagem: ' + (err.message || 'Tente novamente.') 
    };
  }
}

// Subscribe to all support messages (Admin only)
export function subscribeSupportMessages(callback: (messages: SupportMessage[]) => void) {
  const q = query(collection(db, 'support_messages'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const list: SupportMessage[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as SupportMessage);
    });
    callback(list);
  }, (err) => {
    console.error("Erro ao assinar mensagens de suporte:", err);
  });
}

// Subscribe to user's support messages
export function subscribeUserSupportMessages(userId: string, callback: (messages: SupportMessage[]) => void) {
  const q = query(collection(db, 'support_messages'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const list: SupportMessage[] = [];
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as SupportMessage);
    });
    list.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (new Date(a.createdAt).getTime() || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (new Date(b.createdAt).getTime() || 0);
      return dateB - dateA;
    });
    callback(list);
  }, (err) => {
    console.error("Erro ao assinar mensagens de suporte do usuário:", err);
  });
}

// Respond to support message (Admin only)
export async function respondSupportMessage(
  ticketId: string, 
  adminUserOrResponse: UserProfile | string, 
  responseTextOrAdminId?: string,
  adminName?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, 'support_messages', ticketId);
    let finalResponse = '';
    let adminId = '';
    let finalAdminName = 'ADMIN';

    if (typeof adminUserOrResponse === 'object') {
      finalResponse = (responseTextOrAdminId || '').trim();
      adminId = adminUserOrResponse.uid;
      finalAdminName = adminUserOrResponse.displayName || adminUserOrResponse.fullName || 'ADMIN';
    } else {
      finalResponse = (adminUserOrResponse || '').trim();
      adminId = responseTextOrAdminId || 'admin';
      finalAdminName = adminName || 'ADMIN';
    }

    await updateDoc(docRef, {
      adminResponse: finalResponse,
      status: 'answered',
      answeredBy: adminId,
      adminId: adminId,
      answeredByName: finalAdminName,
      adminName: finalAdminName,
      answeredAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { 
      success: true, 
      message: 'Resposta oficial enviada com sucesso ao competidor!' 
    };
  } catch (err: any) {
    console.error("Erro ao responder suporte:", err);
    return { 
      success: false, 
      message: 'Erro ao salvar resposta: ' + (err.message || 'Tente novamente.') 
    };
  }
}

export const respondToSupportMessage = respondSupportMessage;

// Delete/Close support message (Admin or User)
export async function deleteSupportMessage(ticketId: string): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, 'support_messages', ticketId);
    await deleteDoc(docRef);
    return { 
      success: true, 
      message: 'Mensagem de suporte removida com sucesso.' 
    };
  } catch (err: any) {
    console.error("Erro ao excluir mensagem de suporte:", err);
    return { 
      success: false, 
      message: 'Erro ao excluir mensagem: ' + (err.message || 'Tente novamente.') 
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

// Lista de palavras e termos sonoros, fáceis e memoráveis para o pescador falar com clareza no vídeo de homologação
export const EASY_VIDEO_KEYWORDS = [
  'TUCUNA SHOW',
  'ISCA VERDE',
  'ANZOL DOURADO',
  'DORADO BRASIL',
  'RIO GRANDE',
  'TRAIRA 10',
  'PINDA 77',
  'TAMBAQUI TOP',
  'PEIXE VIVO',
  'ISCA BRAVA',
  'LAGO AZUL',
  'PANTANAL 26',
  'CORVINA BR',
  'BASS MASTER',
  'GIGANTE DO RIO',
  'PIRARARA BR',
  'PINCHO CERTO',
  'LINHA FORTE',
  'AGUA LIMPA',
  'RIO PARANA',
  'MARE BOA',
  'FISGADA 10',
  'ISCA DE OURO',
  'CAMPEAO 2026',
  'PESCA BRUTA',
  'VALE TROFEU',
  'TUCUNA AZUL',
  'ISCA PLUG',
  'PINTADO TOP',
  'RIO ARAGUAIA',
  'PESCA TOTAL',
  'ANZOL AFIADO',
  'SOLTURA 10',
  'MEDICAO OFICIAL',
  'TROFEU BRASIL'
];

// Gerador de palavra-chave fácil de falar no vídeo
export function generateEasyVideoKeyword(): string {
  const randomIndex = Math.floor(Math.random() * EASY_VIDEO_KEYWORDS.length);
  return EASY_VIDEO_KEYWORDS[randomIndex];
}

// Formatar data e horário exato para auditoria
export function formatExactDateTime(val: any): string {
  if (!val) return 'Data não registrada';
  let d: Date;
  if (val instanceof Date) {
    d = val;
  } else if (val?.toDate && typeof val.toDate === 'function') {
    d = val.toDate();
  } else if (typeof val === 'number') {
    d = new Date(val);
  } else if (typeof val === 'string') {
    d = new Date(val);
  } else if (val?.seconds) {
    d = new Date(val.seconds * 1000);
  } else {
    d = new Date();
  }

  if (isNaN(d.getTime())) return 'Data inválida';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} às ${hours}:${minutes}:${seconds}`;
}

// Helper para verificar status de uma Janela de Captura individual
export function getCaptureWindowStatus(win: CaptureWindow, now = new Date()): {
  status: 'live' | 'upcoming' | 'expired';
  label: string;
  badgeColor: string;
  timeRemainingStr?: string;
  opensInStr?: string;
  endDate?: Date;
  remainingMs?: number;
} {
  if (!win || !win.date) {
    return { status: 'expired', label: 'Indefinida', badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700' };
  }

  const [year, month, day] = win.date.split('-').map(Number);
  const [startH, startM] = (win.startTime || '06:00').split(':').map(Number);
  const [endH, endM] = (win.endTime || '18:00').split(':').map(Number);

  const startDate = new Date(year, month - 1, day, startH, startM, 0);
  const endDate = new Date(year, month - 1, day, endH, endM, 0);

  const nowMs = now.getTime();

  if (nowMs < startDate.getTime()) {
    const diffMs = startDate.getTime() - nowMs;
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const opensInStr = diffH > 24 ? `${Math.floor(diffH / 24)}d ${diffH % 24}h` : `${diffH}h ${diffM}min`;
    return { 
      status: 'upcoming', 
      label: `Abre em ${opensInStr}`, 
      badgeColor: 'bg-sky-500/10 text-sky-400 border border-sky-500/30',
      opensInStr,
      endDate,
      remainingMs: 0
    };
  }

  if (nowMs >= startDate.getTime() && nowMs <= endDate.getTime()) {
    // AO VIVO DENTRO DO HORÁRIO CONFIGURADO PELO ADMIN
    const remainingMs = endDate.getTime() - nowMs;
    const diffH = Math.floor(remainingMs / (1000 * 60 * 60));
    const diffM = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffS = Math.floor((remainingMs % (1000 * 60)) / 1000);
    const timeRemainingStr = `${String(diffH).padStart(2, '0')}h ${String(diffM).padStart(2, '0')}m ${String(diffS).padStart(2, '0')}s`;

    return { 
      status: 'live', 
      label: 'AO VIVO AGORA', 
      badgeColor: 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/30 animate-pulse',
      timeRemainingStr,
      endDate,
      remainingMs
    };
  }

  // APÓS O HORÁRIO CONFIGURADO PELO ADMIN (ENCERRADA)
  return { 
    status: 'expired', 
    label: 'Encerrada', 
    badgeColor: 'bg-rose-950/40 text-rose-400 border border-rose-800/60',
    endDate,
    remainingMs: 0
  };
}

// Helper para formatar contagem regressiva precisa de milissegundos
export function formatTimeRemainingMs(ms: number): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  if (ms <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, formatted: '00h 00m 00s' };
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  return { hours, minutes, seconds, formatted };
}

// Helper completo de verificação de permissão para envio de capturas
export function getTournamentSubmissionDeadline(tournament: Tournament | null | undefined, now = new Date()): {
  canSubmit: boolean;
  status: 'open_live' | 'tournament_completed' | 'window_expired' | 'window_upcoming' | 'tournament_upcoming' | 'open_standard';
  title: string;
  message: string;
  activeWindow: CaptureWindow | null;
  deadlineDate: Date | null;
  remainingMs: number;
  remainingFormatted: string;
} {
  if (!tournament) {
    return {
      canSubmit: false,
      status: 'window_expired',
      title: 'Selecione um Torneio',
      message: 'Selecione um campeonato para validar os prazos de envio.',
      activeWindow: null,
      deadlineDate: null,
      remainingMs: 0,
      remainingFormatted: '00h 00m 00s'
    };
  }

  // REGRA 1: Torneio Encerrado / Concluído
  if (tournament.status === 'completed') {
    return {
      canSubmit: false,
      status: 'tournament_completed',
      title: 'Campeonato Encerrado',
      message: '🚫 Este campeonato foi oficialmente encerrado. Não é mais possível enviar capturas para avaliação.',
      activeWindow: null,
      deadlineDate: null,
      remainingMs: 0,
      remainingFormatted: '00h 00m 00s'
    };
  }

  const windows = tournament.captureWindows || [];

  // REGRA 2: Campeonato com Janelas de Captura estritas
  if (windows.length > 0) {
    let activeLiveWindow: CaptureWindow | null = null;
    let nextUpcomingWindow: CaptureWindow | null = null;
    let nextUpcomingStr = '';
    let remainingMs = 0;
    let windowEndDate: Date | null = null;

    for (const w of windows) {
      const st = getCaptureWindowStatus(w, now);
      if (st.status === 'live') {
        activeLiveWindow = w;
        remainingMs = st.remainingMs || 0;
        windowEndDate = st.endDate || null;
        break;
      } else if (st.status === 'upcoming' && !nextUpcomingWindow) {
        nextUpcomingWindow = w;
        nextUpcomingStr = st.opensInStr || '';
      }
    }

    // Se existe janela ativa no exato momento (data e horário do Admin)
    if (activeLiveWindow) {
      const timeFmt = formatTimeRemainingMs(remainingMs).formatted;
      return {
        canSubmit: true,
        status: 'open_live',
        title: 'Janela de Captura Aberta (AO VIVO)',
        message: `Prova em andamento (${activeLiveWindow.name || 'Etapa'}). O envio de capturas está liberado até às ${activeLiveWindow.endTime || '18:00'} de hoje.`,
        activeWindow: activeLiveWindow,
        deadlineDate: windowEndDate,
        remainingMs,
        remainingFormatted: timeFmt
      };
    }

    // Se nenhuma janela está aberta agora, mas há janela futura
    if (nextUpcomingWindow) {
      const dateFormatted = nextUpcomingWindow.date ? nextUpcomingWindow.date.split('-').reverse().join('/') : '';
      return {
        canSubmit: false,
        status: 'window_upcoming',
        title: 'Janela de Captura Não Aberta',
        message: `⏳ O envio ainda não está disponível. A próxima etapa (${nextUpcomingWindow.name || 'Etapa'}) abre em ${dateFormatted} às ${nextUpcomingWindow.startTime || '06:00'}${nextUpcomingStr ? ` (em ${nextUpcomingStr})` : ''}.`,
        activeWindow: null,
        deadlineDate: null,
        remainingMs: 0,
        remainingFormatted: '00h 00m 00s'
      };
    }

    // Todas as janelas de captura do campeonato já encerraram no tempo estipulado pelo Admin
    return {
      canSubmit: false,
      status: 'window_expired',
      title: 'Janela de Captura Encerrada',
      message: '🚫 A data e horário limite da janela de captura definidos pela Administração foram encerrados. Não é mais possível enviar capturas para avaliação deste campeonato.',
      activeWindow: null,
      deadlineDate: null,
      remainingMs: 0,
      remainingFormatted: '00h 00m 00s'
    };
  }

  // REGRA 3: Campeonato Tradicional (sem janelas estritas)
  if (tournament.status === 'upcoming') {
    return {
      canSubmit: false,
      status: 'tournament_upcoming',
      title: 'Torneio em Breve',
      message: 'Este campeonato ainda não iniciou suas provas. Aguarde a data de início para enviar capturas.',
      activeWindow: null,
      deadlineDate: null,
      remainingMs: 0,
      remainingFormatted: '00h 00m 00s'
    };
  }

  // Verifica data limite do campeonato tradicional se houver endDate
  if (tournament.endDate) {
    try {
      const [endYear, endMonth, endDay] = tournament.endDate.split('-').map(Number);
      const endDateTime = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);
      if (now.getTime() > endDateTime.getTime()) {
        const formattedDate = `${String(endDay).padStart(2, '0')}/${String(endMonth).padStart(2, '0')}/${endYear}`;
        return {
          canSubmit: false,
          status: 'tournament_completed',
          title: 'Campeonato Encerrado',
          message: `🚫 O prazo oficial deste campeonato encerrou em ${formattedDate}. Não é mais possível enviar capturas para avaliação.`,
          activeWindow: null,
          deadlineDate: null,
          remainingMs: 0,
          remainingFormatted: '00h 00m 00s'
        };
      }
    } catch {
      // ignore
    }
  }

  return {
    canSubmit: true,
    status: 'open_standard',
    title: 'Envio Liberado',
    message: 'Envio regular de capturas liberado durante todo o período do torneio.',
    activeWindow: null,
    deadlineDate: null,
    remainingMs: 0,
    remainingFormatted: ''
  };
}

// Helper para verificar se um Torneio está AO VIVO no momento atual
export function getTournamentLiveStatus(tournament: Tournament, now = new Date()): {
  isLive: boolean;
  activeWindow: CaptureWindow | null;
  upcomingWindow: CaptureWindow | null;
  timeRemainingStr: string;
} {
  if (!tournament || tournament.status !== 'active') {
    return { isLive: false, activeWindow: null, upcomingWindow: null, timeRemainingStr: '' };
  }

  const windows = tournament.captureWindows || [];
  if (windows.length === 0) {
    // Torneio tradicional ativo sem janelas estritas
    return { isLive: false, activeWindow: null, upcomingWindow: null, timeRemainingStr: '' };
  }

  let activeWin: CaptureWindow | null = null;
  let upcomingWin: CaptureWindow | null = null;
  let timeRemaining = '';

  for (const w of windows) {
    const st = getCaptureWindowStatus(w, now);
    if (st.status === 'live') {
      activeWin = w;
      timeRemaining = st.timeRemainingStr || '';
      break;
    } else if (st.status === 'upcoming' && !upcomingWin) {
      upcomingWin = w;
    }
  }

  return {
    isLive: Boolean(activeWin),
    activeWindow: activeWin,
    upcomingWindow: upcomingWin,
    timeRemainingStr: timeRemaining
  };
}

// Helper para atualizar a foto de perfil do usuário
export async function updateUserProfilePhoto(userId: string, photoURL: string): Promise<void> {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    photoURL: photoURL.trim()
  });
}

// Assinar todos os perfis de usuários em tempo real (para rankings e fotos de perfil)
export function subscribeAllUsers(callback: (users: UserProfile[]) => void) {
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




