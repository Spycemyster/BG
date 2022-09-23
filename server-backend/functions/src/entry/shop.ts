// const functions = require("firebase-functions");
import { firestore } from 'firebase-admin';
import { validateFirebaseIdToken, AuthRequest } from '../auth-middleware';
import { Response } from 'express';
import express = require('express');
import { Guild } from '../game/character';
import { PlayerInventory, Player } from '../game/player';
import { getItemsList, getMemberList } from '../definitions';
const app = express();
const cors = require('cors')({ origin: true });
app.use(cors);
app.use(validateFirebaseIdToken);

interface GachaRoll {
    type: string;
    item: string;
}

app.get('/rollGacha', (request: AuthRequest, response: Response) => {
    try {
        if (!request.user) {
            throw new Error('Authentication error');
        }
        const uid = request.user.uid;
        const dataRef = firestore().collection('user_data').doc(uid);
        const invRef = firestore().collection('user_inventory').doc(uid);
        const memRef = firestore().collection('user_members').doc(uid);
        firestore().runTransaction(async (transaction) => {
            const [dataDoc, inventoryDoc, membersDoc] = await Promise.all([dataRef.get(), invRef.get(), memRef.get()]);
            const playerData = dataDoc.data();
            const inventoryData = inventoryDoc.data();
            const memberData = membersDoc.data();
            if (!(playerData && inventoryData && memberData))
                throw new Error('Could not load one of the player documents');
            const inventory = new PlayerInventory(uid);
            const player = new Player(uid);
            const guild = new Guild(uid);
            player.load(playerData);
            inventory.load(inventoryData);
            guild.load(memberData);

            // check if the player has enough currency
            if (player.money < 1000) {
                throw new Error('Not enough money');
            }

            const itemDataResponse = {
                rolls: new Array<GachaRoll>(),
            };
            // roll a random item/character
            for (let i = 0; i < 5; i++) {
                const rolled = await _getRandomRoll();
                if (!rolled) {
                    throw { message: 'Rolled item was undefined!' };
                }
                const roll: GachaRoll = { type: rolled.type, item: rolled.data };
                itemDataResponse.rolls.push(roll);
                if (rolled.type === 'item') {
                    await inventory.addItem(rolled.data, 1);
                } else if (rolled.type === 'member') {
                    guild.registerMember(rolled.data);
                }
            }
            player.money -= 1000;
            console.log(`${JSON.stringify(inventory.items)}`);

            const dataPut = transaction.update(dataRef, { money: player.money });
            const invPut = transaction.update(invRef, { items: inventory.items });
            const memPut = transaction.update(memRef, { members: guild.members });
            await Promise.all([dataPut, invPut, memPut]);
            // respond with the newly responded items
            response.send(itemDataResponse);
        });
    } catch (exception: any) {
        console.error(exception);
        response.status(400).send({
            message: exception.message,
        });
    }
});

/**
 * Gets a random item or character.
 * @return {*} { type, data }
 */
async function _getRandomRoll() {
    const value = Math.random();
    let data, type;
    if (value > 0.1) {
        data = await getRandomItem();
        type = 'item';
    } else {
        data = await getRandomMember();
        type = 'member';
    }

    return {
        type: type,
        data: data,
    };
}

/**
 * Generates a random item.
 * @return {*} An item.
 */
async function getRandomItem() {
    const getItemList = getItemsList();
    const items = Array.from(await getItemList);
    return items[Math.floor(Math.random() * items.length)];
}

/**
 * Generates a random member.
 * @return {*} A member.
 */
async function getRandomMember() {
    const getList = getMemberList();
    const memberList = Array.from(await getList);
    return memberList[Math.floor(Math.random() * memberList.length)];
}

module.exports = app;
