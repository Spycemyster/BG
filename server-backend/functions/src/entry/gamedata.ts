// const functions = require("firebase-functions");
import { firestore } from 'firebase-admin';
import { validateFirebaseIdToken, AuthRequest, AuthenticationError } from '../auth-middleware';
import { Response } from 'express';
import express = require('express');
import { getFullItemsData, getFullMembersData, getFullStrippedStoriesData, StrippedStoryWorld } from '../definitions';
import { MemberData } from '../game/character';
import { GameItem } from '../game/item';
const app = express();
const cors = require('cors')({ origin: true });
app.use(cors);
app.use(validateFirebaseIdToken);

/**
 * Sends the player data to the given response.
 * @param {string} uid The unique user id.
 * @param {Response} response The response.
 */
function _sendPlayerData(uid: string, response: Response) {
    const getData = firestore().doc(`user_data/${uid}`).get();
    const getInv = firestore().doc(`user_inventory/${uid}`).get();
    const getMembers = firestore().doc(`user_members/${uid}`).get();
    Promise.all([getData, getInv, getMembers])
        .then((values) => {
            const playerInfo = {
                playerdata: values[0].data(),
                inventory: values[1].data(),
                members: values[2].data(),
            };
            response.send(playerInfo);
        })
        .catch((reason) => {
            console.error(reason);
            response.status(400).send({
                message: reason.message,
            });
        });
}

app.get('/getPlayerData', (request: AuthRequest, response: Response) => {
    if (!request.user) {
        throw new AuthenticationError();
    }
    const uid = request.user.uid;
    _sendPlayerData(uid, response);
});

app.get('/getMemberDataList', (request: AuthRequest, response: Response) => {
    if (!request.user) {
        throw new AuthenticationError();
    }
    getFullMembersData()
        .then((value: Map<string, MemberData>) => {
            response.send(Object.fromEntries(value));
        })
        .catch((exception) => {
            console.error(exception);
            response.status(400).send({
                message: exception.message,
            });
        });
});

app.get('/getItemList', (request: AuthRequest, response: Response) => {
    if (!request.user) {
        throw new AuthenticationError();
    }
    getFullItemsData()
        .then((value: Map<string, GameItem>) => {
            response.send(Object.fromEntries(value));
        })
        .catch((exception) => {
            console.error(exception);
            response.status(400).send({
                message: exception.message,
            });
        });
});

app.get('/getWorldList', (request: AuthRequest, response: Response) => {
    if (!request.user) {
        throw new AuthenticationError();
    }
    getFullStrippedStoriesData()
        .then((value: Map<string, StrippedStoryWorld>) => {
            response.send(Object.fromEntries(value));
        })
        .catch((exception) => {
            console.error(exception);
            response.status(400).send({
                message: exception.message,
            });
        });
});

module.exports = app;
