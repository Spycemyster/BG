// import * as test from "firebase-functions-test";

//const test = testFn();
//import * as assert from "assert";
import * as entry from '../index';
//import * as admin from "firebase-admin";
import * as supertest from 'supertest';
import * as assert from 'assert';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { describe } from 'mocha';
import * as firebase from 'firebase/app';
import { GuildJob, GuildTeam } from '../game/character';
import { Board, simulateBattle } from '../game/battle/board';
import * as util from 'util';

function print(text: string) {
    console.log(`TEST: ${text}`);
}

const bytes = (s: string) => {
    return ~-encodeURI(s).split(/%..|./).length;
};

const jsonSize = (s: any) => {
    return bytes(JSON.stringify(s));
};

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

describe('Cloud Functions', function () {
    this.timeout(60000);
    // const functionsTest = test(firebaseConfig,
    //     "C:/CS/Godot/ProjectBG/server-backend/functions/bggamedatabase.json");

    // it('Adventure - Get World', async () => {
    //     const request = supertest(entry.adventure);
    //     const actual = await request.get('/get/world0').set({
    //         authorization: `Bearer ${authorizationId}`,
    //     });
    //     const { ok, status, body } = actual;
    //     print(JSON.stringify(body));
    //     assert(ok);
    //     assert(status >= 200 && status < 300);
    //     assert(body != undefined);
    // });

    // it('Expedition - Get List', async function () {
    //     print('Hello World');
    //     const request = supertest(entry.expeditions);
    //     const actual = await request.get('/getList').set({
    //         authorization: `Bearer ${authorizationId}`,
    //     });
    //     const { ok, status, body } = actual;
    //     print(JSON.stringify(body));
    //     assert(ok);
    //     assert(status >= 200 && status < 300);
    //     assert(body != undefined);
    // });
    let authorizationId: string;
    before(async () => {
        firebase.initializeApp(firebaseConfig);
        const authentication = getAuth();
        const signin = signInWithEmailAndPassword(authentication, 'spencerchang2001@gmail.com', 'qweqweqwe');
        const authToken = await signin;
        const getToken = authToken.user.getIdToken();
        authorizationId = await getToken;
    });

    it('Battle - Test', async function (done) {
        const request = supertest(entry.battle);
        const actual = await request.get('/test').set({
            authorization: `Bearer ${authorizationId}`,
        });
        const { ok, status, body } = actual;
        print(JSON.stringify(body));
        assert(ok);
        assert(status >= 200 && status < 300);
        assert(body != undefined);
        print('Hello World');
        done();
    });
});
/*
describe('BFS', function () {
    const board = new boardDef.Board(10, 10, 4);
    it('Bottom Left to Top Right', function () {
        const start = { x: 0, y: 0 };
        const end = { x: 9, y: 9 };
        boardDef.getBFSPath(start, end, board);
    });
    it('Moving Right by One', function () {
        const start = { x: 1, y: 1 };
        const end = { x: 2, y: 1 };
        boardDef.getBFSPath(start, end, board);
    });
    it('Moving up from odd', function () {
        const start = { x: 0, y: 1 };
        const end = { x: 0, y: 2 };
        const path = boardDef.getBFSPath(start, end, board);
        assert(path != null);
        assert(path.length == 2);
        assert(path[0].position.x == 0 && path[0].position.y == 1);
        assert(path[1].position.x == 0 && path[1].position.y == 2);
        assert(path[1].direction == 2);
    });

    it('Moving up from even', function () {
        const start = { x: 0, y: 0 };
        const end = { x: 0, y: 1 };
        const path = boardDef.getBFSPath(start, end, board);
        assert(path != null);
        assert(path.length == 2);
        assert(path[0].position.x == 0 && path[0].position.y == 0);
        assert(path[1].position.x == 0 && path[1].position.y == 1);
        assert(path[1].direction == 1);
    });

    it('Moving 1 space from odd y', function () {
        const start = { x: 1, y: 1 };
        const tests = [];
        const right = boardDef.getBFSPath(start, { x: 2, y: 1 }, board);
        const topRight = boardDef.getBFSPath(start, { x: 2, y: 2 }, board);
        const topLeft = boardDef.getBFSPath(start, { x: 1, y: 2 }, board);
        const left = boardDef.getBFSPath(start, { x: 0, y: 1 }, board);
        const bottomLeft = boardDef.getBFSPath(start, { x: 1, y: 0 }, board);
        const bottomRight = boardDef.getBFSPath(start, { x: 2, y: 0 }, board);
        tests.push(right);
        tests.push(topRight);
        tests.push(topLeft);
        tests.push(left);
        tests.push(bottomLeft);
        tests.push(bottomRight);
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            assert(test != null);
            assert(test.length == 2);
        }
    });

    it('Moving 1 space from even y', function () {
        const start = { x: 1, y: 2 };
        const tests = [];
        const right = boardDef.getBFSPath(start, { x: 2, y: 2 }, board);
        const topRight = boardDef.getBFSPath(start, { x: 1, y: 3 }, board);
        const topLeft = boardDef.getBFSPath(start, { x: 0, y: 3 }, board);
        const left = boardDef.getBFSPath(start, { x: 0, y: 2 }, board);
        const bottomLeft = boardDef.getBFSPath(start, { x: 0, y: 1 }, board);
        const bottomRight = boardDef.getBFSPath(start, { x: 1, y: 1 }, board);
        tests.push(right);
        tests.push(topRight);
        tests.push(topLeft);
        tests.push(left);
        tests.push(bottomLeft);
        tests.push(bottomRight);
        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            assert(test && test.length == 2);
        }
    });

    it('Impossible Start', function () {
        const start = { x: 0, y: -2 };
        const end = { x: 3, y: 2 };
        const path = boardDef.getBFSPath(start, end, board);
        assert(path && path.length == 0);
    });
});
*/

// describe('Battle Functions', async () => {
//     const board = new Board(10, 7, 3);
//     const testMember = {
//         fullName: '',
//         nickname: '',
//         rarity: Rarity.Common,
//         job: GuildJob.Paladin,
//         baseStats: {
//             baseAttack: 1,
//             baseDefense: 1,
//             baseHealth: 1,
//             rateAttack: 1,
//             rateDefense: 1,
//             rateHealth: 1,
//         },
//         biography: '',
//         equipped: null,
//         assetFolder: '',
//     };
//     it('Simulate', () => {
//         const teamA: GuildTeam = {
//             maxMembers: 2,
//             members: [
//                 {
//                     data: testMember,
//                     position: { x: 0, y: 0 },
//                     level: 1,
//                 },
//             ],
//         };
//         const teamB: GuildTeam = {
//             maxMembers: 2,
//             members: [
//                 {
//                     data: testMember,
//                     position: { x: 0, y: 0 },
//                     level: 1,
//                 },
//             ],
//         };
//         const result = simulateBattle(teamA, teamB, board);
//         // console.log(util.inspect(result, { showHidden: false, depth: null, colors: true }));
//         // console.log(jsonSize(result));
//     });
// });

// request(myFunctions.adventure)
//     .get('')
//     .auth('spencerchang2001@gmail.com', 'qweqweqwe')
//     .expect(200)
//     .end((err, res) => {
//         console.log(res);
//     });
