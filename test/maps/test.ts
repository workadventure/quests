// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../node_modules/@workadventure/iframe-api-typings/iframe_api.d.ts" />

import {HasPlayerMovedEvent} from "@workadventure/iframe-api-typings/front/Api/Events/HasPlayerMovedEvent";
import {levelUp} from "../../src";

console.log("Starting test script");
WA.onInit().then(() => {
    let oldPosition: HasPlayerMovedEvent | undefined;
    let totalDistance = 0;
    WA.player.onPlayerMove((movement) => {
        if (!oldPosition) {
            oldPosition = movement;
            return;
        }
        const distance = Math.sqrt(
            Math.pow(movement.x - oldPosition.x, 2) + Math.pow(movement.y - oldPosition.y, 2)
        );
        oldPosition = movement;
        totalDistance += distance;
        console.log('totalDistance', totalDistance);

        // Each time we reach 500px, we grant 1 XP
        if (totalDistance > 500) {
            levelUp("FIRST_QUEST", 1).catch(e => console.error(e));
            console.log('1 XP granted');
            totalDistance -= 500;
        }
    });

});