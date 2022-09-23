import * as firestore from 'firebase-admin/firestore';
import { Loadable } from '../definitions';
import { GameItem } from './item';

export class PlayerInventory implements Loadable {
    items: any;
    uid: string;
    constructor(uid: string) {
        this.items = {};
        this.uid = uid;
    }
    /**
     * Adds the item to the player inventory. Quantity is controlled by the
     * item.quantity
     * @param {GameItem} item The added item
     * @param {number} quantity The quantity to add to the inventory
     */
    addItem(item: GameItem, quantity: number) {
        if (item.isStackable) {
            const existing = item.id in this.items;
            if (existing) {
                this.items[item.id].quantity += quantity;
            } else {
                this.items[item.id] = { item: item, quantity: quantity };
            }
        } else {
            // TODO: design and implement unique/unstackable items
            console.error('Not implemented yet...');
        }
    }

    load(data: firestore.DocumentData) {
        Object.assign(this, data);
    }

    data() {
        return Object.assign({}, this);
    }
}
