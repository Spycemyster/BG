import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as config from './config';
import * as definitions from './definitions';
import { MemberData } from './game/character';
import { MissionData } from './game/expedition';
import { GameItem } from './game/item';

///* Uncomment this out for mocha testing
const firebaseConfig = {
    apiKey: 'AIzaSyD2QG19uXU0rlQ1R1wscvHzt2O6UEM9iCQ',
    authDomain: 'bggamedatabase.firebaseapp.com',
    databaseURL: 'https://bggamedatabase-default-rtdb.firebaseio.com',
    projectId: 'bggamedatabase',
    storageBucket: 'bggamedatabase.appspot.com',
    messagingSenderId: '612518883601',
    appId: '1:612518883601:web:1f419b9b16af8833355cb0',
    measurementId: 'G-8ER0DK08QM',
};
admin.initializeApp(firebaseConfig);
//*/
//admin.initializeApp();
admin
    .remoteConfig()
    .getTemplate()
    .then((value) => config.setConfigData(value));

// api routes
export const cheats = functions.https.onRequest(require('./entry/cheats'));
export const expeditions = functions.https.onRequest(require('./entry/expeditions'));
export const shop = functions.https.onRequest(require('./entry/shop'));
export const gamedata = functions.https.onRequest(require('./entry/gamedata'));
export const adventure = functions.https.onRequest(require('./entry/adventure'));
export const battle = functions.https.onRequest(require('./entry/battle'));

// account creation/deletion triggers
const account = require('./account');
exports.createAccount = account.createAccount;
exports.deleteAccount = account.deleteUser;
exports.updateConfig = functions.remoteConfig.onUpdate(() => {
    admin
        .remoteConfig()
        .getTemplate()
        .then((value) => {
            config.setConfigData(value);
        });
});

// data triggers
exports.onNewMemberAdded = functions.firestore.document('def_characters/{characterId}').onCreate((snap, context) => {
    const newValue = snap.data();
    const id = context.params.characterId;
    definitions.updateMemberData(id, newValue as MemberData).then(() => {
        console.log(`Added member ${id} with data: ${JSON.stringify(definitions.getMember(id))}`);
    });
});

exports.onMemberUpdated = functions.firestore.document('def_characters/{characterId}').onUpdate((change, context) => {
    const newValue = change.after.data();
    const id = context.params.characterId;
    definitions.updateMemberData(id, newValue as MemberData).then(() => {
        console.log(`Updated member ${id} with new data: ${JSON.stringify(definitions.getMember(id))}`);
    });
});

exports.onNewMissionAdded = functions.firestore.document('def_expeditions/{missionId}').onCreate((snap, context) => {
    const newValue = snap.data();
    const id = context.params.missionId;
    definitions.updateExpeditionData(id, newValue as MissionData).then(() => {
        console.log(`Added mission ${id} with data: ${JSON.stringify(definitions.getExpedition(id))}`);
    });
});

exports.onMissionUpdated = functions.firestore.document('def_expeditions/{missionId}').onUpdate((change, context) => {
    const newValue = change.after.data();
    const id = context.params.missionId;
    definitions.updateExpeditionData(id, newValue as MissionData).then(() => {
        console.log(`Updated mission ${id} with new data: ${JSON.stringify(definitions.getExpedition(id))}`);
    });
});

exports.onNewItemAdded = functions.firestore.document('def_items/{itemId}').onCreate((snap, context) => {
    const newValue = snap.data();
    const id = context.params.itemId;
    definitions.updateItemData(id, newValue as GameItem).then(() => {
        console.log(`Added item ${id} with data ${JSON.stringify(definitions.getItem(id))}`);
    });
});

exports.onItemUpdated = functions.firestore.document('def_items/{itemId}').onUpdate((change, context) => {
    const newValue = change.after.data();
    const id = context.params.itemId;
    definitions.updateItemData(id, newValue as GameItem).then(() => {
        console.log(`Updated item ${id} with new data ${JSON.stringify(definitions.getItem(id))}`);
    });
});

exports.onNewStoryAdded = functions.firestore.document('def_stories/{storyId}').onCreate((snap, context) => {
    const newValue = snap.data();
    const name = context.params.storyId;
    definitions.updateStoryData(name, newValue as definitions.StoryWorld).then(() => {
        console.log(`Added story ${name} with data ${JSON.stringify(definitions.getStory(name))}`);
    });
});

exports.onStoryUpdated = functions.firestore.document('def_stories/{storyId}').onUpdate((change, context) => {
    const newValue = change.after.data();
    const name = context.params.storyId;
    definitions.updateStoryData(name, newValue as definitions.StoryWorld).then(() => {
        console.log(`Updated story ${name} with new data ${JSON.stringify(definitions.getStory(name))}`);
    });
});

exports.onEnemyStageUpdated = functions.firestore.document('def_enemies/{enemyId}').onUpdate((change, context) => {
    const newValue = change.after.data();
    const id = context.params.enemyId;
    definitions.updateEnemyData(id, newValue as definitions.EnemyStageData).then(() => {
        console.log(`Updated enemy ${id} with new data ${JSON.stringify(definitions.getEnemy(id))}`);
    });
});

exports.onEnemyStageAdded = functions.firestore.document('def_enemies/{enemyId}').onCreate((snap, context) => {
    const newValue = snap.data();
    const id = context.params.enemyId;
    definitions.updateEnemyData(id, newValue as definitions.EnemyStageData).then(() => {
        console.log(`Added enemy ${id} with data ${JSON.stringify(definitions.getEnemy(id))}`);
    });
});
