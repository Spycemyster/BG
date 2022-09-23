/**
 * The definitions class contains all the metadata for everything in the game. All objects are loaded into memory
 * and updated if outdated.
 */

import * as admin from 'firebase-admin';
import { GuildTeam, MemberData } from './game/character';
import { MissionData } from './game/expedition';
import { GameItem } from './game/item';
import * as firestore from 'firebase-admin/firestore';
export interface Loadable {
    load(data: firestore.DocumentData): void;

    /**
     * Gets this class as a firestore supported object
     */
    data(): any;
}

/**
 * A rarity value for character/item.
 */
export enum Rarity {
    Common,
    Uncommon,
    Rare,
    Ultra,
    Legendary,
}

export interface Reward {
    rarityWeight: number;
    type: string;
    quantity: number;
    id: string;
}

let memberData: Map<string, MemberData>;
export async function getMember(name: string) {
    const data = await getFullMembersData();
    return data.get(name);
}

export async function getMemberList() {
    const data = await getFullMembersData();
    return data.keys();
}

export async function getFullMembersData() {
    memberData = memberData || (await readAllCollectionData<MemberData>('def_characters'));
    return memberData;
}

export async function updateMemberData(name: string, data: MemberData) {
    await getFullMembersData();
    memberData.set(name, data);
}

let expeditionData: Map<string, MissionData>;
export async function getExpedition(name: string) {
    const data = await getFullExpeditionData();
    return data.get(name);
}

export async function getExpeditionList() {
    const data = await getFullExpeditionData();
    return data.keys();
}

export async function getFullExpeditionData() {
    expeditionData = expeditionData || (await readAllCollectionData<MissionData>('def_expeditions'));
    return expeditionData;
}

export async function updateExpeditionData(name: string, data: MissionData) {
    await getFullExpeditionData();
    expeditionData.set(name, data);
}

let itemsData: Map<string, GameItem>;
export async function getItem(name: string) {
    const data = await getFullItemsData();
    return data.get(name);
}

export async function getItemsList() {
    const data = await getFullItemsData();
    return data.keys();
}

export async function getFullItemsData() {
    itemsData = itemsData || (await readAllCollectionData<GameItem>('def_items'));
    return itemsData;
}

export async function updateItemData(name: string, data: GameItem) {
    await getFullItemsData();
    itemsData.set(name, data);
}

// #region Enemy Stage
export interface EnemyStageData {
    id: string;
    waves: GuildTeam[];
    rewardPool: Reward[];
    numRewards: number;
}

let enemiesData: Map<string, EnemyStageData>;
export async function getFullEnemiesData() {
    enemiesData = enemiesData || (await readAllCollectionData<EnemyStageData>('def_enemies'));
    return enemiesData;
}

export async function getEnemy(name: string) {
    const data = await getFullEnemiesData();
    return data.get(name);
}
export async function updateEnemyData(name: string, data: any) {
    await getFullEnemiesData();
    enemiesData.set(name, data);
}
// #endregion

//#region Adventure Data
export interface StrippedStoryWorld {
    icon: string;
    title: string;
    chapters: Array<StrippedStoryChapter>;
}

export interface StrippedStoryChapter {
    description: string;
}

export interface StoryWorld {
    icon: string;
    title: string;
    chapters: Array<StoryChapter>;
}

export interface StoryChapter {
    description: string;
    dialogues: Array<ChapterDialogue>;
}

export type ChapterDialogue = {
    background: string;
    effects: any[];
    text: string;
};

let storyData: Map<string, StoryWorld>;

export async function getFullStrippedStoriesData(): Promise<Map<string, StrippedStoryWorld>> {
    const data = await getFullStoriesData();
    const strippedData = new Map<string, StrippedStoryWorld>();
    data.forEach((value, key) => {
        strippedData.set(key, {
            icon: value.icon,
            title: value.title,
            chapters: value.chapters.map((chapter) => {
                return {
                    description: chapter.description,
                };
            }),
        });
    });
    return strippedData;
}

export async function getStory(name: string) {
    const data = await getFullStoriesData();
    return data.get(name);
}

export async function getFullStoriesData() {
    storyData = storyData || (await readAllCollectionData<StoryWorld>('def_stories'));
    return storyData;
}

export async function getFullStoriesList() {
    const stories = await getFullStoriesData();
    return stories.keys();
}

export async function updateStoryData(name: string, data: StoryWorld) {
    await getFullStoriesList();
    storyData.set(name, data);
}
//#endregion

/**
 * Reads all the documents from the given collection and stores it inside a map.
 * @param path The collection path
 * @returns An object that holds all the
 */
async function readAllCollectionData<T>(path: string) {
    const snapshot = await admin.firestore().collection(path).get();
    const data = new Map<string, T>();
    for (let i = 0; i < snapshot.docs.length; i++) {
        const doc = snapshot.docs[i];
        data.set(doc.id, doc.data() as T);
    }
    return data;
}
