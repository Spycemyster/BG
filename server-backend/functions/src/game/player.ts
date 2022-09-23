import { getFullItemsData, Loadable } from '../definitions';
import { GameItemInstance } from './item';

export class Player implements Loadable {
    /**
     * In-game display name
     */
    username: string;

    /**
     * Link to the database identifier
     */
    uid: string;

    /**
     * Level of the player
     */
    level: number;

    /**
     * Amount of experience points in the CURRENT level
     */
    exp: number;

    /**
     * Amount of regular currency
     */
    money: number;

    /**
     * Whether the player has used cheat functions.
     */
    isCheater: boolean;

    /**
     * Whether the player has finished the tutorial.
     */
    isNewPlayer?: boolean;

    /**
     * Creates a new default player object.
     * @param uid
     */
    constructor(uid: string) {
        this.username = 'New Adventuer';
        this.level = 1;
        this.exp = 0;
        this.money = 100;
        this.isCheater = false;
        this.isNewPlayer = true;
        this.uid = uid;
    }

    /**
     * Updates a rechargable resource
     * @param resource The resource to be updated.
     * @param rate The amount of resources recharged per second.
     */
    updateRechargeable(resource: RechargeableResource, rate: number) {
        const now = Date.now();
        const dt = (now - resource.lastUpdate) / 1000;
        resource.amount = Math.min(resource.maxAmount, rate * dt + resource.amount);
        resource.lastUpdate = now;
    }

    /**
     * Adds experience points to the player.
     * @param quantity The amount of experience points to grant.
     * @returns The amount of times the player levels up.
     */
    addExp(quantity: number) {
        this.exp += quantity;
        let req = this.getRequiredExp();
        let levelCount = 0;
        while (this.exp >= req) {
            this.exp -= req;
            levelCount++;

            // level up
            this.level++;

            // recalculate for new level
            req = this.getRequiredExp();
        }

        return levelCount;
    }

    /**
     * Calculates the amount of experience points needed to level up the player at
     * their current level.
     * @returns The amount of experience points needed to level up the player.
     */
    getRequiredExp() {
        return getRequiredLevelExp(this.level);
    }

    load(data: FirebaseFirestore.DocumentData): void {
        Object.assign(this, data);
    }
    data() {
        return Object.assign({}, this);
    }
}

/**
 * Calculates the amount of experience points needed to level up at the given level.
 * @param level The level the player is at.
 * @returns The amount of exp points needed to level up at the given level.
 */
function getRequiredLevelExp(level: number) {
    // formula is f(x) = 100_000 * 2^{x/20}/(2^{x/20-1}+1)
    // for f(x) is the amount of exp needed to level up at level x
    return (100.0 * Math.pow(2, level / 20)) / (Math.pow(2, level / 20 - 1) + 1.0);
}

export interface RechargeableResource {
    amount: number;
    maxAmount: number;
    lastUpdate: number;
}

export class PlayerInventory implements Loadable {
    items: any; // map of items: item: {quantity: number, data: any, id: string}
    uid: string;
    constructor(uid: string) {
        this.items = {};
        this.uid = uid;
    }
    /**
     * Adds the item to the player inventory.
     * @param {string} item The name added item
     * @param {number} quantity The quantity to add to the inventory
     * @param {string} uniqueName The unique name of the item (if it is unique).
     */
    async addItem(item: string, quantity: number, uniqueName = '') {
        const itemData = (await getFullItemsData()).get(item);
        if (itemData === undefined) {
            throw new Error(`Item ${item} does not exist.`);
        }
        if (itemData.isStackable) {
            if (this.items[item]) {
                // we have an instance of the item
                this.items[item].quantity += quantity;
            } else {
                const instance: GameItemInstance = { quantity: quantity, data: {}, id: item };
                this.items[item] = instance;
            }
        } else {
            throw new Error('Not implemented');
        }
    }

    load(data: FirebaseFirestore.DocumentData) {
        Object.assign(this, data);
    }

    data() {
        return Object.assign({}, this);
    }
}
