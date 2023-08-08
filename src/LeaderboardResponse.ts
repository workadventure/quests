export interface LeaderboardEntry {
    member: string;
    xp: number;
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
}
