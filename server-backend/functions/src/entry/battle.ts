/**
 * The battle system takes in a list of player team members and their initial placements on a grid. The initial positions are
 * then run through a simulator that generates a list of states that occur. Each entity does something each "tick". The results
 * are then sent back to the player and displayed client-side. The only player input occurs in planning out their team placements.
 */
import { Response } from 'express';
import * as express from 'express';
import * as cors from 'cors';
import { AuthenticationError, AuthRequest, validateFirebaseIdToken } from '../auth-middleware';
import * as admin from 'firebase-admin';
import { GuildTeam, MemberInstance } from '../game/character';
import { mod } from '../bgmath';
import { EnemyStageData, getEnemy } from '../definitions';
const app = express();
app.use(cors({ origin: true }));
app.use(validateFirebaseIdToken);

const BATTLE_EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 1 day

export interface CombatSessionData {
    id: string;
    seed: number;
    playerTeam: MemberInstance[];
    enemyTeam: EnemyStageData;
    expireAt: number;
    flags?: any;
}

app.get("/resume", async (request: AuthRequest, response: Response) => {
    if (!request.user) {
        throw new AuthenticationError();
    }
    const uid = request.user.uid;
    const session = await admin.firestore().doc(`combat_sessions/${uid}`).get();
    if (!session.exists) {
        response.status(400).send({
            message: "No session found.",
        });
        return;
    }
    const data = session.data() as CombatSessionData;
    if (data.expireAt < Date.now()) {
        response.status(400).send({
            message: "Session expired.",
        });
        return;
    }
    response.send(data);
});


app.post('/start', async function (request: AuthRequest, response: Response) {
    if (!request.user) {
        throw new AuthenticationError();
    }
    try {
        const firestore = admin.firestore();
        const uid = request.user.uid;
        const sessionExistCheck = firestore.collection('combat_sessions').doc(uid).get();
        const playerTeamGet = firestore.collection('user_members').doc(uid).get();
        if ((await sessionExistCheck).exists) {
            throw new Error('You already have a battle in progress');
        }
        // create a session document that contains the player's used team and other
        // combat data. The session document will be used to track the battle's progress
        // and expire after a certain time.
        const playerGuild = (await playerTeamGet).data();
        if (!playerGuild) {
            throw new Error('Could not load player guild');
        }
        const playerTeam = request.body.team as string[];
        console.log(`Player executing battle with team ${playerTeam}`);
        const enemyTeam = (await getEnemy('test_enemy')) as EnemyStageData;
        if (!enemyTeam) {
            throw new Error('Could not load enemy team');
        }
        if (!playerTeam) {
            throw new Error("Could not load player's team");
        }
        const team = new Array<MemberInstance>();
        for (let i = 0; i < playerTeam.length; i++) {
            const member = playerGuild.members[playerTeam[i]];
            if (!member) {
                throw new Error('Could not load player team member');
            }
            team.push(member);
        }
        const sessionData: CombatSessionData = {
            id: uid,
            seed: Math.floor(Math.random() * mod),
            expireAt: Date.now() + BATTLE_EXPIRATION_TIME,
            playerTeam: team,
            enemyTeam: enemyTeam,
        };
        await firestore.collection('combat_sessions').doc(uid).set(sessionData);
        response.send(sessionData);
    } catch (error) {
        response.status(500).send(error);
    }
});

app.get('/tryWin', async function (request: AuthRequest, response: Response) {
    if (!request.user) {
        throw new AuthenticationError();
    }
    try {
        const uid = request.user.uid;
        const firestore = admin.firestore();

        // verify that the player's moves were legitimate and that it results in
        // a win for the player
        const sessionData = await firestore.collection('combat_sessions').doc(uid).get();
        const sessionDataRaw = sessionData.data() as CombatSessionData;
        if (!sessionData.exists) {
            throw new Error('You do not have a battle in progress');
        }
        else if (sessionDataRaw.expireAt < Date.now()) {
            await firestore.collection('combat_sessions').doc(uid).delete();
            throw new Error('Your battle has expired');
        }
        const moveData = request.body.moveData;
        if (!verifyVictory(moveData)) {
            throw new Error('Invalid move data');
        }
    } catch (error) {
        response.status(500).send(error);
    }
});

app.post('/tryLose', async function (request: AuthRequest, response: Response) {
    if (!request.user) {
        throw new AuthenticationError();
    }

    // searches for the current battle session and ends it
    try {
        const firestore = admin.firestore();
        const uid = request.user.uid;
        const sessionDoc = await firestore.collection('combat_sessions').doc(uid).get();
        if (!sessionDoc.exists) {
            throw new Error('No ongoing battle at the moment');
        }
        await firestore.collection('combat_sessions').doc(uid).delete();
    } catch (error) {
        response.status(500).send(error);
    }
});

/**
 * Runs unit tests on the player's move data and verifies that it is valid.
 * @param moveData the player move data
 */
function verifyVictory(moveData: any) {
    // TODO: implement
    return true;
}

module.exports = app;
