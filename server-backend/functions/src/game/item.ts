import { Rarity } from '../definitions';

export enum ItemType {
    Consumable = 'consumable',
}

/**
 * Data object to describe the stats of a game item.
 */
export interface GameItem {
    id: string;
    rarity: Rarity;
    baseCost: number;
    isStackable: boolean;
    type: ItemType;
    data: object;
    name: string;
}

/**
 * An instance of a stack of game items.
 */
export interface GameItemInstance {
    id: string;
    data: any;
    quantity: number;
}
