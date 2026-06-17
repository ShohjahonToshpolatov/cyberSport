export enum UserRole {
    PLAYER = 'player',
    TEAM = 'team'
}

export enum EsportGame {
    CS2 = 'CS:GO / CS2',
    DOTA2 = 'Dota 2',
    PUBG = 'PUBG Mobile',
    VALORANT = 'Valorant'
}

export enum OfferStatus {
    PENDING = 'pending', // Kutilmoqda
    ACCEPTED = 'accepted', // Qabul qilindi
    REJECTED = 'rejected' // Rad etildi
}


export interface CyberPlayer {
    id: string;
    userId: string; // Tizimdagi foydalanuvchi IDsi
    nickname: string;
    fullName: string;
    avatarUrl?: string;
    mainGame: EsportGame;
    rank: string; // Masalan: Faceit 10 lvl, Immortal, Radiant
    experienceYears: number;
    currentTeamId?: string | null; // Hozir biron jamoadami?
    pastTeams: string[]; // Oldin o'ynagan jamoalari ro'yxati
    bio: string;
    socialLinks: {
        steam?: string;
        discord?: string;
        youtube?: string;
    };
    settings: {
        isLookingForTeam: boolean; // Jamoa qidiryaptimi?
        showMessagesFromUnknown: boolean;
    };
}

export interface CyberTeam {
    id: string;
    userId: string;
    teamName: string;
    logoUrl?: string;
    createdYear: number;
    achievements: string[]; // Yutuqlari (masalan: Najot Cup Winner)
    lookingForGames: EsportGame[]; // Qaysi o'yinlar bo'yicha o'yinchi qidiryapti
    description: string;
    website?: string;
    membersCount: number;
}

export interface TeamOffer {
    id: string;
    teamId: string;
    teamName: string; // Tezroq o'qish uchun xabarnomada ko'rsatishga
    playerId: string;
    message: string; // "Biz sizni jamoamizga taklif qilamiz..."
    salaryOffer?: number; // ixtiyoriy: taklif qilinayotgan oylik
    status: OfferStatus;
    createdAt: Date;
}