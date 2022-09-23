/**
 * This is the main story that the player will experience. The game is played through a visual novel
 * form. Assets will be stored on the server side and sent to the player when they gain access to
 * them through playing the story. Progressing through the story requires energy resource (which regenerates
 * over a period of time) and PVE combat. The player will sometimes battle against a miniboss to earn resources
 * required to progress through the story.
 */
import { Response } from 'express';
import * as express from 'express';
import { validateFirebaseIdToken, AuthRequest } from '../auth-middleware';
import { getFullStoriesData } from '../definitions';
const app = express();
app.use(validateFirebaseIdToken);

type WorldMeta = {
    name: string;
    icon: string;
};

app.get('/get/:world', async function (request: AuthRequest, response: Response) {
    try {
        const worldId = request.params.world as string;
        const world = await getWorld(worldId);
        if (world) {
            const meta: WorldMeta = { name: world.title, icon: world.icon };
            response.status(200).send(meta);
        } else throw { message: `World ${worldId} not found` };
    } catch (exception: any) {
        console.error(exception);
        response.status(400).send({
            message: exception.message,
        });
    }
});

app.get('/get/:world/:chapter', async function (request: AuthRequest, response: Response) {
    try {
        const worldId = request.params.world as string; // story ID
        const chapterIndex = parseInt(request.params.chapter); // chapter number
        const world = await getWorld(worldId);
        if (!world) throw { message: `World ${worldId} not found` };
        const chapter = world.chapters.at(chapterIndex);
        if (!chapter) {
            throw { message: `Chapter ${chapterIndex} in world ${worldId} not found` };
        }

        response.status(200).send(chapter);
    } catch (exception: any) {
        console.error(exception);
        response.status(400).send({
            message: exception.message,
        });
    }
});

async function getWorld(name: string) {
    const worlds = await getFullStoriesData();
    const world = worlds.get(name);
    return world;
}

module.exports = app;
