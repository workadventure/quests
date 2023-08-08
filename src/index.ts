// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/@workadventure/iframe-api-typings/iframe_api.d.ts" />

import { type QuestDescriptor } from "./QuestDescriptor";
import { type LeaderboardResponse } from "./LeaderboardResponse";

let questBaseUrl = "https://admin.workadventure.localhost";

/**
 * INTERNAL: Sets the base URL of the quest server. This function should only be called if you are performing
 * tests on a local instance of the admin server (or using a staging environment).
 *
 * @param baseUrl
 */
export function setQuestBaseUrl(baseUrl: string): void {
    questBaseUrl = baseUrl;
}

export function grantXp(questKey: string, xp: number): void {
    console.log("grantXp", questKey, xp);
}

function getUserRoomToken(): string {
    const userRoomToken = WA.player.userRoomToken;
    if (userRoomToken === undefined) {
        throw new Error(
            "No userRoomToken found. The quests plugin can only work with WorkAdventure SAAS edition (at https://play.workadventu.re).",
        );
    }
    return userRoomToken;
}

/**
 * Returns the quest whose key is `questKey` for the current user (along with the amount of XP earned for this quest).
 */
export async function getQuest(questKey: string): Promise<QuestDescriptor> {
    const url = new URL(`/api/quests/${questKey}`, questBaseUrl);
    url.search = new URLSearchParams({ room: WA.room.id }).toString();
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: getUserRoomToken(),
        },
    });
    if (!response.ok) {
        throw new Error(`An error occurred. HTTP Code: ${response.status} ${response.statusText}.`);
    }
    return await response.json();
}

/**
 * Returns the leaderboard for the quest whose key is `questKey`.
 */
export async function getLeaderboard(questKey: string): Promise<LeaderboardResponse> {
    const url = new URL(`/api/quests/${questKey}/leaderboard`, questBaseUrl);
    url.search = new URLSearchParams({ room: WA.room.id }).toString();
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: getUserRoomToken(),
        },
    });
    if (!response.ok) {
        throw new Error(`An error occurred. HTTP Code: ${response.status} ${response.statusText}.`);
    }
    return await response.json();
}

/**
 * Earns `xp` XP for the quest whose key is `questKey` for the current user.
 */
export async function levelUp(questKey: string, xp: number): Promise<void> {
    const url = new URL(`/api/quests/${questKey}/level-up`, questBaseUrl);
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: getUserRoomToken(),
            body: JSON.stringify({ xp, room: WA.room.id }),
        },
    });
    if (!response.ok) {
        throw new Error(`An error occurred. HTTP Code: ${response.status} ${response.statusText}.`);
    }
    return await response.json();
}
