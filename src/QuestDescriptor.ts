import { type BadgeDescriptor } from "./BadgeDescriptor";

export interface QuestDescriptor {
    name: string;
    description: string;
    key: string;
    icon_url: string;
    xp: number;
    badges: BadgeDescriptor[];
}
