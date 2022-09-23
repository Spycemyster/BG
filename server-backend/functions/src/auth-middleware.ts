import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Request, Response } from 'express';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export interface AuthRequest extends Request {
    user?: DecodedIdToken;
}

export class AuthenticationError extends Error {
    constructor() {
        super('Authentication Error');
    }
}

/**
 * Validates firebase token for the given request.
 * @param {AuthRequest} req - Request
 * @param {Response} res - Response
 * @param {*} next - Next function
 */
export async function validateFirebaseIdToken(req: AuthRequest, res: Response, next: any) {
    functions.logger.log('Check if request is authorized with Firebase ID token');

    if (
        (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)
    ) {
        functions.logger.error('No Firebase ID token was passed as a ', 'Bearer token in the Authorization header.');
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        functions.logger.log("Found 'Authorization' header");
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if (req.cookies) {
        functions.logger.log("Found '__session' cookie");
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        functions.logger.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch (error) {
        functions.logger.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    }
}
