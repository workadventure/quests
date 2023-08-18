// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../node_modules/@workadventure/iframe-api-typings/iframe_api.d.ts" />

import { type QuestDescriptor } from "./QuestDescriptor";
import { type LeaderboardResponse } from "./LeaderboardResponse";
import { type LevelUpResponse } from "./LevelUpResponse";

let questBaseUrl = "https://admin.workadventu.re";

/**
 * INTERNAL: Sets the base URL of the quest server. This function should only be called if you are performing
 * tests on a local instance of the admin server (or using a staging environment).
 *
 * @param baseUrl
 */
export function setQuestBaseUrl(baseUrl: string): void {
    questBaseUrl = baseUrl;
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
 * Returns the leaderboard for the quest whose key is `questKey` as JS object.
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
 * Returns the URL of the leaderboard as an HTML page (to be displayed in an iframe).
 * @return URL
 */
export function getLeaderboardURL(questKey: string): URL {
    const url = new URL(`/quests/${questKey}/leaderboard`, questBaseUrl);
    url.search = new URLSearchParams({ room: WA.room.id, token: getUserRoomToken() }).toString();
    return url;
}

/**
 * Earns `xp` XP for the quest whose key is `questKey` for the current user.
 */
export async function levelUp(questKey: string, xp: number): Promise<LevelUpResponse> {
    const url = new URL(`/api/quests/${questKey}/level-up`, questBaseUrl);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: getUserRoomToken(),
        },
        body: JSON.stringify({ xp }),
    });
    if (!response.ok) {
        throw new Error(`An error occurred. HTTP Code: ${response.status} ${response.statusText}.`);
    }
    const data: LevelUpResponse = await response.json();
    if (data.awardedBadges.length > 0) {
        (async () => {
            for (const badge of data.awardedBadges) {
                // Display awarded badges one by one
                await displayCongratulations(questKey, badge);
            }
        })().catch((e) => {
            console.error(e);
        });
    }
    return data;
}

async function displayCongratulations(quest: string, badge: string): Promise<void> {
    const url = new URL(`/quests/${quest}/badge/${badge}/congratulations`, questBaseUrl);
    url.search = new URLSearchParams({ token: getUserRoomToken() }).toString();
    await WA.ui.website.open({
        url: url.toString(),
        position: {
            vertical: "middle",
            horizontal: "middle",
        },
        allowApi: true,
        visible: true,
        size: {
            width: "100%",
            height: "100%",
        },
    });

    const soundUrl = new URL(`/audio/clapping.mp3`, questBaseUrl);
    WA.sound.loadSound(soundUrl.toString()).play({
        loop: false,
        volume: 1,
    });
}
