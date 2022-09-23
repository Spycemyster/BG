/**
 * Expeditions are a list of tasks that the player can start each day. Only one expedition can be active at any
 * given time and a new list of expeditions are generated at the start of each day. Completing an expedition grants
 * the player an amount of experience points and money/gear.
 */
import { Expeditions } from '../game/expedition';
import { validateFirebaseIdToken, AuthRequest, AuthenticationError } from '../auth-middleware';
import { Response } from 'express';
import * as adminFirestore from 'firebase-admin/firestore';
import { getConfigField } from '../config';
import { Player, PlayerInventory } from '../game/player';

const express = require('express');
const firestore = adminFirestore.getFirestore();
const app = express();
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const cors = require('cors')({ origin: true });
app.use(cors);

app.get('/getList', validateFirebaseIdToken, async function (request: AuthRequest, response: Response) {
    try {
        if (!request.user) {
            throw new Error('Authentication error');
        }
        const NUM_EXPEDITIONS = parseInt(await getConfigField('DailyExpeditions')) || 3;
        //parseInt((config.parameters['DailyExpeditions']?.defaultValue as any).value as string) || 3;
        console.log(`${NUM_EXPEDITIONS} expeditions`);
        const uid = request.user.uid;
        const docRef = firestore.doc(`user_expeditions/${uid}`);
        const docGet = docRef.get();
        const missionList = new Expeditions(uid, NUM_EXPEDITIONS);
        const docData = (await docGet).data();
        if (
            docData === undefined ||
            Date.now() - docData.creationTime >= DAY_IN_MILLISECONDS ||
            docData.missions.length != NUM_EXPEDITIONS
        ) {
            console.log('Generating new mission list');
            await missionList.randomize();
            console.log('Finished generating, setting document fields...');
            await docRef.set(missionList.data());
        } else if (docData) {
            missionList.load(docData);
        } else {
            throw new Error('Something wrong has happened.');
        }
        console.log('Sending mission list');
        response.status(200).send(missionList.data());
    } catch (exception: any) {
        console.error(exception);
        response.status(400).send({
            message: exception.message,
        });
    }
});

app.get('/collectDaily', validateFirebaseIdToken, async function (request: AuthRequest, response: Response) {
    try {
        if (!request.user) {
            throw new AuthenticationError();
        }

        const uid = request.user.uid;
        const result = await Promise.all([
            firestore.doc(`user_data/${uid}`).get(),
            firestore.doc(`user_expeditions/${uid}`).get(),
        ]);
        const userData = result[0].data();
        const expeditionData = result[1].data();
        if (userData === undefined || !result[0].exists) {
            throw new Error("Couldn't load user data");
        } else if (expeditionData === undefined || !result[1].exists) {
            throw new Error("Couldn't load expedition data");
        }
        const expeditions = new Expeditions(uid);
        expeditions.load(expeditionData);
        if (expeditions.collectDaily()) {
            response.status(200).send({
                message: 'success',
            });
            return;
        } else {
            throw new Error('Something went wrong with collecting the daily...');
        }
    } catch (exception: any) {
        console.error(exception);
        response.status(400).send({
            message: exception.message,
        });
    }
});

