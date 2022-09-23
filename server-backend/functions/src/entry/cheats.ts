// these are commands that give the player some cheating level functionality, usually for debug purposes
import { Response } from 'express';
import * as express from 'express';
import admin = require('firebase-admin');
const app = express();
import { validateFirebaseIdToken, AuthRequest } from '../auth-middleware';
const cors = require('cors')({ origin: true });
app.use(cors);
app.use(validateFirebaseIdToken);

app.get('/addMoney/:amount', async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) throw new Error('Error with authentication');
        const uid = req.user.uid;

        const amount = parseInt(req.params.amount);
        console.log(`Giving player ${uid} $${amount}`);
        if (amount == 0) {
            res.status(200).send({
                message: 'Success, but nothing was added :p',
            });
            return;
        }
        await markAsCheater(uid);
        const firestore = admin.firestore();
        const playerRef = firestore.collection('user_data').doc(uid);
        await playerRef.update({
            money: admin.firestore.FieldValue.increment(amount),
        });
        console.log(`Gave player ${uid} $${amount}`);
        res.status(200).send();
    } catch (exception: any) {
        console.error(exception);
        res.status(400).send({
            message: exception.message,
        });
    }
});

app.get('/setMoney/:amount', async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) throw new Error('Error with authentication');
        const uid = req.user.uid;
        const amount = parseInt(req.params.amount);
        console.log(`Setting player ${uid} money to $${amount}`);
        await markAsCheater(uid);
        const playerRef = admin.firestore().doc(`user_data/${uid}`);
        await playerRef.update({ money: amount });
        console.log(`Set player ${uid} money to $${amount}`);
        res.status(200).send({
            message: 'Success',
        });
    } catch (exception: any) {
        console.error(exception);
        res.status(400).send({
            message: exception.message,
        });
    }
});

/**
 * Marks the player as a cheater.
 * @param {string} uid The UID of the player.
 */
async function markAsCheater(uid: string) {
    console.log(`Marking player ${uid} as a cheater`);
    const playerRef = admin.firestore().doc(`user_data/${uid}`);
    return playerRef.set({ isCheater: true }, { merge: true });
}

module.exports = app;
