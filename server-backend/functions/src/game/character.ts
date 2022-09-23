import * as firestore from 'firebase-admin/firestore';
import { getFullMembersData, Loadable, Rarity } from '../definitions';

export interface GuildTeam {
    members: Array<MemberInstance>;
    maxMembers: number;
}

export enum GuildJob {
    Paladin = 'Paladin',
}

export interface GameStat {
    attack: number;
    defense: number;
    health: number;
}

export interface BaseStats {
    baseAttack: number;
    baseDefense: number;
    baseHealth: number;
    rateAttack: number;
    rateDefense: number;
    rateHealth: number;
}

/**
 * Data that all members have as a constant
 */
export interface MemberData {
    fullName: string;
    id: string;
    nickname: string;
    rarity: Rarity;
    job: GuildJob;
    baseStats: BaseStats;
    biography: string;
    assetFolder: string;
}

/**
 * An instance of a member for the player's guild.
 */
export interface MemberInstance {
    /**
     * Address of the defined member data.
     */
    id: string;
    quantity: number;
    exp: number;
    level: number;
    equipped: any;
}

/**
 * A player guild holds their teams and members. This class is how to manipulate
 * and access the player member-related data.
 */
export class Guild implements Loadable {
    // members: Map<string, GuildMember>;
    // teams: Map<string, GuildTeam>;
    members: any;
    uid: string;
    /**
     * Creates a new instance of a player guild.
     * @param uid
     */
    constructor(uid: string) {
        this.members = {};
        this.uid = uid;
    }

    /**
     * Adds experience points to the guild member.
     * @param {string} id The ID of the guild member.
     * @param {number} quantity The amount of experience points to add.
     * @return {number} The amount of times the member has leveled up.
     */
    async addExpTo(id: string, quantity: number): Promise<number> {
        console.assert(id in this.members, `Member ${id} not found in guild`);
        const member: MemberInstance = this.members[id];
        if (!member) return 0;
        const memberData = (await getFullMembersData()).get(id);
        if (!memberData) return 0;

        // add the exp and level up the player depending on their excess exp
        member.exp += quantity;
        let levelCount = 0;
        let needed = this.getRequiredLevelExp(member.level, memberData.rarity);
        while (member.exp <= needed) {
            levelCount++;
            member.exp -= needed;
            needed = this.getRequiredLevelExp(++member.level, memberData.rarity);
        }

        return levelCount;
    }

    /**
     * Gets the actual stats of the guild member based on their level.
     * @param id ID tag of the guild member
     * @returns The game stat object
     */
    getStats(id: string): GameStat | null {
        const exists = id in this.members;
        console.assert(exists, `Member ${id} is not registered`);
        if (!exists) return null;

        const member = this.members[id];
        if (!member) {
            console.error(`Member ${id} is null`);
            return null;
        }
        const base = member.data.baseStats;
        const level = member.level;
        return {
            attack: base.baseAttack + level * base.rateAttack,
            defense: base.baseDefense + level * base.rateDefense,
            health: base.baseHealth + level * base.rateHealth,
        };
    }

    /**
     * Gets the total required amount of exp to level up a guild member at their
     * specific level and rarity.
     * @param level The level of the guild member
     * @param rarity The rarity of the guild member
     * @returns
     */
    getRequiredLevelExp(level: number, rarity: Rarity): number {
        return ((50000.0 + 10000.0 * rarity) * Math.pow(2, level / 25.0)) / (Math.pow(2, level / 25.0 - 1) + 1.0);
    }

    /**
     * Registers the member to the player guild or adds a count to their quantity if
     * they already exist..
     * @param id The ID of the member that is to be registered.
     * @returns Whether the registration was successful
     */
    registerMember(id: string) {
        if (id in this.members) {
            this.members[id].quantity++;
            return false;
        }
        const member: MemberInstance = { id: id, quantity: 1, exp: 0, level: 1, equipped: {} };
        this.members[id] = member;
        return true;
    }

    load(data: firestore.DocumentData) {
        Object.assign(this, data);
    }

    data() {
        return Object.assign({}, this);
    }
}