app.get('/collectReward/:idx', validateFirebaseIdToken, async function (request: AuthRequest, response: Response) {
    try {
        if (!request.user) {
            throw new AuthenticationError();
        }
        const uid = request.user.uid;
        const idx = parseInt(request.params.idx);
        const result = await Promise.all([
            firestore.doc(`user_data/${uid}`).get(),
            firestore.doc(`user_expeditions/${uid}`).get(),
            firestore.doc(`user_inventory/${uid}`).get(),
        ]);
        const userData = result[0].data();
        const expeditionData = result[1].data();
        const inventoryData = result[2].data();

        // error check that we have necessary documents
        if (userData === undefined || !result[0].exists) {
            throw new Error("Couldn't load player document");
        } else if (expeditionData === undefined || !result[1].exists) {
            throw new Error('No missions generated yet.');
        } else if (inventoryData === undefined || !result[2].exists) {
            throw new Error("Couldn't load player inventory document");
        }
        const expeditions = new Expeditions(uid);
        const playerData = new Player(uid);
        const inventory = new PlayerInventory(uid);
        expeditions.load(expeditionData);
        playerData.load(userData);
        inventory.load(inventoryData);

        const rewards = expeditions.collectReward(idx);
        if (rewards) {
            playerData.addExp(rewards.exp);
            rewards.items.forEach((x) => inventory.addItem(x.id, x.quantity));
            // set the data
            await Promise.all([
                firestore.doc(`user_data/${uid}`).set(playerData.data()),
                firestore.doc(`user_expeditions/${uid}`).set(expeditions.data()),
                firestore.doc(`user_inventory/${uid}`).set(inventory.data()),
            ]);
            response.status(200).send(rewards);
        } else {
            throw new Error('No completed expeditions');
        }
    } catch (exception: any) {
        console.error(exception);
        response.status(400).send({
            message: exception.message,
        });
    }
});

app.get('/collectRewards', validateFirebaseIdToken, async function (request: AuthRequest, response: Response) {
    try {
        if (!request.user) {
            throw new AuthenticationError();
        }
        const uid = request.user.uid;
        const result = await Promise.all([
            firestore.doc(`user_data/${uid}`).get(),
            firestore.doc(`user_expeditions/${uid}`).get(),
            firestore.doc(`user_inventory/${uid}`).get(),
        ]);
        const userData = result[0].data();
        const expeditionData = result[1].data();
        const inventoryData = result[2].data();

        // error check that we have necessary documents
        if (userData === undefined || !result[0].exists) {
            throw new Error("Couldn't load player document");
        } else if (expeditionData === undefined || !result[1].exists) {
            throw new Error('No missions generated yet.');
        } else if (inventoryData === undefined || !result[2].exists) {
            throw new Error("Couldn't load player inventory document");
        }
        const expeditions = new Expeditions(uid);
        const playerData = new Player(uid);
        const inventory = new PlayerInventory(uid);
        expeditions.load(expeditionData);
        playerData.load(userData);
        inventory.load(inventoryData);

        const rewards = expeditions.collectRewards();
        if (rewards) {
            playerData.addExp(rewards.exp);
            rewards.items.forEach((x) => inventory.addItem(x.id, x.quantity));
            // set the data
            await Promise.all([
                firestore.doc(`user_data/${uid}`).set(playerData.data()),
                firestore.doc(`user_expeditions/${uid}`).set(expeditions.data()),
                firestore.doc(`user_inventory`).set(inventory.data()),
            ]);
            response.status(200).send(rewards);
        } else {
            throw new Error('No completed expeditions');
        }
    } catch (exception: any) {
        console.error(exception);
        response.status(400).send({
            message: exception.message,
        });
    }
});

app.get('/start/:idx', validateFirebaseIdToken, async function (request: AuthRequest, response: Response) {
    try {
        if (!request.user) {
            throw new Error('Authentication Error');
        }
        const uid = request.user.uid;
        const expeditionDoc = await firestore.doc(`user_expeditions/${uid}`).get();
        const expeditionData = expeditionDoc.data();
        const index = parseInt(request.params.idx);
        if (!expeditionData || !expeditionDoc.exists) {
            throw new Error('No missions generated yet');
        }
        const expedition = new Expeditions(uid);
        expedition.load(expeditionData);
        expedition.tryStart(index);
        await firestore.doc(`user_expeditions/${uid}`).set(expedition.data());
        response.status(200).send({
            message: 'success',
        });
    } catch (exception: any) {
        console.error(exception);
        response.status(400).send({
            message: exception.message,
        });
    }
});

module.exports = app;
