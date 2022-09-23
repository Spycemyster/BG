import * as firestore from 'firebase-admin/firestore';
import { getConfigField } from '../config';
import { Loadable, getFullExpeditionData, getExpeditionList } from '../definitions';
import { GameItemInstance } from './item';
export interface ExpeditionReward {
    exp: number;
    money: number;
    items: Array<GameItemInstance>;
}

export class Expeditions implements Loadable {
    missions: Array<MissionData>;
    uid: string;
    completionTime: Array<number>;
    creationTime: number;
    startTimes: Array<number>;
    current: number;
    isDailyCollected: boolean;
    constructor(uid: string, count = 0) {
        this.missions = new Array<MissionData>(count);
        console.log(`Creating expedition of size ${count} ${this.missions.length} ${typeof count}`);
        this.completionTime = new Array<number>(count);
        this.creationTime = Date.now();
        this.uid = uid;
        // -1 -> not started
        // -2 -> reward collected
        this.startTimes = new Array<number>(count).fill(-1);
        this.current = -1;
        this.isDailyCollected = false;
    }

    /**
     * Creates a random list of expeditions.
     * @TODO Make the expeditions unique (do this when we have more definitions of expeditions)
     */
    async randomize() {
        const expeditionTimeRange = getConfigField('ExpeditionTimeRange');
        const expeditionNameList = getExpeditionList();
        const expeditionDataList = await getFullExpeditionData();
        const missions = Array.from(await expeditionNameList);
        let index = 0;
        while (index < this.missions.length) {
            const key = missions[Math.floor(Math.random() * missions.length)];
            const data = expeditionDataList.get(key);
            if (data) this.missions[index++] = data;
        }
        const range = JSON.parse(await expeditionTimeRange) as { min: number; max: number };
        console.log(`${range['min']} ${range.min} ${typeof range.min}`);
        console.log(`${range['max']} ${range.max} ${typeof range.max}`);
        for (let i = 0; i < this.missions.length; i++) {
            const time = Math.floor(Math.random() * (range.max - range.min) + range.min);
            this.completionTime[i] = time;
        }

        this.creationTime = Date.now();
    }

    /**
     * Attempts to start an expedition.
     * @param idx The index of the expedition to start.
     */
    tryStart(idx: number) {
        // check if there is an ongoing expedition, if there isn't, start the
        // desired one. If there is, return an error.
        // can start a new expedition
        const canStart =
            this.current == -1 || Date.now() - this.startTimes[this.current] >= this.completionTime[this.current];

        if (!canStart) {
            throw new Error('Last expedition not finished yet.');
        } else if (this.startTimes[idx] != -1) {
            throw new Error('Expedition has already been finished or started.');
        }
        console.log(`${Date.now() - this.startTimes[this.current]} ${this.completionTime[this.current]} ${canStart}`);

        this.startTimes[idx] = Date.now();
        this.current = idx;
    }

    collectDaily() {
        if (this.isDailyCollected) {
            throw new Error("Already collected today's daily");
        }

        for (let i = 0; i < this.startTimes.length; i++) {
            if (this.startTimes[i] != -2) {
                throw new Error('All expeditions must be collected.');
            }
        }

        this.isDailyCollected = true;
        return true;
    }

    collectReward(idx: number) {
        const now = Date.now();
        const dt = now - this.startTimes[idx];
        const startedAndNotCollected = this.startTimes[idx] != -1 && this.startTimes[idx] != -2;
        const isCompleted = dt >= this.completionTime[idx];

        if (startedAndNotCollected && isCompleted) {
            const reward: ExpeditionReward = {
                money: this.completionTime[idx] / 1000,
                exp: this.completionTime[idx] / 1000,
                items: [],
            };
            this.startTimes[idx] = -2;
            return reward;
        }

        return null;
    }

    collectRewards() {
        const rewards: ExpeditionReward = {
            money: 0,
            exp: 0,
            items: [],
        };
        let completedCount = 0;
        for (let i = 0; i < this.startTimes.length; i++) {
            const reward = this.collectReward(i);
            if (reward) {
                completedCount++;
                rewards.exp += reward.exp;
                rewards.money += reward.money;
                // for (let j = 0; j < reward.items.length; i++) {
                //   rewards.items.push(reward.items[j]);
                // }
            }
        }

        return completedCount > 0 ? rewards : null;
    }

    load(data: firestore.DocumentData) {
        Object.assign(this, data);
    }

    data() {
        return Object.assign({}, this);
    }
}

export interface MissionData {
    name: string;
    body: string;
    icon: string;
}
