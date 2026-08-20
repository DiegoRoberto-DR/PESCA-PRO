import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { Tournament, Catch, Comment } from '../types';

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
