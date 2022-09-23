import { auth } from 'firebase-functions';
import { firestore } from 'firebase-admin';
import { Expeditions } from './game/expedition';
import { Guild } from './game/character';
import { Player, PlayerInventory } from './game/player';
import { AuthUserRecord } from 'firebase-functions/lib/common/providers/identity';

export const createAccount = auth.user().beforeCreate(async (user: AuthUserRecord) => {
    console.log(`New user signup from ${user.uid} with email ${user.email}`);
    const dataObj = new Player(user.uid);
    const guildObj = new Guild(user.uid);
    const invObj = new PlayerInventory(user.uid);
    const expeditionObj = new Expeditions(user.uid);
    const data = firestore().doc(`user_data/${user.uid}`).set(dataObj.data());
    const inv = firestore().doc(`user_inventory/${user.uid}`).set(invObj.data());
    const members = firestore().doc(`user_members/${user.uid}`).set(guildObj.data());
    const expeditions = firestore().doc(`user_expeditions/${user.uid}`).set(expeditionObj.data());
    await Promise.all([data, inv, members, expeditions]);
});

export const deleteUser = auth.user().onDelete((user) => {
    console.log(`Deleting user ${user.uid} with email ${user.email}`);
    const uid = user.uid;
    const dataDel = firestore().doc(`user_data/${uid}`).delete();
    const invDel = firestore().doc(`user_inventory/${uid}`).delete();
    const membersDel = firestore().doc(`user_members/${user.uid}`).delete();
    const expeditionDel = firestore().doc(`user_expeditions/${user.uid}`).delete();

    return Promise.all([dataDel, invDel, membersDel, expeditionDel]);
});
